import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const internId = String(body.intern_id || '').trim()
    const registrationNumber = String(body.registration_number || '').trim().toUpperCase()
    const internName = String(body.intern_name || '').trim()
    const projectTitle = String(body.project_title || '').trim()
    const repoUrl = String(body.repo_url || '').trim()
    const domainCode = String(body.domain_code || '').trim().toUpperCase()
    const projectNumber = Number(body.project_number)
    const description = String(body.description || '').trim().slice(0, 300)

    // Validate required fields
    if (!internId || !registrationNumber || !internName || !projectTitle || !repoUrl || !domainCode || !projectNumber) {
      return NextResponse.json({ error: 'All required fields must be provided.' }, { status: 400 })
    }

    // Validate GitHub URL
    if (!repoUrl.match(/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/)) {
      return NextResponse.json({ error: 'Please enter a valid public GitHub repository URL (e.g. https://github.com/username/repo).' }, { status: 400 })
    }

    const supabase = createClient()

    // Verify intern exists
    const { data: intern, error: internError } = await supabase
      .from('interns')
      .select('id')
      .eq('id', internId)
      .maybeSingle()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Intern not found.' }, { status: 404 })
    }

    // Get max projects setting
    const { data: analysisSettings } = await supabase
      .from('intern_analysis_settings')
      .select('max_projects_per_intern')
      .eq('id', 1)
      .maybeSingle()

    const maxProjects = analysisSettings?.max_projects_per_intern ?? 4

    // Count existing projects
    const { count: projectCount } = await supabase
      .from('intern_projects')
      .select('id', { count: 'exact', head: true })
      .eq('intern_id', internId)

    const submittedCount = projectCount ?? 0

    if (submittedCount >= maxProjects) {
      return NextResponse.json({ error: `Maximum of ${maxProjects} projects already submitted.` }, { status: 400 })
    }

    // Check this project number is not already taken
    const { data: existing } = await supabase
      .from('intern_projects')
      .select('id')
      .eq('intern_id', internId)
      .eq('project_number', projectNumber)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: `Project #${projectNumber} already submitted.` }, { status: 409 })
    }

    // Insert the project
    const { data: project, error: insertError } = await supabase
      .from('intern_projects')
      .insert({
        intern_id: internId,
        registration_number: registrationNumber,
        intern_name: internName,
        project_title: projectTitle,
        repo_url: repoUrl,
        domain_code: domainCode,
        project_number: projectNumber,
        description: description || null,
        analysis_status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to submit project: ' + insertError.message }, { status: 500 })
    }

    // Insert Notification
    await supabase.from('admin_notifications').insert({
      title: 'New Project Submission',
      message: `${internName} submitted Project #${projectNumber} (${domainCode})`,
      type: 'project_submission'
    })

    return NextResponse.json({ project, submittedCount: submittedCount + 1, maxProjects })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
