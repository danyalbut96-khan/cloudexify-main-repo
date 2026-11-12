import { createClient, getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase/authorization'
import { sendWaitlistPromotedEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response
  const { user } = authorization

  try {

    const adminDb = getAdminClient()
    const now = new Date()

    // 1. Query candidates whose 72h payment deadline has passed and are not verified
    const { data: expiredCandidates, error: fetchErr } = await adminDb
      .from('interns')
      .select('id, full_name, email, domain, batch_id, payment_deadline, batches(id, name)')
      .eq('pipeline_stage', 'shortlisted')
      .lt('payment_deadline', now.toISOString())
      .is('payment_transaction_id', null)

    if (fetchErr) throw fetchErr

    const cancelledList = []
    const promotedList = []

    for (const cand of (expiredCandidates || [])) {
      // Release seat: set status to cancelled_non_payment
      const { error: cancelErr } = await adminDb
        .from('interns')
        .update({
          pipeline_stage: 'cancelled_non_payment',
          status: 'cancelled_non_payment',
          final_rejection_reason: 'Payment deadline (72h) expired without receipt submission'
        })
        .eq('id', cand.id)

      if (cancelErr) {
        console.error(`Failed to cancel intern ${cand.id}:`, cancelErr)
        continue
      }

      cancelledList.push({ id: cand.id, name: cand.full_name, domain: cand.domain })

      // Audit Log
      await adminDb.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'PAYMENT_DEADLINE_EXPIRED_SEAT_RELEASED',
        target_type: 'intern',
        target_id: cand.id,
        details: { domain: cand.domain, batch_id: cand.batch_id, deadline: cand.payment_deadline }
      })

      // Auto-promote oldest waitlisted candidate for this batch and domain
      if (cand.batch_id && cand.domain) {
        const { data: waitlisted } = await adminDb
          .from('interns')
          .select('id, full_name, email, registration_number')
          .eq('batch_id', cand.batch_id)
          .eq('domain', cand.domain)
          .or('status.eq.Waitlisted,pipeline_stage.eq.waitlisted')
          .order('created_at', { ascending: true })
          .limit(1)

        if (waitlisted && waitlisted.length > 0) {
          const promoted = waitlisted[0]
          await adminDb
            .from('interns')
            .update({
              status: 'Pending',
              pipeline_stage: 'interview_pending',
              waitlisted_at: null
            })
            .eq('id', promoted.id)

          const batchName = Array.isArray(cand.batches) ? cand.batches[0]?.name : (cand.batches as any)?.name || 'Internship Program'

          // Email promoted intern
          try {
            await sendWaitlistPromotedEmail({
              to: promoted.email,
              fullName: promoted.full_name,
              registrationNumber: promoted.registration_number,
              domain: cand.domain,
              batchName: batchName
            })
          } catch (emailErr) {
            console.error(`Failed to send waitlist promotion email:`, emailErr)
          }

          await adminDb.from('admin_audit_logs').insert({
            admin_id: user.id,
            action: 'WAITLIST_AUTO_PROMOTED_FROM_EXPIRED_PAYMENT',
            target_type: 'intern',
            target_id: promoted.id,
            details: { replaced_expired_intern_id: cand.id, domain: cand.domain, batch_id: cand.batch_id }
          })

          promotedList.push({ id: promoted.id, name: promoted.full_name, domain: cand.domain })
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Expired ${cancelledList.length} candidate(s) and auto-promoted ${promotedList.length} waitlist intern(s).`,
      cancelled_count: cancelledList.length,
      promoted_count: promotedList.length,
      cancelled: cancelledList,
      promoted: promotedList
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
