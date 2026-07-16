import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [projectsResult, settingsResult] = await Promise.all([
    supabase
      .from('intern_projects')
      .select('*')
      .order('submitted_at', { ascending: false }),
    supabase
      .from('intern_analysis_settings')
      .select('max_projects_per_intern')
      .eq('id', 1)
      .maybeSingle()
  ])

  return NextResponse.json({
    projects: projectsResult.data || [],
    maxProjects: settingsResult.data?.max_projects_per_intern ?? 4
  })
}
