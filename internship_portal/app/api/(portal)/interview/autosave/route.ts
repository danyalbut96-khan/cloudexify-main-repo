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

    const { sessionId, answers } = await request.json()
    if (!sessionId || !answers) {
      return NextResponse.json({ error: 'Missing sessionId or answers' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Fetch current session and verify ownership
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select('id, intern_id, status, expires_at, answers')
      .eq('id', sessionId)
      .eq('intern_id', internId)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.status !== 'in_progress') {
      return NextResponse.json({
        error: `Interview session is already ${session.status}.`,
        status: session.status
      }, { status: 400 })
    }

    // 2. Authoritative Server Timer Check
    const now = new Date()
    const expiry = new Date(session.expires_at)
    // 15 seconds grace period for network latency
    if (now.getTime() > expiry.getTime() + 15000) {
      // Mark as expired
      await supabase
        .from('interview_sessions')
        .update({
          status: 'expired',
          submitted_at: now.toISOString(),
          answers: { ...session.answers, ...answers }
        })
        .eq('id', sessionId)

      await supabase
        .from('interns')
        .update({ pipeline_stage: 'under_review' })
        .eq('id', internId)

      return NextResponse.json({
        expired: true,
        message: 'Interview time limit has expired. Responses have been automatically submitted.'
      })
    }

    // Merge answers
    const mergedAnswers = { ...(session.answers || {}), ...answers }

    await supabase
      .from('interview_sessions')
      .update({ answers: mergedAnswers, updated_at: now.toISOString() })
      .eq('id', sessionId)

    return NextResponse.json({ success: true, saved: true })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}