import { createClient, getAdminClient } from '@/lib/supabase/server';
import { getStoredCredential, callOpenRouter, acquireAgentLock, releaseAgentLock } from '@/lib/ai/openrouter';
import { sendOutreachEmail } from '@/lib/outreach/email';
import { isRateLimited } from '@/lib/utils';
import { logAction, StreamLogger } from '@/lib/server-utils';
import { NextRequest, NextResponse } from 'next/server';

async function executeEmailOutreach(logger: StreamLogger, adminEmail: string) {
  const adminClient = getAdminClient();

  // 1. Acquire global Email Agent lock
  await logger.log('Acquiring Agent 2 (Email Outreach) global execution lock...', 'info');
  const lockAcquired = await acquireAgentLock('agent_2_email');
  if (!lockAcquired) {
    await logger.log('Email outreach lock is already active (another instance is running). Tick skipped.', 'warn');
    return { success: true, message: 'Email outreach agent (Agent 2) is already running. Tick skipped.' };
  }

  try {
    // 2. Fetch Email Stage config
    await logger.log('Fetching Email stage configurations from database...', 'info');
    const { data: stageConfig } = await adminClient
      .from('pipeline_stage_config')
      .select('*')
      .eq('stage_key', 'email')
      .single();

    if (!stageConfig) {
      throw new Error('Pipeline stage configuration for email is missing.');
    }

    if (!stageConfig.enabled) {
      await logger.log('Email outreach stage is disabled in configuration. Skipping execution.', 'warn');
      return { success: false, message: 'Email outreach stage is currently disabled.' };
    }

    // 3. Verify Email Domain credentials
    await logger.log('Verifying SMTP credentials and sending domain DNS states...', 'info');
    const { data: emailCreds } = await adminClient
      .from('api_credentials')
      .select('*')
      .eq('provider', 'email_smtp')
      .single();

    if (!emailCreds || !emailCreds.is_verified) {
      await logger.log('Email sending is blocked. Verify DNS settings or enable bypass DNS check.', 'error');
      return { success: false, error: 'Email sending domain DNS records must be verified first.' };
    }

    const config = stageConfig.config || {};
    const dailyLimit = config.daily_send_limit || 30;

    // 4. Check daily send quota
    await logger.log(`Validating daily send limits (max ${dailyLimit} sends)...`, 'info');
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
    await logger.log(`Emails sent today: ${sentToday || 0} | Remaining limit: ${remainingQuota}`, 'info');
    if (remainingQuota <= 0) {
      await logger.log('Daily email quota reached for today. Skipping.', 'warn');
      return { success: true, message: 'Daily email quota reached for today.' };
    }

    // 5. Query candidate prospects with email and status = 'ready_for_outreach'
    await logger.log('Querying top leads ready for email outreach...', 'info');
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
      await logger.log('No prospects with email addresses found ready for outreach.', 'warn');
      return { success: true, message: 'No prospects with email addresses found ready for outreach.' };
    }

    await logger.log(`Found ${leads.length} qualified prospects to email.`, 'info');

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
      await logger.log(`[Outreach ${sentCount + 1}/${leads.length}] Processing "${lead.business_name}" (${lead.email})...`, 'info');

      // Call Supabase RPC try_lock_lead
      await logger.log(`Acquiring database lock on prospect ID ${lead.id}...`, 'info');
      const { data: lockOk, error: lockErr } = await adminClient.rpc('try_lock_lead', {
        p_lead_id: lead.id,
        p_agent: 'agent_2'
      });

      if (lockErr || !lockOk) {
        await logger.log(`Prospect lock failed (another agent process claimed this lead). Skipping.`, 'warn');
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
        await logger.log(`Requesting OpenRouter email personalization draft using model "${model}"...`, 'info');
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
        await logger.log(`Outreach draft resolved: "${subject}"`, 'success');

        // Send email via Resend client
        await logger.log(`Dispatching email to Resend API: to = ${lead.email}...`, 'info');
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
        await logger.log(`Outreach email successfully sent to "${lead.business_name}"!`, 'success');

      } catch (err: any) {
        await logger.log(`Outreach execution error for ${lead.business_name}: ${err.message}`, 'error');
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

    await logger.log(`Agent 2 run completed. Dispatched ${sentCount} emails.`, 'success');

    return {
      success: true,
      sent: sentCount,
      outreach: outreachLog
    };

  } catch (err: any) {
    await logger.log(`Agent 2 crash: ${err.message}`, 'error');
    throw err;
  } finally {
    // 7. Release agent lock
    await logger.log('Releasing Agent 2 (Email Outreach) global execution lock...', 'info');
    await releaseAgentLock('agent_2_email');
  }
}

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

  const streamParam = request.nextUrl.searchParams.get('stream') === 'true';

  if (streamParam) {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const logger = new StreamLogger(writer);

    (async () => {
      try {
        await executeEmailOutreach(logger, adminEmail);
      } catch (err: any) {
        await logger.log(`Execution failed: ${err.message || err}`, 'error');
      } finally {
        await writer.close();
      }
    })();

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } else {
    const logger = new StreamLogger(null);
    try {
      const summary = await executeEmailOutreach(logger, adminEmail);
      return NextResponse.json(summary);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
