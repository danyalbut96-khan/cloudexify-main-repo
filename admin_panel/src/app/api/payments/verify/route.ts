import { createClient, getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendApprovalEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { intern_id, action, rejection_reason } = body

    if (!intern_id || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'intern_id and valid action (approve/reject) are required' }, { status: 400 })
    }

    const adminDb = getAdminClient()

    // 1. Fetch candidate
    const { data: intern, error: internError } = await adminDb
      .from('interns')
      .select('*, batches(id, name)')
      .eq('id', intern_id)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const now = new Date()
    const batchName = intern.batches?.name || 'Internship Program'

    if (action === 'approve') {
      // Approve candidate: unlock full portal access
      const { error: updateError } = await adminDb
        .from('interns')
        .update({
          pipeline_stage: 'approved',
          status: 'Accepted',
          payment_status: 'verified',
          payment_verified_at: now.toISOString(),
          payment_verified_by: user.email
        })
        .eq('id', intern_id)

      if (updateError) throw updateError

      // Send Acceptance & Portal Unlock Email
      try {
        await sendApprovalEmail({
          to: intern.email,
          fullName: intern.full_name,
          batchName: batchName,
          domain: intern.domain,
          registrationNumber: intern.registration_number
        })
      } catch (emailErr) {
        console.error(`Failed to send approval email to ${intern.email}:`, emailErr)
      }

      // Record audit log
      await adminDb.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'PAYMENT_VERIFIED_AND_APPROVED',
        target_type: 'intern',
        target_id: intern_id,
        details: {
          transaction_id: intern.payment_transaction_id,
          verified_by: user.email,
          approved_at: now.toISOString()
        }
      })

      return NextResponse.json({
        success: true,
        message: `${intern.full_name} has been approved and enrolled. Portal unlocked.`
      })

    } else if (action === 'reject') {
      // Reject receipt
      const { error: updateError } = await adminDb
        .from('interns')
        .update({
          payment_status: 'rejected',
          pipeline_stage: 'shortlisted' // Keep shortlisted so they can re-upload if within deadline
        })
        .eq('id', intern_id)

      if (updateError) throw updateError

      // Record audit log
      await adminDb.from('admin_audit_logs').insert({
        admin_id: user.id,
        action: 'PAYMENT_RECEIPT_REJECTED',
        target_type: 'intern',
        target_id: intern_id,
        details: {
          reason: rejection_reason || 'Unverifiable transaction receipt',
          rejected_by: user.email
        }
      })

      return NextResponse.json({
        success: true,
        message: `Payment proof for ${intern.full_name} was marked as rejected.`
      })
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
