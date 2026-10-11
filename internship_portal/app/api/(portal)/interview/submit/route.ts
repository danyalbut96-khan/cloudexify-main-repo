import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { evaluateInterviewSubmission } from '@/lib/ai/interview-evaluator'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('intern_token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const internId = payload.id as string

    const { sessionId, answers } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Fetch session and candidate
    const { data: session, error } = await supabase
      .from('interview_sessions')
      .select('*, interns(full_name, domain, skill_level, semester)')
      .eq('id', sessionId)
      .eq('intern_id', internId)
      .single()

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Idempotency: if already completed and evaluated, don't run evaluation twice
    if (session.status === 'completed' && session.ai_evaluated_at) {
      return NextResponse.json({
        success: true,
        message: 'Your interview is completed. Please check back; your result will appear here after review.'
      })
    }

    const now = new Date()
    const finalAnswers = { ...(session.answers || {}), ...(answers || {}) }

    // 2. Authoritative Server Timer Check (with 30s grace for final network latency)
    const expiry = new Date(session.expires_at)
    const isLate = now.getTime() > expiry.getTime() + 30000

    // 3. Mark completed
    await supabase
      .from('interview_sessions')
      .update({
        status: isLate ? 'expired' : 'completed',
        answers: finalAnswers,
        submitted_at: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', sessionId)

    // Update intern stage to under_review
    await supabase
      .from('interns')
      .update({ pipeline_stage: 'under_review' })
      .eq('id', internId)

    // 4. Server-Side AI Evaluation
    try {
      const evaluation = await evaluateInterviewSubmission({
        questions: session.questions,
        answers: finalAnswers,
        domain: session.domain,
        expertiseLevel: session.expertise_level,
        semester: session.semester,
        violationCount: session.violation_count || 0
      })

      await supabase
        .from('interview_sessions')
        .update({
          ai_score: evaluation.total_score,
          ai_suggestion: evaluation.ai_suggestion,
          ai_confidence: evaluation.ai_confidence,
          ai_evaluation: evaluation,
          ai_evaluated_at: new Date().toISOString(),
          ai_model: 'openai/gpt-4o-mini',
          ai_prompt_version: 'v1.0'
        })
        .eq('id', sessionId)

      // Insert admin notification
      try { await supabase.from('admin_notifications').insert({ title: 'Interview Completed', message: 'Candidate completed AI Interview - AI Score: ' + evaluation.total_score + '/100.', type: 'interview_completed' }); } catch (e) {}

    } catch (evalErr) {
      console.error('[AI EVALUATION BACKGROUND ERROR]', evalErr)
    }

    // 5. Intern response (Never exposes score or internal comments)
    return NextResponse.json({
      success: true,
      message: 'Your interview is completed. Please check back; your result will appear here after review.'
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
