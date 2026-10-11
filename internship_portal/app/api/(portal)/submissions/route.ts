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

    const { data: projects, error } = await supabase
      .from('intern_projects')
      .select('id, project_number, project_title, repo_url, analysis_status, created_at, manual_status, manual_marks, manual_feedback, ai_score, ai_feedback')
      .eq('intern_id', internId)
      .order('project_number', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, projects: projects || [] })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

