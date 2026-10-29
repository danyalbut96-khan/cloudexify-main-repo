import { createClient, getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    let query = supabase
      .from('interview_settings')
      .select('*')
      .order('domain', { ascending: true })
      .order('expertise_level', { ascending: true })
      .order('version', { ascending: false })

    if (domain && domain !== 'all') {
      query = query.eq('domain', domain)
    }

    const { data: settings, error } = await query
    if (error) throw error

    return NextResponse.json({ settings: settings || [] })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const adminDb = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      id,
      domain,
      expertise_level,
      semester_band = 'all',
      question_count = 3,
      time_limit_minutes = 15,
      difficulty_guidance = '',
      prompt_template = '',
      passing_threshold = 60,
      tab_switch_cancel_enabled = true,
      create_new_version = false
    } = body

    if (!domain || !expertise_level) {
      return NextResponse.json({ error: 'domain and expertise_level are required' }, { status: 400 })
    }

    const now = new Date()

    // Question count range: 2 to 9 questions allowed as requested
    const parsedQuestionCount = Math.min(9, Math.max(2, Number(question_count) || 3))
    const parsedTimeLimit = Math.min(90, Math.max(5, Number(time_limit_minutes) || 15))
    const parsedThreshold = Math.min(100, Math.max(0, Number(passing_threshold) || 60))

    if (id && !create_new_version) {
      // Update existing record version
      const { data: updated, error: updateErr } = await adminDb
        .from('interview_settings')
        .update({
          question_count: parsedQuestionCount,
          time_limit_minutes: parsedTimeLimit,
          difficulty_guidance,
          prompt_template,
          passing_threshold: parsedThreshold,
          tab_switch_cancel_enabled: Boolean(tab_switch_cancel_enabled),
          updated_at: now.toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (updateErr) throw updateErr

      // Audit log
      await adminDb.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'INTERVIEW_SETTINGS_UPDATED',
        target_type: 'interview_settings',
        target_id: id,
        details: { domain, expertise_level, question_count: parsedQuestionCount, time_limit_minutes: parsedTimeLimit, passing_threshold: parsedThreshold }
      })

      return NextResponse.json({ message: 'Settings updated successfully', settings: updated })

    } else {
      // Create new version or insert
      const { data: existingLatest } = await adminDb
        .from('interview_settings')
        .select('version')
        .eq('domain', domain)
        .eq('expertise_level', expertise_level)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()

      const newVersion = (existingLatest?.version ?? 0) + 1

      const { data: created, error: createErr } = await adminDb
        .from('interview_settings')
        .insert({
          domain,
          expertise_level,
          semester_band,
          question_count: parsedQuestionCount,
          time_limit_minutes: parsedTimeLimit,
          difficulty_guidance,
          prompt_template,
          passing_threshold: parsedThreshold,
          tab_switch_cancel_enabled: Boolean(tab_switch_cancel_enabled),
          version: newVersion,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select()
        .single()

      if (createErr) throw createErr

      // Audit log
      await adminDb.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'INTERVIEW_SETTINGS_CREATED',
        target_type: 'interview_settings',
        target_id: created.id,
        details: { domain, expertise_level, version: newVersion, question_count: parsedQuestionCount }
      })

      return NextResponse.json({ message: `New setting version v${newVersion} created`, settings: created })
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
