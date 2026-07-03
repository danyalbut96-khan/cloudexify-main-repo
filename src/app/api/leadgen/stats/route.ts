import { createClient } from '@/lib/supabase/server';
import { isRateLimited } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

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

  try {
    // 1. Fetch total leads
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // 2. Fetch outreach counts
    const { count: emailsSent } = await supabase
      .from('outreach_events')
      .select('*', { count: 'exact', head: true })
      .eq('channel', 'email')
      .eq('direction', 'outbound')
      .eq('status', 'sent');

    const { count: whatsappSent } = await supabase
      .from('outreach_events')
      .select('*', { count: 'exact', head: true })
      .eq('channel', 'whatsapp')
      .eq('direction', 'outbound')
      .eq('status', 'sent');

    const { count: repliesReceived } = await supabase
      .from('outreach_events')
      .select('*', { count: 'exact', head: true })
      .eq('direction', 'inbound');

    const { count: qualifiedCount } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'qualified');

    // 3. Calculate Pending Follow-ups (status = 'emailed' & elapsed delay days from config)
    const { data: whatsappConfig } = await supabase
      .from('pipeline_stage_config')
      .select('config')
      .eq('stage_key', 'whatsapp')
      .maybeSingle();

    const delayDays = whatsappConfig?.config?.followup_delay_days || 3;
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - delayDays);

    const { data: emailedLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('status', 'emailed');

    let pendingFollowUps = 0;

    if (emailedLeads && emailedLeads.length > 0) {
      for (const lead of emailedLeads) {
        const { data: events } = await supabase
          .from('outreach_events')
          .select('created_at, channel, direction')
          .eq('lead_id', lead.id)
          .order('created_at', { ascending: false });

        if (events && events.length > 0) {
          const lastOutboundEmail = events.find(e => e.channel === 'email' && e.direction === 'outbound');
          if (lastOutboundEmail) {
            const emailTime = new Date(lastOutboundEmail.created_at);
            const hasInbound = events.some(e => e.direction === 'inbound');
            if (emailTime <= thresholdDate && !hasInbound) {
              pendingFollowUps++;
            }
          }
        }
      }
    }

    // 4. Calculate funnel statistics
    // Discovered
    const { count: discovered } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });

    // Enriched
    const { count: enriched } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('status', ['enriched', 'emailed', 'followed_up', 'replied', 'qualified']);

    // Emailed/Contacted
    const { count: emailed } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('status', ['emailed', 'followed_up', 'replied', 'qualified']);

    // Replied
    const { count: replied } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .in('status', ['replied', 'qualified']);

    // Qualified
    const { count: qualified } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'qualified');

    return NextResponse.json({
      totals: {
        discovered: totalLeads || 0,
        emailsSent: emailsSent || 0,
        whatsappSent: whatsappSent || 0,
        repliesReceived: repliesReceived || 0,
        pendingFollowUps,
        qualified: qualifiedCount || 0
      },
      funnel: [
        { stage: 'Discovered', count: discovered || 0 },
        { stage: 'Enriched', count: enriched || 0 },
        { stage: 'Emailed', count: emailed || 0 },
        { stage: 'Replied', count: replied || 0 },
        { stage: 'Qualified', count: qualified || 0 }
      ]
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
