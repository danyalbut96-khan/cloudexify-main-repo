import { createClient, getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const adminDb = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { intern_id, new_score, reason } = body

    if (!intern_id || new_score === undefined || new_score === null) {
      return NextResponse.json({ error: 'intern_id and new_score are required' }, { status: 400 })
    }

    const numScore = Number(new_score)
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      return NextResponse.json({ error: 'Score must be a number between 0 and 100' }, { status: 400 })
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json({ error: 'A descriptive reason (min 5 characters) is required for audit logs' }, { status: 400 })
    }

    // 1. Fetch latest session
    const { data: session, error: sessErr } = await adminDb
      .from('interview_sessions')
      .select('*')
      .eq('intern_id', intern_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sessErr || !session) {
      return NextResponse.json({ error: 'Interview session not found for this candidate' }, { status: 404 })
    }

    const now = new Date()
    const originalScore = session.ai_score

    // 2. Update session with override
    const { error: updateErr } = await adminDb
      .from('interview_sessions')
      .update({
        override_score: numScore,
        override_reason: reason.trim(),
        override_by: user.email,
        override_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', session.id)

    if (updateErr) throw updateErr

    // 3. Insert audit log
    await adminDb.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'INTERVIEW_SCORE_OVERRIDE',
      target_type: 'interview_session',
      target_id: session.id,
      details: {
        intern_id,
        original_score: originalScore,
        override_score: numScore,
        reason: reason.trim(),
        admin_email: user.email
      }
    })

    return NextResponse.json({
      message: 'Score successfully overridden',
      session_id: session.id,
      original_score: originalScore,
      new_score: numScore
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
