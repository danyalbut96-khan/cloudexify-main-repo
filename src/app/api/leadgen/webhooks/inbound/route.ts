import { getAdminClient } from '@/lib/supabase/server';
import { callOpenRouter } from '@/lib/ai/openrouter';
import { sendOutreachEmail } from '@/lib/outreach/email';
import { logAction } from '@/lib/server-utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const adminClient = getAdminClient();
    const body = await request.json();

    // Determine channel and sender details based on webhook payload structures
    // 1. WhatsApp Gupshup payload structure: body.payload.sender.phone and body.payload.payload.text
    // 2. Resend/email webhook structure: body.data.from (or fallback text)
    let channel: 'email' | 'whatsapp' = 'email';
    let sender = '';
    let content = '';

    if (body.payload && body.payload.sender) {
      channel = 'whatsapp';
      sender = body.payload.sender.phone || '';
      content = body.payload.payload?.text || '';
    } else {
      // Email standard webhook payload structure
      channel = 'email';
      sender = body.from || body.data?.from || '';
      content = body.text || body.data?.text || body.subject || '';
    }

    if (!sender) {
      return NextResponse.json({ error: 'Sender identifier is missing from payload.' }, { status: 400 });
    }

    // Find the lead in the database
    let lead: any = null;

    if (channel === 'whatsapp') {
      // Clean phone number for query
      const cleanPhone = sender.replace(/\D/g, '');
      // Match the last few digits to handle country code variants
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
      // Email match
      const emailQuery = sender.toLowerCase().trim();
      const { data } = await adminClient
        .from('leads')
        .select('*')
        .ilike('email', `%${emailQuery}%`)
        .maybeSingle();
      lead = data;
    }

    if (!lead) {
      // Create outreach event under a general lead log or return 200 to acknowledge webhook
      console.warn(`Incoming webhook reply from ${sender} on channel ${channel} could not be mapped to any lead.`);
      return NextResponse.json({ success: true, message: 'Sender not mapped to active lead.' });
    }

    // 1. Insert inbound outreach event
    const { data: newEvent, error: eventError } = await adminClient
      .from('outreach_events')
      .insert({
        lead_id: lead.id,
        channel,
        direction: 'inbound',
        content,
        status: 'replied'
      })
      .select()
      .single();

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    // 2. Classify reply using OpenRouter LLM
    const classificationSystemPrompt = `You are a professional lead classification bot. Classify the user response into exactly one of three categories: "positive", "neutral", or "negative".
    - positive: The user shows interest, asks for a proposal, wants a call, requests meeting/pricing details, or has a warm response.
    - neutral: The user asks to be contacted later, provides out-of-office message, or asks an unrelated question.
    - negative: The user rejects, says "no thank you", complains, or tells us to stop messaging.
    
    Respond with ONLY the word "positive", "neutral" or "negative". Do not output punctuation or other text.`;

    let sentiment = 'neutral';
    try {
      const response = await callOpenRouter({
        model: 'openai/gpt-4o-mini', // Lightweight classification model
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
      console.error('Sentiment classification failed:', aiErr);
    }

    // 3. Update lead status based on classification
    let nextStatus = 'replied';
    if (sentiment === 'positive') {
      nextStatus = 'qualified';
    } else if (sentiment === 'negative') {
      nextStatus = 'declined';
    }

    await adminClient
      .from('leads')
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', lead.id);

    // 4. Trigger alert notification if qualified
    if (nextStatus === 'qualified') {
      await logAction(
        'system@cloudexify.com',
        `Lead "${lead.business_name}" classified as QUALIFIED after positive inbound reply!`,
        'leads',
        lead.id
      );

      // Attempt to send an email notification to founders via Resend
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
          body: `Hi Founders,\n\nWe have qualified a new prospect!\n\n**Business**: ${lead.business_name}\n**Category**: ${lead.category}\n**Phone**: ${lead.phone || 'N/A'}\n**Email**: ${lead.email || 'N/A'}\n\n**Prospect Reply**:\n"${content}"\n\nCheck the dashboard: /dashboard/leadgen`
        });
      } catch (notifyErr: any) {
        console.error('Failed to send founder notification email:', notifyErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      sentiment,
      lead_id: lead.id,
      new_status: nextStatus
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
