import { getAdminClient } from '@/lib/supabase/server';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { sendOutreachEmail } from '@/lib/outreach/email';
import { sendOutreachWhatsApp } from '@/lib/outreach/whatsapp';
import { isRateLimited } from '@/lib/utils';
import { logAction } from '@/lib/server-utils';
import { NextRequest, NextResponse } from 'next/server';

// Get conversation history transcript as a clean text block
async function getConversationHistory(leadId: string) {
  const adminClient = getAdminClient();
  const { data } = await adminClient
    .from('outreach_events')
    .select('channel, direction, content, created_at')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true });
    
  return (data || [])
    .map(e => `[${e.direction.toUpperCase()} - ${e.channel.toUpperCase()}] ${e.content}`)
    .join('\n');
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const adminClient = getAdminClient();
    const body = await request.json();

    // Parse Gupshup (WhatsApp) payload or Resend (Email) payload
    let channel: 'email' | 'whatsapp' = 'whatsapp';
    let sender = '';
    let content = '';

    // Check payload attributes for WhatsApp (Gupshup webhook format)
    if (body.mobile || body.sender || (body.payload && body.payload.sender)) {
      channel = 'whatsapp';
      sender = body.sender || (body.payload && body.payload.sender && body.payload.sender.phone) || body.mobile || '';
      content = body.text || (body.payload && body.payload.payload && body.payload.payload.text) || '';
    } else {
      // Fallback: Assume Email payload structure
      channel = 'email';
      sender = body.from || body.data?.from || '';
      content = body.text || body.data?.text || body.subject || '';
    }

    if (!sender) {
      return NextResponse.json({ error: 'Sender identifier is missing from payload.' }, { status: 400 });
    }

    // Match the lead in the database
    let lead: any = null;

    if (channel === 'whatsapp') {
      const cleanPhone = sender.replace(/\D/g, '');
      const { data: matchedLeads } = await adminClient
        .from('leads')
        .select('*')
        .not('phone', 'is', null);

      if (matchedLeads) {
        lead = matchedLeads.find((l: any) => {
          const lp = l.phone.replace(/\D/g, '');
          return lp.endsWith(cleanPhone) || cleanPhone.endsWith(lp);
        });
      }
    } else {
      const emailQuery = sender.toLowerCase().trim();
      const { data } = await adminClient
        .from('leads')
        .select('*')
        .ilike('email', `%${emailQuery}%`)
        .maybeSingle();
      lead = data;
    }

    if (!lead) {
      console.warn(`Incoming webhook reply from ${sender} on channel ${channel} could not be mapped to any lead.`);
      return NextResponse.json({ success: true, message: 'Sender not mapped to active lead.' });
    }

    // 1. Insert inbound outreach event
    await adminClient
      .from('outreach_events')
      .insert({
        lead_id: lead.id,
        channel,
        direction: 'inbound',
        content,
        status: 'replied'
      });

    // 2. Coordinated Reply Execution for WhatsApp (Agent 3 Webhook Handler)
    if (channel === 'whatsapp') {
      // Try to acquire the per-lead lock
      const { data: lockOk, error: lockErr } = await adminClient.rpc('try_lock_lead', {
        p_lead_id: lead.id,
        p_agent: 'agent_3'
      });

      if (lockErr || !lockOk) {
        // Locked by another tick, safely queue reply execution
        return NextResponse.json({ queued: true });
      }

      try {
        // Fetch WhatsApp Stage config
        const { data: stageConfig } = await adminClient
          .from('pipeline_stage_config')
          .select('*')
          .eq('stage_key', 'whatsapp')
          .single();

        if (!stageConfig) {
          throw new Error('Pipeline stage configuration for WhatsApp is missing.');
        }

        const model = stageConfig.openrouter_model || 'openai/gpt-4o-mini';
        const rawPrompt = stageConfig.system_prompt || 'Respond to the customer message based on the history.';
        const systemPrompt = rawPrompt.replace('{{mode}}', 'reply');

        // Compile conversation timeline history
        const conversationHistory = await getConversationHistory(lead.id);

        const leadContext = {
          business_name: lead.business_name,
          category: lead.category,
          google_rating: lead.google_rating,
          google_review_count: lead.google_review_count,
          personalization_detail: lead.personalization_detail
        };

        // Query OpenRouter for intent and reply text
        const response = await callOpenRouter({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: JSON.stringify({ 
                ...leadContext, 
                conversation_history: conversationHistory, 
                incoming_message: content 
              }) 
            }
          ]
        });

        // Parse Response format: First line: [INTENT: INTENT_TYPE], following lines: message text
        const responseLines = response.split('\n');
        const intentLine = responseLines[0] || '';
        const messageText = responseLines.slice(1).join('\n').trim();

        // Extract Intent Tag
        const intentMatch = intentLine.match(/\[INTENT:\s*([A-Z_]+)\]/i);
        const intent = intentMatch ? intentMatch[1].toUpperCase() : 'NEUTRAL';

        // Dispatch outbound WhatsApp response
        await sendOutreachWhatsApp({
          to: lead.phone,
          text: messageText
        });

        // Save outbound outreach event
        await adminClient.from('outreach_events').insert({
          lead_id: lead.id,
          channel: 'whatsapp',
          direction: 'outbound',
          content: messageText,
          status: 'sent'
        });

        // Determine new lead status
        const newStatus = intent === 'POSITIVE' ? 'qualified' : intent === 'NEGATIVE' ? 'declined' : 'replied';

        await adminClient
          .from('leads')
          .update({
            status: newStatus,
            locked_by: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);

        // Alert founders on qualified leads
        if (newStatus === 'qualified') {
          await logAction(
            'system@cloudexify.com',
            `Lead "${lead.business_name}" qualified after positive WhatsApp reply classification!`,
            'leads',
            lead.id
          );

          try {
            const { data: compSettings } = await adminClient
              .from('company_settings')
              .select('company_email')
              .eq('id', 1)
              .single();

            const founderEmail = compSettings?.company_email || 'founders@cloudexify.com';

            await sendOutreachEmail({
              to: founderEmail,
              subject: `🔥 Qualified Lead Alert: ${lead.business_name}`,
              body: `Hi Founders,\n\nWe have qualified a new prospect via WhatsApp outreach!\n\n**Business**: ${lead.business_name}\n**Category**: ${lead.category}\n**Phone**: ${lead.phone || 'N/A'}\n\n**Customer Reply**:\n"${content}"\n\n**Agent AI Response**:\n"${messageText}"\n\nCheck the dashboard: /dashboard/leadgen`
            });
          } catch (notifyErr: any) {
            console.error('Failed to notify founders:', notifyErr.message);
          }
        }

        return NextResponse.json({
          success: true,
          intent,
          response: messageText,
          new_status: newStatus
        });

      } finally {
        // Release lead lock
        await adminClient
          .from('leads')
          .update({ locked_by: null })
          .eq('id', lead.id);
      }

    } else {
      // Email classification only (no automated email reply dispatched)
      const classificationSystemPrompt = `Classify user response into exactly one of three categories: "positive", "neutral", or "negative". Respond with ONLY the word.`;
      let sentiment = 'neutral';
      try {
        const response = await callOpenRouter({
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: classificationSystemPrompt },
            { role: 'user', content: `Classify this customer response:\n"${content}"` }
          ],
          maxTokens: 5
        });
        const parsed = response.trim().toLowerCase();
        if (parsed.includes('positive')) sentiment = 'positive';
        else if (parsed.includes('negative')) sentiment = 'negative';
      } catch (aiErr) {
        console.error('Email reply classification failed:', aiErr);
      }

      const nextStatus = sentiment === 'positive' ? 'qualified' : sentiment === 'negative' ? 'declined' : 'replied';

      await adminClient
        .from('leads')
        .update({
          status: nextStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);

      if (nextStatus === 'qualified') {
        try {
          const { data: compSettings } = await adminClient
            .from('company_settings')
            .select('company_email')
            .eq('id', 1)
            .single();

          const founderEmail = compSettings?.company_email || 'founders@cloudexify.com';

          await sendOutreachEmail({
            to: founderEmail,
            subject: `🔥 Qualified Lead Alert: ${lead.business_name}`,
            body: `Hi Founders,\n\nWe have qualified a new prospect via Email reply!\n\n**Business**: ${lead.business_name}\n**Category**: ${lead.category}\n**Email**: ${lead.email || 'N/A'}\n\n**Customer Reply**:\n"${content}"\n\nCheck the dashboard: /dashboard/leadgen`
          });
        } catch (notifyErr: any) {
          console.error('Failed to notify founders of email lead:', notifyErr.message);
        }
      }

      return NextResponse.json({
        success: true,
        sentiment,
        new_status: nextStatus
      });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
