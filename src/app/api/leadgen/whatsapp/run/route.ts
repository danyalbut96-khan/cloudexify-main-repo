import { createClient, getAdminClient } from '@/lib/supabase/server';
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

  try {
    const adminClient = getAdminClient();

    // 1. Get WhatsApp Stage config
    const { data: stageConfig } = await adminClient
      .from('pipeline_stage_config')
      .select('*')
      .eq('stage_key', 'whatsapp')
      .single();

    if (!stageConfig || !stageConfig.enabled) {
      return NextResponse.json({ error: 'WhatsApp stage is currently disabled.' }, { status: 400 });
    }

    const config = stageConfig.config || {};
    const delayDays = config.followup_delay_days || 3;

    // 2. Fetch emailed leads that have a phone number
    const { data: leads, error: leadsError } = await adminClient
      .from('leads')
      .select('*')
      .eq('status', 'emailed')
      .not('phone', 'is', null);

    if (leadsError) {
      return NextResponse.json({ error: leadsError.message }, { status: 500 });
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ success: true, message: 'No emailed leads with phone numbers found.' });
    }

    let sentCount = 0;
    const logDetails: any[] = [];
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - delayDays);

    for (const lead of leads) {
      // Find last outbound outreach event
      const { data: events, error: eventError } = await adminClient
        .from('outreach_events')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });

      if (eventError || !events || events.length === 0) continue;

      const lastOutboundEmail = events.find(e => e.channel === 'email' && e.direction === 'outbound');
      if (!lastOutboundEmail) continue;

      const lastOutboundTime = new Date(lastOutboundEmail.created_at);
      if (lastOutboundTime > thresholdDate) {
        // Not enough days have passed yet
        continue;
      }

      // Ensure no inbound replies exist
      const hasReplied = events.some(e => e.direction === 'inbound');
      if (hasReplied) {
        // Already replied, should not receive automated follow-ups
        continue;
      }

      try {
        await sendOutreachWhatsApp({
          to: lead.phone,
          businessName: lead.business_name,
          personalizationDetail: lead.personalization_detail || ''
        });

        // Log outreach event
        await adminClient
          .from('outreach_events')
          .insert({
            lead_id: lead.id,
            channel: 'whatsapp',
            direction: 'outbound',
            content: `Sent follow-up WhatsApp template via Gupshup for "${lead.business_name}"`,
            status: 'sent'
          });

        // Update lead status
        await adminClient
          .from('leads')
          .update({
            status: 'followed_up',
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);

        sentCount++;
        logDetails.push({ business_name: lead.business_name, phone: lead.phone });
      } catch (err: any) {
        console.error(`WhatsApp send failed for lead ${lead.id}:`, err);
        // Log event failure
        await adminClient
          .from('outreach_events')
          .insert({
            lead_id: lead.id,
            channel: 'whatsapp',
            direction: 'outbound',
            content: `Failed to send WhatsApp: ${err.message}`,
            status: 'failed'
          });
      }
    }

    await logAction(
      adminEmail,
      `Ran WhatsApp Stage: successfully sent ${sentCount} templates.`,
      'leads',
      'whatsapp_run'
    );

    return NextResponse.json({
      success: true,
      sent: sentCount,
      outbox: logDetails
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
