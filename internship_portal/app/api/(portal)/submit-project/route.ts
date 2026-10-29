import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

export async function POST(request: NextRequest) {
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

    const body = await request.json()

    const projectTitle = String(body.project_title || '').trim()
    const repoUrl = String(body.repo_url || '').trim()
    const projectNumber = Number(body.project_number)
    const description = String(body.description || '').trim().slice(0, 300)

    // Validate required fields
    if (!projectTitle || !repoUrl || !projectNumber) {
      return NextResponse.json({ error: 'All required fields must be provided.' }, { status: 400 })
    }

    // Validate GitHub URL
    if (!repoUrl.match(/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/)) {
      return NextResponse.json({ error: 'Please enter a valid public GitHub repository URL.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Verify intern exists and fetch secure details
    const { data: intern, error: internError } = await supabase
      .from('interns')
      .select('id, full_name, registration_number, domain')
      .eq('id', internId)
      .maybeSingle()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Intern not found.' }, { status: 404 })
    }
    
    const internName = intern.full_name
    const registrationNumber = intern.registration_number
    
    // Extract correct domain code from registration number
    const regNo = (registrationNumber || '').toUpperCase()
    const normalizedReg = regNo.replace(/[^A-Z0-9]/g, '')
    const domainCodeMatch = normalizedReg.match(/[A-Z]{2}\d{4}([A-Z]+)\d+/)
    const domainCode = domainCodeMatch ? domainCodeMatch[1] : intern.domain

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
