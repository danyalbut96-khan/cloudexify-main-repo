import { createClient, getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batch_id')

    const adminDb = getAdminClient()

    // 1. Fetch batch domains
    let domainQuery = adminDb
      .from('batch_domains')
      .select('id, batch_id, domain, seats_total, seats_filled, batches(id, name, status)')

    if (batchId && batchId !== 'all') {
      domainQuery = domainQuery.eq('batch_id', batchId)
    }

    const { data: batchDomains, error: bdError } = await domainQuery
    if (bdError) throw bdError

    // 2. Fetch all interns for these batches
    let internQuery = adminDb
      .from('interns')
      .select('id, batch_id, domain, status, pipeline_stage, payment_status')

    if (batchId && batchId !== 'all') {
      internQuery = internQuery.eq('batch_id', batchId)
    }

    const { data: interns, error: intError } = await internQuery
    if (intError) throw intError

    // 3. Fetch interview session flags
    const { data: sessions } = await adminDb
      .from('interview_sessions')
      .select('intern_id, status, violation_count')
      .in('intern_id', (interns || []).map(i => i.id))

    const sessionMap = new Map()
    ;(sessions || []).forEach(s => {
      sessionMap.set(s.intern_id, s)
    })

    // 4. Aggregate metrics per batch & domain
    const stats: Record<string, any> = {}

    ;(batchDomains || []).forEach(bd => {
      const key = `${bd.batch_id}_${bd.domain}`
      stats[key] = {
        batch_id: bd.batch_id,
        batch_name: (bd.batches as any)?.name || 'Batch',
        domain: bd.domain,
        seats_total: bd.seats_total || 0,
        seats_filled: bd.seats_filled || 0,
        seats_left: Math.max(0, (bd.seats_total || 0) - (bd.seats_filled || 0)),
        registered: 0,
        waitlisted: 0,
        interviews_pending: 0,
        interviews_completed: 0,
        interviews_flagged: 0,
        shortlisted: 0,
        awaiting_payment: 0,
        approved: 0,
        rejected: 0,
        cancelled_non_payment: 0
      }
    })

    ;(interns || []).forEach(i => {
      const key = `${i.batch_id}_${i.domain}`
      if (!stats[key]) {
        stats[key] = {
          batch_id: i.batch_id,
          batch_name: 'Batch',
          domain: i.domain,
          seats_total: 0,
          seats_filled: 0,
          seats_left: 0,
          registered: 0,
          waitlisted: 0,
          interviews_pending: 0,
          interviews_completed: 0,
          interviews_flagged: 0,
          shortlisted: 0,
          awaiting_payment: 0,
          approved: 0,
          rejected: 0,
          cancelled_non_payment: 0
        }
      }

      stats[key].registered++

      const stage = (i.pipeline_stage || i.status || '').toLowerCase()
      const sess = sessionMap.get(i.id)

      if (i.status === 'Waitlisted' || stage === 'waitlisted') {
        stats[key].waitlisted++
      } else if (stage === 'interview_pending') {
        stats[key].interviews_pending++
      } else if (stage === 'under_review' || stage === 'interview_completed') {
        stats[key].interviews_completed++
      } else if (stage === 'shortlisted') {
        stats[key].shortlisted++
        stats[key].awaiting_payment++
      } else if (stage === 'payment_pending') {
        stats[key].shortlisted++
        stats[key].awaiting_payment++
      } else if (stage === 'approved' || i.status === 'Accepted') {
        stats[key].approved++
      } else if (stage === 'rejected' || i.status === 'Rejected') {
        stats[key].rejected++
      } else if (stage === 'cancelled_non_payment') {
        stats[key].cancelled_non_payment++
      }

      if (sess && (sess.violation_count > 0 || sess.status === 'cancelled_tab_switch')) {
        stats[key].interviews_flagged++
      }
    })

    return NextResponse.json({
      stats: Object.values(stats)
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
