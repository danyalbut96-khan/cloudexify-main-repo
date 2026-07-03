import { createClient } from '@/lib/supabase/server';
import { isRateLimited, sanitizeObject } from '@/lib/utils';
import { logAction } from '@/lib/server-utils';
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
    // 1. Fetch stage configs
    const { data: configs, error } = await supabase
      .from('pipeline_stage_config')
      .select('*')
      .order('stage_key');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 2. Fetch live lead counters per stage
    const { data: leads } = await supabase
      .from('leads')
      .select('status');

    const counts: Record<string, number> = {
      discovery: 0,
      email: 0,
      whatsapp: 0,
      handoff: 0
    };

    if (leads) {
      leads.forEach((l: any) => {
        if (l.status === 'discovered' || l.status === 'ready_for_outreach') counts.discovery++;
        else if (l.status === 'emailed') counts.email++;
        else if (l.status === 'followed_up' || l.status === 'replied') counts.whatsapp++;
        else if (l.status === 'qualified') counts.handoff++;
      });
    }

    const stageData = (configs || [])
      .filter((config: any) => config.stage_key !== 'enrichment')
      .map((config: any) => ({
        ...config,
        lead_count: counts[config.stage_key] || 0
      }));

    return NextResponse.json(stageData);
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const sanitized = sanitizeObject(body);
    const { id, enabled, openrouter_model, system_prompt, config } = sanitized;

    const { data, error } = await supabase
      .from('pipeline_stage_config')
      .update({
        enabled,
        openrouter_model,
        system_prompt,
        config,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAction(user.email!, `Updated workflow configuration for stage: ${data.stage_key}`, 'settings', id);

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
