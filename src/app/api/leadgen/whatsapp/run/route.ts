import { createClient, getAdminClient } from '@/lib/supabase/server';
import { getStoredCredential, callOpenRouter, acquireAgentLock, releaseAgentLock } from '@/lib/ai/openrouter';
import { sendOutreachWhatsApp } from '@/lib/outreach/whatsapp';
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

  // 1. Acquire global WhatsApp Agent lock
  const lockAcquired = await acquireAgentLock('agent_3_whatsapp');
  if (!lockAcquired) {
    return NextResponse.json({ success: true, message: 'WhatsApp outreach agent (Agent 3) is already running. Tick skipped.' });
  }

  try {
    const adminClient = getAdminClient();

    // 2. Fetch WhatsApp Stage config
    const { data: stageConfig } = await adminClient
      .from('pipeline_stage_config')
      .select('*')
      .eq('stage_key', 'whatsapp')
      .single();

    if (!stageConfig) {
      throw new Error('Pipeline stage configuration for WhatsApp is missing.');
    }

    if (!stageConfig.enabled) {
      return NextResponse.json({ error: 'WhatsApp outreach stage is currently disabled.' }, { status: 400 });
    }

    // 3. Verify Gupshup WhatsApp credentials
    const { data: waCreds } = await adminClient
      .from('api_credentials')
      .select('*')
      .eq('provider', 'gupshup')
      .single();

    if (!waCreds || !waCreds.is_verified) {
      return NextResponse.json({ error: 'WhatsApp outreach is blocked. Gupshup credentials must be fully verified.' }, { status: 400 });
    }

    // 4. Query prospects with status = 'ready_for_outreach', no email on file, and has_whatsapp = true
    const { data: leads, error: leadsError } = await adminClient
      .from('leads')
      .select('*')
      .eq('status', 'ready_for_outreach')
      .is('email', null)
      .eq('has_whatsapp', true)
      .is('locked_by', null)
      .order('google_rating', { ascending: false })
      .limit(3);

    if (leadsError) {
      throw new Error(`Failed to fetch prospects for WhatsApp outreach: ${leadsError.message}`);
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, message: 'No prospects without email addresses found ready for WhatsApp outreach.' });
    }

    // Resolve model parameters
    const model = stageConfig.openrouter_model || 'openai/gpt-4o-mini';
    const rawPrompt = stageConfig.system_prompt || 'Write a short warm first-touch WhatsApp outreach message to a local business.';
    const systemPrompt = rawPrompt.replace('{{mode}}', 'first_touch');

    let sentCount = 0;
    const outreachLog: any[] = [];

    // 5. Process outreach per lead (with per-lead lock)
    for (const lead of leads) {
      // Call Supabase RPC try_lock_lead
      const { data: lockOk, error: lockErr } = await adminClient.rpc('try_lock_lead', {
        p_lead_id: lead.id,
        p_agent: 'agent_3'
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

        // Call OpenRouter for WhatsApp copy
        const message = await callOpenRouter({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(leadContext) }
          ]
        });

        const cleanedMessage = message.trim();

        // Send WhatsApp outreach via Gupshup
        await sendOutreachWhatsApp({
          to: lead.phone,
          businessName: lead.business_name,
          personalizationDetail: lead.personalization_detail || ''
        });

        // Save outreach event log
        await adminClient.from('outreach_events').insert({
          lead_id: lead.id,
          channel: 'whatsapp',
          direction: 'outbound',
          content: cleanedMessage,
          status: 'sent'
        });

        // Set status to 'followed_up' and release lock
        await adminClient
          .from('leads')
          .update({
            status: 'followed_up',
            locked_by: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);

        sentCount++;
        outreachLog.push({ id: lead.id, business: lead.business_name, phone: lead.phone });

      } catch (err: any) {
        console.error(`WhatsApp outreach failed for lead ${lead.id}:`, err);
        // Release lead lock on exception
        await adminClient
          .from('leads')
          .update({ locked_by: null })
          .eq('id', lead.id);
      }
    }

    await logAction(
      adminEmail,
      `Agent 3 (WhatsApp Outreach) completed: dispatched ${sentCount} WhatsApp outreach messages.`,
      'leads',
      'agent_3_run'
    );

    return NextResponse.json({
      success: true,
      sent: sentCount,
      outreach: outreachLog
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    // 6. Release agent lock
    await releaseAgentLock('agent_3_whatsapp');
  }
}
