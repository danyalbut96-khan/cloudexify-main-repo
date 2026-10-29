import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const internId = params.id

    // 1. Fetch Intern details
    const { data: intern, error: internError } = await supabase
      .from('interns')
      .select(`
        *,
        batches (
          id,
          name,
          status,
          start_date,
          end_date
        )
      `)
      .eq('id', internId)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    // 2. Fetch latest interview session
    const { data: session } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('intern_id', internId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 3. Fetch audit logs for this candidate
    const { data: auditLogs } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .eq('target_id', internId)
      .order('created_at', { ascending: false })

    // 4. Calculate domain rank within this batch and domain
    let domainRank = null
    let totalInDomain = 0

    if (intern.batch_id && intern.domain) {
      const { data: allDomainSessions } = await supabase
        .from('interview_sessions')
        .select('intern_id, ai_score, override_score')
        .eq('batch_id', intern.batch_id)
        .eq('domain', intern.domain)
        .not('ai_score', 'is', null)

      if (allDomainSessions && allDomainSessions.length > 0) {
        const internBestScores: Record<string, number> = {}
        allDomainSessions.forEach(s => {
          const effScore = Number(s.override_score ?? s.ai_score ?? 0)
          if (internBestScores[s.intern_id] === undefined || effScore > internBestScores[s.intern_id]) {
            internBestScores[s.intern_id] = effScore
          }
        })

        const sorted = Object.entries(internBestScores).sort((a, b) => b[1] - a[1])
        totalInDomain = sorted.length
        const rankIdx = sorted.findIndex(([id]) => id === internId)
        if (rankIdx !== -1) {
          domainRank = rankIdx + 1
        }
      }
    }

    return NextResponse.json({
      candidate: intern,
      session: session || null,
      domain_rank: domainRank,
      total_in_domain: totalInDomain,
      audit_logs: auditLogs || []
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
