import { getAdminClient } from '@/lib/supabase/server';
import { callOpenRouter } from '@/lib/ai/openrouter';
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
    const supabase = getAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    adminEmail = user.email!;
  }

  try {
    const adminClient = getAdminClient();

    // 1. Get Email Stage config
    const { data: stageConfig } = await adminClient
      .from('pipeline_stage_config')
      .select('*')
      .eq('stage_key', 'email')
      .single();

    if (!stageConfig || !stageConfig.enabled) {
      return NextResponse.json({ error: 'Email stage is currently disabled.' }, { status: 400 });
    }

    // 2. Check if Email Domain is verified
    const { data: emailCreds } = await adminClient
      .from('api_credentials')
      .select('*')
      .eq('provider', 'email_smtp')
      .single();

    if (!emailCreds || !emailCreds.is_verified) {
      return NextResponse.json({ error: 'Email sending is blocked. Sending domain DNS records must be fully verified first.' }, { status: 400 });
    }

    const config = stageConfig.config || {};
    const dailyLimit = config.daily_send_limit || 30;

    // 3. Count emails sent today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { count: sentToday, error: countError } = await adminClient
      .from('outreach_events')
      .select('*', { count: 'exact', head: true })
      .eq('channel', 'email')
      .eq('direction', 'outbound')
      .gte('created_at', startOfToday.toISOString());

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const remainingQuota = dailyLimit - (sentToday || 0);
    if (remainingQuota <= 0) {
      return NextResponse.json({ success: true, message: 'Daily email send limit reached for today.' });
    }

    // 4. Fetch enriched leads that have a valid email address
    const { data: leads, error: leadsError } = await adminClient
      .from('leads')
      .select('*')
      .eq('status', 'enriched')
      .not('email', 'is', null)
      .limit(Math.min(remainingQuota, 5)); // Send in small batches to stay responsive

    if (leadsError) {
      return NextResponse.json({ error: leadsError.message }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, message: 'No enriched leads with email addresses found.' });
    }

    const model = stageConfig.openrouter_model || 'anthropic/claude-3.5-sonnet';
    const systemPrompt = stageConfig.system_prompt || 
      'You are a professional outreach writer representing CloudExify. Write a compelling, natural, warm, and highly personalized cold outreach email. Focus on helping the business grow its digital presence. Ground the content in the personalization detail provided. Never state a specific human identity like "I am [Specific Name]". Always write as "CloudExify Team" or "AI Growth Assistant at CloudExify". Maintain a warm tone.';

    let sentCount = 0;
    const outreachLog: any[] = [];

    for (const lead of leads) {
      const promptInput = `
        Business Name: ${lead.business_name}
        Category: ${lead.category}
        Personalization Detail: ${lead.personalization_detail}
      `;

      let emailBody = '';
      try {
        emailBody = await callOpenRouter({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Compose a high-converting outreach email for this prospect:\n${promptInput}` }
          ],
          maxTokens: 500
        });
      } catch (aiErr: any) {
        console.error(`AI email generation failed for lead ${lead.id}:`, aiErr);
        continue;
      }

      try {
        const subject = `Digital upgrade inquiry: ${lead.business_name}`;
        await sendOutreachEmail({
          to: lead.email,
          subject,
          body: emailBody
        });

        // Insert outreach event
        await adminClient
          .from('outreach_events')
          .insert({
            lead_id: lead.id,
            channel: 'email',
            direction: 'outbound',
            content: emailBody,
            status: 'sent'
          });

        // Update lead status
        await adminClient
          .from('leads')
          .update({
            status: 'emailed',
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);

        sentCount++;
        outreachLog.push({ business_name: lead.business_name, email: lead.email });
      } catch (sendErr: any) {
        console.error(`Email delivery failed for lead ${lead.id}:`, sendErr);
        // Log event failure
        await adminClient
          .from('outreach_events')
          .insert({
            lead_id: lead.id,
            channel: 'email',
            direction: 'outbound',
            content: `Failed to send email: ${sendErr.message}`,
            status: 'failed'
          });
      }
    }

    await logAction(
      adminEmail,
      `Ran Email Outreach: successfully sent ${sentCount} cold emails.`,
      'leads',
      'email_run'
    );

    return NextResponse.json({
      success: true,
      sent: sentCount,
      outbox: outreachLog
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
