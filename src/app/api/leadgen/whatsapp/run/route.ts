import { createClient, getAdminClient } from '@/lib/supabase/server';
import { getStoredCredential, callOpenRouter, acquireAgentLock, releaseAgentLock } from '@/lib/ai/openrouter';
import { sendOutreachWhatsApp } from '@/lib/outreach/whatsapp';
import { isRateLimited } from '@/lib/utils';
import { logAction, StreamLogger } from '@/lib/server-utils';
import { NextRequest, NextResponse } from 'next/server';

async function executeWhatsAppOutreach(logger: StreamLogger, adminEmail: string) {
  const adminClient = getAdminClient();

  // 1. Acquire global WhatsApp Agent lock
  await logger.log('Acquiring Agent 3 (WhatsApp Outreach) global execution lock...', 'info');
  const lockAcquired = await acquireAgentLock('agent_3_whatsapp');
  if (!lockAcquired) {
    await logger.log('WhatsApp outreach lock is already active (another instance is running). Tick skipped.', 'warn');
    return { success: true, message: 'WhatsApp outreach agent (Agent 3) is already running. Tick skipped.' };
  }

  try {
    // 2. Fetch WhatsApp Stage config
    await logger.log('Fetching WhatsApp stage configurations from database...', 'info');
    const { data: stageConfig } = await adminClient
      .from('pipeline_stage_config')
      .select('*')
      .eq('stage_key', 'whatsapp')
      .single();

    if (!stageConfig) {
      throw new Error('Pipeline stage configuration for WhatsApp is missing.');
    }

    if (!stageConfig.enabled) {
      await logger.log('WhatsApp outreach stage is disabled in configuration. Skipping execution.', 'warn');
      return { success: false, message: 'WhatsApp outreach stage is currently disabled.' };
    }

    // 3. Verify Gupshup WhatsApp credentials
    await logger.log('Verifying Gupshup WhatsApp provider credentials...', 'info');
    const { data: waCreds } = await adminClient
      .from('api_credentials')
      .select('*')
      .eq('provider', 'gupshup')
      .single();

    if (!waCreds || !waCreds.is_verified) {
      await logger.log('WhatsApp outreach is blocked. Gupshup credentials must be fully verified first.', 'error');
      return { success: false, error: 'Gupshup credentials must be fully verified.' };
    }

    // 4. Query prospects with status = 'ready_for_outreach', no email on file, and has_whatsapp = true
    await logger.log('Querying prospects without email addresses ready for WhatsApp outreach...', 'info');
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
      await logger.log('No prospects without email addresses found ready for WhatsApp outreach.', 'warn');
      return { success: true, message: 'No prospects without email addresses found ready for WhatsApp outreach.' };
    }

    await logger.log(`Found ${leads.length} qualified prospects to message via WhatsApp.`, 'info');

    // Resolve model parameters
    const model = stageConfig.openrouter_model || 'openai/gpt-4o-mini';
    const rawPrompt = stageConfig.system_prompt || 'Write a short warm first-touch WhatsApp outreach message to a local business.';
    const systemPrompt = rawPrompt.replace('{{mode}}', 'first_touch');

    let sentCount = 0;
    const outreachLog: any[] = [];

    // 5. Process outreach per lead (with per-lead lock)
    for (const lead of leads) {
      await logger.log(`[Outreach ${sentCount + 1}/${leads.length}] Processing "${lead.business_name}" (${lead.phone})...`, 'info');

      // Call Supabase RPC try_lock_lead
      await logger.log(`Acquiring row-level lock on prospect ID ${lead.id}...`, 'info');
      const { data: lockOk, error: lockErr } = await adminClient.rpc('try_lock_lead', {
        p_lead_id: lead.id,
        p_agent: 'agent_3'
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

        // Call OpenRouter for WhatsApp copy
        await logger.log(`Requesting OpenRouter WhatsApp copy using model "${model}"...`, 'info');
        const message = await callOpenRouter({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(leadContext) }
          ]
        });

        const cleanedMessage = message.trim();
        await logger.log(`Outreach copy generated: "${cleanedMessage.substring(0, 60)}..."`, 'success');

        // Send WhatsApp outreach via Gupshup
        await logger.log(`Dispatching WhatsApp template via Gupshup: destination = ${lead.phone}...`, 'info');
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
        await logger.log(`Outreach template sent successfully to "${lead.business_name}"!`, 'success');

      } catch (err: any) {
        await logger.log(`Outreach execution error for ${lead.business_name}: ${err.message}`, 'error');
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

    await logger.log(`Agent 3 run completed. Dispatched ${sentCount} WhatsApp messages.`, 'success');

    return {
      success: true,
      sent: sentCount,
      outreach: outreachLog
    };

  } catch (err: any) {
    await logger.log(`Agent 3 crash: ${err.message}`, 'error');
    throw err;
  } finally {
    // 6. Release agent lock
    await logger.log('Releasing Agent 3 (WhatsApp Outreach) global execution lock...', 'info');
    await releaseAgentLock('agent_3_whatsapp');
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
        await executeWhatsAppOutreach(logger, adminEmail);
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
      const summary = await executeWhatsAppOutreach(logger, adminEmail);
      return NextResponse.json(summary);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }
}
