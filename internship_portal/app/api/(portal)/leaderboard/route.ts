import { getAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = getAdminClient()
    
    // Fetch all analyzed projects
    const { data: projects, error } = await supabase
      .from('intern_projects')
      .select('registration_number, domain_code, ai_score')
      .eq('analysis_status', 'done')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Get max projects configuration
    const { data: settings } = await supabase
      .from('intern_analysis_settings')
      .select('max_projects_per_intern')
      .eq('id', 1)
      .maybeSingle()

    const maxProjects = settings?.max_projects_per_intern ?? 4

    // Group scores by intern (registration_number is unique per intern)
    const scoresMap = new Map<string, { domain_code: string; totalScore: number; count: number }>()

    projects.forEach(p => {
      const reg = p.registration_number.toUpperCase()
      const score = Number(p.ai_score || 0)
      
      if (!scoresMap.has(reg)) {
        scoresMap.set(reg, { domain_code: p.domain_code, totalScore: 0, count: 0 })
      }
      
      const current = scoresMap.get(reg)!
      current.totalScore += score
      current.count += 1
    })

    // Group by domain
    const domainLeaderboards: Record<string, Array<{ registration_number: string; total_score: number; projects_count: number }>> = {
      PY: [],
      CPP: [],
      JAVA: [],
      DS: [],
      CYB: [],
      GEN: []
    }

    scoresMap.forEach((info, reg) => {
      if (domainLeaderboards[info.domain_code] !== undefined) {
        domainLeaderboards[info.domain_code].push({
          registration_number: reg,
          total_score: Number(info.totalScore.toFixed(1)),
          projects_count: info.count
        })
      }
    })

    // Sort each domain by total score descending and take top 10
    Object.keys(domainLeaderboards).forEach(domain => {
      domainLeaderboards[domain] = domainLeaderboards[domain]
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 10)
    })

    return NextResponse.json({
      leaderboards: domainLeaderboards,
      maxProjects
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
