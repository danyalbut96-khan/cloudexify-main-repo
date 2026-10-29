import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('intern_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const internId = payload.id as string

    const { sessionId, type, questionIndex } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select('id, intern_id, status, violation_count, violations_log, settings_id')
      .eq('id', sessionId)
      .eq('intern_id', internId)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json({ status: session.status, ended: true })
    }

    const now = new Date().toISOString()
    const currentCount = (session.violation_count || 0) + 1
    const currentLog = Array.isArray(session.violations_log) ? session.violations_log : []

    currentLog.push({
      timestamp: now,
      type: type || 'tab_switch',
      question_index: questionIndex ?? null
    })

    // Check if tab-switch cancellation is enabled in settings
    let cancelEnabled = true
    if (session.settings_id) {
      const { data: settings } = await supabase
        .from('interview_settings')
        .select('tab_switch_cancel_enabled')
        .eq('id', session.settings_id)
        .maybeSingle()

      if (settings && settings.tab_switch_cancel_enabled === false) {
        cancelEnabled = false
      }
    }

    if (cancelEnabled) {
      // End interview immediately
      await supabase
        .from('interview_sessions')
        .update({
          status: 'cancelled_tab_switch',
          violation_count: currentCount,
          violations_log: currentLog,
          flagged_question_index: questionIndex ?? null,
          submitted_at: now,
          updated_at: now
        })
        .eq('id', sessionId)

      // Move intern to under_review with flag
      await supabase
        .from('interns')
        .update({ pipeline_stage: 'under_review' })
        .eq('id', internId)

      // Admin notification
      try { await supabase.from('admin_notifications').insert({ title: 'Interview Flagged: Tab Switch Violation', message: 'Candidate session ended due to tab switch at Question #' + ((questionIndex ?? 0) + 1), type: 'interview_violation' }); } catch (e) {}

      return NextResponse.json({
        cancelled: true,
        violationCount: currentCount,
        message: 'Your interview was ended and is under review.'
      })
    } else {
      // Just record violation without immediate cancellation
      await supabase
        .from('interview_sessions')
        .update({
          violation_count: currentCount,
          violations_log: currentLog,
          updated_at: now
        })
        .eq('id', sessionId)

      return NextResponse.json({
        cancelled: false,
        violationCount: currentCount
      })
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
