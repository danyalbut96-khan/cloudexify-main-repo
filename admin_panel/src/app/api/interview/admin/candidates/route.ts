import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batch_id')
    const domain = searchParams.get('domain')
    const showArchive = searchParams.get('show_archive') === 'true'

    // 1. Fetch batches for archive filtering
    const { data: batches } = await supabase
      .from('batches')
      .select('id, name, status')
      .order('created_at', { ascending: false })

    const activeBatchIds = (batches || [])
      .filter(b => showArchive ? true : b.status !== 'completed')
      .map(b => b.id)

    // 2. Fetch Candidates
    let query = supabase
      .from('interns')
      .select(`
        id,
        full_name,
        email,
        whatsapp,
        domain,
        skill_level,
        semester,
        university,
        university_registration_number,
        interest,
        linkedin_url,
        resume_url,
        pipeline_stage,
        status,
        batch_id,
        created_at,
        batches(id, name, status)
      `)
      .order('created_at', { ascending: false })

    if (batchId && batchId !== 'all') {
      query = query.eq('batch_id', batchId)
    } else if (activeBatchIds.length > 0) {
      query = query.in('batch_id', activeBatchIds)
    }

    if (domain && domain !== 'all') {
      query = query.eq('domain', domain)
    }

    const { data: candidates, error: candError } = await query
    if (candError) throw candError

    // 3. Fetch latest interview sessions for these candidates
    const candidateIds = (candidates || []).map(c => c.id)
    let sessionsMap: Record<string, any> = {}

    if (candidateIds.length > 0) {
      const { data: sessions } = await supabase
        .from('interview_sessions')
        .select(`
          id,
          intern_id,
          batch_id,
          status,
          started_at,
          expires_at,
          submitted_at,
          violation_count,
          retry_count,
          ai_score,
          ai_suggestion,
          ai_confidence,
          flagged_question_index
        `)
        .in('intern_id', candidateIds)
        .order('created_at', { ascending: false })

      if (sessions) {
        sessions.forEach(s => {
          if (!sessionsMap[s.intern_id]) {
            sessionsMap[s.intern_id] = s
          }
        })
      }
    }

    // 4. Combine and compute domain-level rank
    const enriched = (candidates || []).map(c => {
      const sess = sessionsMap[c.id] || null
      return {
        ...c,
        session: sess,
        interview_status: sess ? sess.status : 'not_started',
        ai_score: sess?.ai_score ?? null,
        ai_suggestion: sess?.ai_suggestion ?? null,
        violation_count: sess?.violation_count ?? 0,
        retry_count: sess?.retry_count ?? 0
      }
    })

    // Compute rank per domain among completed interviews
    const domainGroups: Record<string, any[]> = {}
    enriched.forEach(c => {
      if (!domainGroups[c.domain]) domainGroups[c.domain] = []
      domainGroups[c.domain].push(c)
    })

    Object.values(domainGroups).forEach(group => {
      group.sort((a, b) => (b.ai_score ?? -1) - (a.ai_score ?? -1))
      group.forEach((item, idx) => {
        item.domain_rank = item.ai_score !== null ? idx + 1 : null
      })
    })

    return NextResponse.json({
      candidates: enriched,
      batches: batches || []
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}