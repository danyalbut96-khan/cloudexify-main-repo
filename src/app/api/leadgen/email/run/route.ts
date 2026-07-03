import { createClient, getAdminClient } from '@/lib/supabase/server';
import { getStoredCredential, callOpenRouter, acquireAgentLock, releaseAgentLock } from '@/lib/ai/openrouter';
import { sendOutreachEmail } from '@/lib/outreach/email';
import { isRateLimited } from '@/lib/utils';
import { logAction } from '@/lib/server-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Support CRON authentication
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  let adminEmail = 'system@vercel-cron.local';
  if (!isCron) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    adminEmail = user.email!;
  }

  // 1. Acquire global Email Agent lock
  const lockAcquired = await acquireAgentLock('agent_2_email');
  if (!lockAcquired) {
    return NextResponse.json({ success: true, message: 'Email outreach agent (Agent 2) is already running. Tick skipped.' });
  }

  try {
    const adminClient = getAdminClient();

    // 2. Fetch Email Stage config
    const { data: stageConfig } = await adminClient
      .from('pipeline_stage_config')
      .select('*')
      .eq('stage_key', 'email')
      .single();

    if (!stageConfig) {
      throw new Error('Pipeline stage configuration for email is missing.');
    }

    if (!stageConfig.enabled) {
      return NextResponse.json({ error: 'Email outreach stage is currently disabled.' }, { status: 400 });
    }

    // 3. Verify Email Domain credentials
    const { data: emailCreds } = await adminClient
      .from('api_credentials')
      .select('*')
      .eq('provider', 'email_smtp')
      .single();

    if (!emailCreds || !emailCreds.is_verified) {
      return NextResponse.json({ error: 'Email sending is blocked. Sending domain DNS records must be verified first.' }, { status: 400 });
    }

    const config = stageConfig.config || {};
    const dailyLimit = config.daily_send_limit || 30;

    // 4. Check daily send quota
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count: sentToday, error: countError } = await adminClient
      .from('outreach_events')
      .select('*', { count: 'exact', head: true })
      .eq('channel', 'email')
      .eq('direction', 'outbound')
      .gte('created_at', startOfToday.toISOString());

    if (countError) {
      throw new Error(`Failed to check email quota: ${countError.message}`);
    }

    const remainingQuota = dailyLimit - (sentToday || 0);
    if (remainingQuota <= 0) {
      return NextResponse.json({ success: true, message: 'Daily email quota reached for today.' });
    }

    // 5. Query candidate prospects with email and status = 'ready_for_outreach'
    const { data: leads, error: leadsError } = await adminClient
      .from('leads')
      .select('*')
      .eq('status', 'ready_for_outreach')
      .not('email', 'is', null)
      .is('locked_by', null)
      .order('google_rating', { ascending: false })
      .limit(Math.min(remainingQuota, 5));

    if (leadsError) {
      throw new Error(`Failed to fetch leads for outreach: ${leadsError.message}`);
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, message: 'No prospects with email addresses found ready for outreach.' });
    }

    // Resolve model parameters
    const model = stageConfig.openrouter_model || 'openai/gpt-4o-mini';
    const rawPrompt = stageConfig.system_prompt || 'Write a warm cold outreach email to a local business owner.';
    
    // Fetch WhatsApp sender number to populate template
    const gupshupCreds = await getStoredCredential('gupshup');
    const companyWhatsApp = gupshupCreds?.sourceNumber || '+92 341 1949277';
    const systemPrompt = rawPrompt.replace('{{whatsapp_number}}', companyWhatsApp);

    let sentCount = 0;
    const outreachLog: any[] = [];

    // 6. Process outreach per lead (with per-lead lock)
    for (const lead of leads) {
      // Call Supabase RPC try_lock_lead
      const { data: lockOk, error: lockErr } = await adminClient.rpc('try_lock_lead', {
        p_lead_id: lead.id,
        p_agent: 'agent_2'
      });

      if (lockErr || !lockOk) {
        console.warn(`Lead ${lead.id} lock acquisition failed, skipping.`);
        continue;
      }

      try {
        const leadContext = {
          business_name: lead.business_name,
          category: lead.category,
          google_rating: lead.google_rating,
          google_review_count: lead.google_review_count,
          personalization_detail: lead.personalization_detail
        };

        // Call OpenRouter for content draft
        const result = await callOpenRouter({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(leadContext) }
          ]
        });

        // Parse JSON safely
        let cleaned = result.trim();
        if (cleaned.startsWith('```')) {
          cleaned = cleaned.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
        }
        const { subject, body } = JSON.parse(cleaned);

        // Send email via Resend client
        await sendOutreachEmail({ to: lead.email, subject, body });

        // Save outreach event log
        await adminClient.from('outreach_events').insert({
          lead_id: lead.id,
          channel: 'email',
          direction: 'outbound',
          content: body,
          status: 'sent'
        });

        // Set status to 'emailed' and release lock
        await adminClient
          .from('leads')
          .update({
            status: 'emailed',
            locked_by: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);

        sentCount++;
        outreachLog.push({ id: lead.id, business: lead.business_name, email: lead.email });

      } catch (err: any) {
        console.error(`Email outreach failed for lead ${lead.id}:`, err);
        // Release lead lock on exception so others can process
        await adminClient
          .from('leads')
          .update({ locked_by: null })
          .eq('id', lead.id);
      }
    }

    await logAction(
      adminEmail,
      `Agent 2 (Email Outreach) completed: dispatched ${sentCount} cold outreach emails.`,
      'leads',
      'agent_2_run'
    );

    return NextResponse.json({
      success: true,
      sent: sentCount,
      outreach: outreachLog
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    // 7. Release agent lock
    await releaseAgentLock('agent_2_email');
  }
}
