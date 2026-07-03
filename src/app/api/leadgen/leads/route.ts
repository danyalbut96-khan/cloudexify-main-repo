import { createClient, getAdminClient } from '@/lib/supabase/server';
import { isRateLimited, sanitizeObject } from '@/lib/utils';
import { logAction } from '@/lib/server-utils';
import { NextRequest, NextResponse } from 'next/server';
import { sendOutreachEmail } from '@/lib/outreach/email';
import { sendOutreachWhatsApp } from '@/lib/outreach/whatsapp';
import { callOpenRouter } from '@/lib/ai/openrouter';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const city = searchParams.get('city') || '';
  const leadId = searchParams.get('leadId') || '';

  try {
    // If a specific lead details query is made (including conversation history)
    if (leadId) {
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError) {
        return NextResponse.json({ error: leadError.message }, { status: 400 });
      }

      // Fetch outreach events history in chronological order
      const { data: history } = await supabase
        .from('outreach_events')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });

      return NextResponse.json({
        lead,
        history: history || []
      });
    }

    // Build the query
    let query = supabase.from('leads').select('*', { count: 'exact' });

    if (search) {
      query = query.ilike('business_name', `%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (city) {
      query = query.eq('city', city);
    }

    // Paginate
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data: leads, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      page,
      limit
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, phone, email } = sanitizeObject(body);

    const updateFields: any = {
      updated_at: new Date().toISOString()
    };
    if (status !== undefined) updateFields.status = status;
    if (phone !== undefined) updateFields.phone = phone;
    if (email !== undefined) updateFields.email = email;

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updateFields)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const detailsStr = phone !== undefined || email !== undefined ? 'profile details' : `status to ${status}`;
    await logAction(user.email!, `Updated ${detailsStr} of lead "${lead.business_name}"`, 'leads', id);

    return NextResponse.json(lead);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) ;
  }

  try {
    const body = await request.json();
    const { action, leadId } = sanitizeObject(body);

    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // A. Resend Outreach Email Manually
    if (action === 'resend_email') {
      if (!lead.email) {
        return NextResponse.json({ error: 'Lead does not have an email address.' }, { status: 400 });
      }

      // Fetch Email Stage System Prompt
      const { data: emailConfig } = await supabase
        .from('pipeline_stage_config')
        .select('*')
        .eq('stage_key', 'email')
        .single();

      const model = emailConfig?.openrouter_model || 'anthropic/claude-3.5-sonnet';
      const prompt = emailConfig?.system_prompt || 'You are an outreach bot for CloudExify. Write a natural email.';

      const bodyText = await callOpenRouter({
        model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Compose manually-triggered outreach for: \nName: ${lead.business_name}\nPersonalization: ${lead.personalization_detail}` }
        ]
      });

      await sendOutreachEmail({
        to: lead.email,
        subject: `Digital upgrade inquiry: ${lead.business_name}`,
        body: bodyText
      });

      await supabase.from('outreach_events').insert({
        lead_id: lead.id,
        channel: 'email',
        direction: 'outbound',
        content: bodyText,
        status: 'sent'
      });

      await supabase.from('leads').update({ status: 'emailed' }).eq('id', lead.id);
      await logAction(user.email!, `Manually resent outreach email to ${lead.business_name}`, 'leads', lead.id);

      return NextResponse.json({ success: true });
    }

    // B. Send WhatsApp Follow-Up Now
    if (action === 'send_whatsapp') {
      if (!lead.phone) {
        return NextResponse.json({ error: 'Lead does not have a phone number.' }, { status: 400 });
      }

      await sendOutreachWhatsApp({
        to: lead.phone,
        businessName: lead.business_name,
        personalizationDetail: lead.personalization_detail || ''
      });

      await supabase.from('outreach_events').insert({
        lead_id: lead.id,
        channel: 'whatsapp',
        direction: 'outbound',
        content: `Manual WhatsApp followup template sent via Gupshup`,
        status: 'sent'
      });

      await supabase.from('leads').update({ status: 'followed_up' }).eq('id', lead.id);
      await logAction(user.email!, `Manually sent WhatsApp follow-up template to ${lead.business_name}`, 'leads', lead.id);

      return NextResponse.json({ success: true });
    }

    // C. Debug Action: Simulate Inbound Reply
    if (action === 'simulate_reply') {
      const { replyText, replyChannel } = body;
      if (!replyText || !replyChannel) {
        return NextResponse.json({ error: 'Reply text and channel are required for simulation.' }, { status: 400 });
      }

      // Call the inbound webhook logic locally or simulate it directly
      const mockWebhookRes = await fetch(`${request.nextUrl.origin}/api/leadgen/webhooks/inbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: replyChannel === 'email' ? lead.email || 'test@domain.com' : lead.phone || '923000000000',
          text: replyText,
          payload: replyChannel === 'whatsapp' ? {
            sender: { phone: lead.phone || '923000000000' },
            payload: { text: replyText }
          } : undefined
        })
      });

      const webhookData = await mockWebhookRes.json();
      if (!mockWebhookRes.ok) throw new Error(webhookData.error || 'Webhook simulation failed.');

      return NextResponse.json({ success: true, classification: webhookData.sentiment, status: webhookData.new_status });
    }

    return NextResponse.json({ error: 'Invalid manual action choice' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
