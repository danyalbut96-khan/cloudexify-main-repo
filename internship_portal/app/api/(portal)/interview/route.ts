import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { generateInterviewQuestions } from '@/lib/ai/interview-evaluator'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

async function getAuthenticatedIntern() {
  const token = cookies().get('intern_token')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { id: string; email: string }
  } catch {
    return null
  }
}

// GET: Check interview status & active session
export async function GET(request: NextRequest) {
  try {
    const authIntern = await getAuthenticatedIntern()
    if (!authIntern) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getAdminClient()

    // 1. Fetch intern info
    const { data: intern, error: internError } = await supabase
      .from('interns')
      .select('id, full_name, email, domain, skill_level, semester, batch_id, status, pipeline_stage')
      .eq('id', authIntern.id)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 })
    }

    // 2. Fetch existing session for this batch
    const { data: session } = await supabase
      .from('interview_sessions')
      .select('id, status, started_at, expires_at, submitted_at, retry_count, questions, answers, violation_count')
      .eq('intern_id', intern.id)
      .eq('batch_id', intern.batch_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const now = new Date()
    let isExpired = false
    let isLive = false

    if (session && session.status === 'in_progress') {
      const expiry = new Date(session.expires_at)
      if (now > expiry) {
        isExpired = true
      } else {
        isLive = true
      }
    }

    return NextResponse.json({
      success: true,
      intern: {
        id: intern.id,
        full_name: intern.full_name,
        domain: intern.domain,
        pipeline_stage: intern.pipeline_stage || 'registered',
        status: intern.status
      },
      session: session ? {
        id: session.id,
        status: isExpired ? 'expired' : session.status,
        isLive,
        expires_at: session.expires_at,
        questions: isLive ? session.questions : [],
        answers: isLive ? session.answers : {},
        violation_count: session.violation_count,
        submitted_at: session.submitted_at
      } : null
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST: Start a new interview session (or resume current live session)
export async function POST(request: NextRequest) {
  try {
    const authIntern = await getAuthenticatedIntern()
    if (!authIntern) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getAdminClient()

    const { data: intern, error: internError } = await supabase
      .from('interns')
      .select('id, full_name, domain, skill_level, semester, batch_id, status, pipeline_stage')
      .eq('id', authIntern.id)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Intern record not found' }, { status: 404 })
    }

    // Check pipeline eligibility
    const stage = String(intern.pipeline_stage || intern.status || 'registered').toLowerCase()
    if (stage === 'registered') {
      return NextResponse.json({
        error: 'Your application is currently under initial review. You will be able to take your technical interview once called by admissions.'
      }, { status: 403 })
    }
    if (stage === 'approved' || stage === 'shortlisted' || stage === 'under_review' || stage === 'interview_completed') {
      return NextResponse.json({
        error: 'Your interview has already been submitted and is currently being processed.'
      }, { status: 400 })
    }

    // Check existing session
    const { data: existingSession } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('intern_id', intern.id)
      .eq('batch_id', intern.batch_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const now = new Date()

    if (existingSession) {
      // If currently active and unexpired, resume it
      if (existingSession.status === 'in_progress' && new Date(existingSession.expires_at) > now) {
        return NextResponse.json({
          success: true,
          resumed: true,
          session: existingSession
        })
      }

      // If candidate is in interview_pending stage (called by admin or retry granted), delete old session and start fresh
      if (stage === 'interview_pending') {
        await supabase
          .from('interview_sessions')
          .delete()
          .eq('id', existingSession.id)
      } else if (existingSession.status !== 'in_progress' && (!existingSession.retry_count || existingSession.retry_count <= 0)) {
        return NextResponse.json({
          error: 'You have already attempted the interview for this batch. Retries must be approved by an administrator.'
        }, { status: 403 })
      }
    }

    // Fetch domain interview settings
    const { data: settings } = await supabase
      .from('interview_settings')
      .select('*')
      .eq('domain', intern.domain)
      .eq('expertise_level', intern.skill_level || 'Beginner')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    const questionCount = settings?.question_count || 3
    const timeLimitMinutes = settings?.time_limit_minutes || (intern.skill_level === 'Expert' ? 12 : (intern.skill_level === 'Intermediate' ? 15 : 20))

    // Generate targeted questions
    const questions = await generateInterviewQuestions({
      domain: intern.domain,
      expertiseLevel: intern.skill_level || 'Beginner',
      semester: intern.semester || 3,
      questionCount,
      difficultyGuidance: settings?.difficulty_guidance || ''
    })

    // Compute Authoritative Server Expiration
    const expiresAt = new Date(Date.now() + timeLimitMinutes * 60 * 1000).toISOString()

    // Insert new session
    const { data: newSession, error: createError } = await supabase
      .from('interview_sessions')
      .insert({
        intern_id: intern.id,
        batch_id: intern.batch_id,
        domain: intern.domain,
        expertise_level: intern.skill_level || 'Beginner',
        semester: intern.semester || 3,
        settings_id: settings?.id || null,
        questions,
        answers: {},
        started_at: new Date().toISOString(),
        expires_at: expiresAt,
        status: 'in_progress'
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: 'Failed to initiate interview: ' + createError.message }, { status: 500 })
    }

    // Update candidate pipeline stage to interview_pending/in_progress
    await supabase
      .from('interns')
      .update({ pipeline_stage: 'interview_pending' })
      .eq('id', intern.id)

    return NextResponse.json({
      success: true,
      resumed: false,
      session: newSession
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}