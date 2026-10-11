import { createClient, getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batch_id')
    const status = searchParams.get('status') // 'all', 'pending_verification', 'verified', 'rejected', 'expired'

    const adminDb = getAdminClient()

    // 1. Fetch batches
    const { data: batches } = await adminDb
      .from('batches')
      .select('id, name, status')
      .order('created_at', { ascending: false })

    // 2. Fetch candidates that have reached shortlisted stage or later
    let query = adminDb
      .from('interns')
      .select(`
        id,
        full_name,
        email,
        whatsapp,
        domain,
        semester,
        registration_number,
        university_registration_number,
        pipeline_stage,
        status,
        payment_deadline,
        payment_method,
        payment_transaction_id,
        payment_screenshot_url,
        payment_status,
        payment_verified_at,
        payment_verified_by,
        batch_id,
        created_at,
        batches (id, name, status)
      `)
      .in('pipeline_stage', ['shortlisted', 'payment_pending', 'approved', 'cancelled_non_payment'])
      .order('created_at', { ascending: false })

    if (batchId && batchId !== 'all') {
      query = query.eq('batch_id', batchId)
    }

    const { data: candidates, error } = await query
    if (error) throw error

    // 3. Detect duplicate transaction IDs across all candidates
    const tidCounts: Record<string, number> = {}
    ;(candidates || []).forEach(c => {
      if (c.payment_transaction_id) {
        const norm = c.payment_transaction_id.trim().toLowerCase()
        tidCounts[norm] = (tidCounts[norm] || 0) + 1
      }
    })

    const enriched = (candidates || []).map(c => {
      const norm = c.payment_transaction_id?.trim().toLowerCase()
      const isDuplicate = norm ? (tidCounts[norm] || 0) > 1 : false
      const isExpired = c.payment_deadline ? new Date(c.payment_deadline).getTime() < Date.now() : false

      return {
        ...c,
        is_duplicate_tid: isDuplicate,
        is_deadline_expired: isExpired
      }
    })

    // Filter by payment status if requested
    const filtered = enriched.filter(c => {
      if (!status || status === 'all') return true
      if (status === 'pending_verification') return c.payment_status === 'pending_verification'
      if (status === 'verified') return c.payment_status === 'verified' || c.pipeline_stage === 'approved'
      if (status === 'expired') return c.pipeline_stage === 'cancelled_non_payment' || (c.is_deadline_expired && c.payment_status !== 'verified')
      return true
    })

    return NextResponse.json({
      payments: filtered,
      batches: batches || [],
      summary: {
        total: enriched.length,
        pending_verification: enriched.filter(c => c.payment_status === 'pending_verification').length,
        verified: enriched.filter(c => c.payment_status === 'verified' || c.pipeline_stage === 'approved').length,
        expired: enriched.filter(c => c.pipeline_stage === 'cancelled_non_payment').length,
        duplicate_tids: enriched.filter(c => c.is_duplicate_tid).length
      }
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
