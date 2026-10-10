import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get('intern_token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    let payload
    try {
      const { payload: jwtPayload } = await jwtVerify(token, JWT_SECRET)
      payload = jwtPayload
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 })
    }

    const internId = payload.id

    const supabase = getAdminClient()

    // 1. Fetch Intern Details
    const { data: intern, error: internError } = await supabase
      .from('interns')
      .select('id, full_name, email, whatsapp, university, semester, registration_number, status, domain, batch_id, batches(name, status, end_date, documents_locked, release_ai_feedback)')
      .eq('id', internId)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 })
    }

    // 2. Fetch Documents (if they exist)
    const { data: documents } = await supabase
      .from('intern_documents')
      .select('offer_letter_url, certificate_url, experience_certificate_url, recommendation_letter_url')
      .eq('intern_id', internId)
      .maybeSingle()

    // 3. Fetch Tasks (if accepted)
    let tasks = []
    if (intern.status === 'Accepted' || intern.status === 'Offer Letter Issued') {
      if (intern.batch_id) {
        const { data: fetchedTasks } = await supabase
          .from('tasks')
          .select('*')
          .eq('batch_id', intern.batch_id)
          .eq('domain', intern.domain)
          .order('created_at', { ascending: true })
        
        if (fetchedTasks) {
          tasks = fetchedTasks
        }
      }
    }

    // 4. Fetch submitted projects & count
    const { data: internProjects, count: projectCount } = await supabase
      .from('intern_projects')
      .select('id, project_number, project_title, repo_url, description, submitted_at, analysis_status, ai_score, ai_feedback, is_feedback_hidden, manual_status, manual_marks, manual_feedback')
      .eq('intern_id', internId)
      .order('project_number', { ascending: true })

    // 4.5. Get max projects setting
    const { data: analysisSettings } = await supabase
      .from('intern_analysis_settings')
      .select('max_projects_per_intern')
      .eq('id', 1)
      .maybeSingle()
    const maxProjects = analysisSettings?.max_projects_per_intern ?? 4

    // 5. Fetch review status
    const { data: existingReview } = await supabase
      .from('testimonials')
      .select('id')
      .eq('intern_id', internId)
      .maybeSingle()

    const releaseFeedback = (intern.batches as any)?.release_ai_feedback ?? false

    // Process projects for privacy: only show AI feedback/score if release_ai_feedback is enabled and not hidden
    const processedProjects = (internProjects || []).map((p: any) => ({
      ...p,
      ai_score_visible: releaseFeedback && !p.is_feedback_hidden,
      display_ai_score: (releaseFeedback && !p.is_feedback_hidden) ? p.ai_score : null,
      display_ai_feedback: (releaseFeedback && !p.is_feedback_hidden) ? p.ai_feedback : null,
    }))

    return NextResponse.json({
      success: true,
      intern,
      documents: documents || null,
      tasks,
      projects: processedProjects,
      submitted_projects_count: projectCount || (internProjects ? internProjects.length : 0),
      max_projects_count: maxProjects,
      has_reviewed: !!existingReview
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
