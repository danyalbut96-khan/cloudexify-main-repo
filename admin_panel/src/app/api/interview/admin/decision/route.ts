import { createClient, getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { 
  sendShortlistedEmail, 
  sendRejectionEmail, 
  sendWaitlistPromotedEmail,
  sendInterviewInvitationEmail,
  sendApprovalEmail
} from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const adminDb = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { intern_ids, decision, reason } = body

    if (!Array.isArray(intern_ids) || intern_ids.length === 0) {
      return NextResponse.json({ error: 'intern_ids array is required' }, { status: 400 })
    }

    const validDecisions = ['shortlist', 'reject', 'hold', 'call_interview', 'approve', 'progress']
    if (!validDecisions.includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 })
    }

    const results = []
    const now = new Date()
    const paymentDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 72 hours from now

    for (const internId of intern_ids) {
      // 1. Fetch current intern record with batch & interview sessions
      const { data: intern, error: fetchErr } = await adminDb
        .from('interns')
        .select('*, batches(id, name), interview_sessions(*)')
        .eq('id', internId)
        .single()

      if (fetchErr || !intern) {
        results.push({ id: internId, status: 'error', error: 'Intern not found' })
        continue
      }

      const batchName = intern.batches?.name || 'Internship Program'
      let actionToExecute = decision

      // SMART PROGRESS LOGIC (Tick button):
      // Automatically determine the next logical state:
      if (decision === 'progress') {
        const isPaidOrVerified = 
          intern.payment_status === 'verified' || 
          intern.payment_status === 'pending_verification' || 
          intern.pipeline_stage === 'payment_pending' ||
          intern.pipeline_stage === 'approved' ||
          intern.status === 'Accepted';

        const hasInterviewSession = Array.isArray(intern.interview_sessions) && intern.interview_sessions.length > 0;
        const hasCompletedInterview = hasInterviewSession || intern.pipeline_stage === 'interview_completed' || intern.pipeline_stage === 'under_review';

        if (isPaidOrVerified) {
          actionToExecute = 'approve'
        } else if (hasCompletedInterview) {
          actionToExecute = 'shortlist'
        } else {
          actionToExecute = 'call_interview'
        }
      }

      // If action is shortlist but candidate ALREADY paid, promote directly to approve!
      if (actionToExecute === 'shortlist' && (intern.payment_status === 'verified' || intern.status === 'Accepted' || intern.pipeline_stage === 'approved')) {
        actionToExecute = 'approve'
      }

      // EXECUTE ACTION
      if (actionToExecute === 'approve') {
        // Direct Admission Approval
        const { error: updateErr } = await adminDb
          .from('interns')
          .update({
            pipeline_stage: 'approved',
            status: 'Accepted',
            payment_status: 'verified',
            payment_verified_at: intern.payment_verified_at || now.toISOString(),
            final_rejection_reason: null,
            rejected_at: null
          })
          .eq('id', internId)

        if (updateErr) {
          results.push({ id: internId, status: 'error', error: updateErr.message })
          continue
        }

        // Update latest interview session
        await adminDb
          .from('interview_sessions')
          .update({
            decision: 'approved',
            decision_by: user.email,
            decision_at: now.toISOString(),
            decision_reason: reason || 'Candidate approved and seat secured'
          })
          .eq('intern_id', internId)

        // Send Admission Approval Email
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

        // Audit log
        await adminDb.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'INTERVIEW_ADMISSION_APPROVED',
          target_type: 'intern',
          target_id: internId,
          details: { decision: 'approved', verified_at: now.toISOString(), reason }
        })

        results.push({ id: internId, status: 'success', decision: 'approved' })

      } else if (actionToExecute === 'shortlist') {
        // Shortlist & 72h Payment window
        const { error: updateErr } = await adminDb
          .from('interns')
          .update({
            pipeline_stage: 'shortlisted',
            status: 'Pending',
            final_rejection_reason: null,
            rejected_at: null,
            shortlisted_at: now.toISOString(),
            payment_deadline: paymentDeadline.toISOString()
          })
          .eq('id', internId)

        if (updateErr) {
          results.push({ id: internId, status: 'error', error: updateErr.message })
          continue
        }

        // Update latest interview session
        await adminDb
          .from('interview_sessions')
          .update({
            decision: 'shortlisted',
            decision_by: user.email,
            decision_at: now.toISOString(),
            decision_reason: reason || 'Met qualification benchmark'
          })
          .eq('intern_id', internId)

        // Send Shortlisted Email with 3-day deadline
        const formattedDeadline = paymentDeadline.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })

        try {
          await sendShortlistedEmail({
            to: intern.email,
            fullName: intern.full_name,
            batchName: batchName,
            paymentDeadline: formattedDeadline
          })
        } catch (emailErr) {
          console.error(`Failed to send shortlisted email to ${intern.email}:`, emailErr)
        }

        // Log audit
        await adminDb.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'INTERVIEW_SHORTLIST',
          target_type: 'intern',
          target_id: internId,
          details: { decision: 'shortlisted', deadline: paymentDeadline.toISOString(), reason }
        })

        results.push({ id: internId, status: 'success', decision: 'shortlisted' })

      } else if (actionToExecute === 'reject') {
        // Reject Candidate
        const { error: updateErr } = await adminDb
          .from('interns')
          .update({
            pipeline_stage: 'rejected',
            status: 'Rejected',
            final_rejection_reason: reason || 'Did not meet technical assessment criteria',
            rejected_at: now.toISOString()
          })
          .eq('id', internId)

        if (updateErr) {
          results.push({ id: internId, status: 'error', error: updateErr.message })
          continue
        }

        // Update session
        await adminDb
          .from('interview_sessions')
          .update({
            decision: 'rejected',
            decision_by: user.email,
            decision_at: now.toISOString(),
            decision_reason: reason || 'Did not meet criteria'
          })
          .eq('intern_id', internId)

        // Send Rejection Email
        try {
          await sendRejectionEmail({
            to: intern.email,
            fullName: intern.full_name,
            batchName: batchName,
            reason: reason || undefined
          })
        } catch (emailErr) {
          console.error(`Failed to send rejection email to ${intern.email}:`, emailErr)
        }

        // Promote oldest waitlisted candidate if available for this batch + domain
        if (intern.batch_id && intern.domain) {
          try {
            const { data: waitlisted } = await adminDb
              .from('interns')
              .select('id, full_name, email, registration_number')
              .eq('batch_id', intern.batch_id)
              .eq('domain', intern.domain)
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

              // Notify promoted intern
              await sendWaitlistPromotedEmail({
                to: promoted.email,
                fullName: promoted.full_name,
                registrationNumber: promoted.registration_number,
                domain: intern.domain,
                batchName: batchName
              })

              await adminDb.from('admin_audit_logs').insert({
                admin_id: user.id,
                action: 'WAITLIST_AUTO_PROMOTED',
                target_type: 'intern',
                target_id: promoted.id,
                details: { triggered_by_rejection_of: internId, domain: intern.domain, batch_id: intern.batch_id }
              })
            }
          } catch (promoteErr) {
            console.error('Waitlist promotion check error:', promoteErr)
          }
        }

        // Log audit
        await adminDb.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'INTERVIEW_REJECT',
          target_type: 'intern',
          target_id: internId,
          details: { decision: 'rejected', reason }
        })

        results.push({ id: internId, status: 'success', decision: 'rejected' })

      } else if (actionToExecute === 'hold') {
        const { error: updateErr } = await adminDb
          .from('interns')
          .update({
            pipeline_stage: 'under_review',
            status: 'Pending',
            final_rejection_reason: null,
            rejected_at: null
          })
          .eq('id', internId)

        if (updateErr) {
          results.push({ id: internId, status: 'error', error: updateErr.message })
          continue
        }

        await adminDb
          .from('interview_sessions')
          .update({
            decision: 'hold',
            decision_by: user.email,
            decision_at: now.toISOString(),
            decision_reason: reason || 'Under mentor review'
          })
          .eq('intern_id', internId)

        await adminDb.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'INTERVIEW_HOLD',
          target_type: 'intern',
          target_id: internId,
          details: { decision: 'hold', reason }
        })

        results.push({ id: internId, status: 'success', decision: 'hold' })

      } else if (actionToExecute === 'call_interview') {
        // Erase any prior completed/failed interview sessions in real-time
        await adminDb
          .from('interview_sessions')
          .delete()
          .eq('intern_id', internId);

        const { error: updateErr } = await adminDb
          .from('interns')
          .update({
            pipeline_stage: 'interview_pending',
            status: 'Pending',
            final_rejection_reason: null,
            rejected_at: null
          })
          .eq('id', internId)

        if (updateErr) {
          results.push({ id: internId, status: 'error', error: updateErr.message })
          continue
        }

        try {
          await sendInterviewInvitationEmail({
            to: intern.email,
            fullName: intern.full_name,
            domain: intern.domain,
            registrationNumber: intern.registration_number,
            batchName: batchName
          })
        } catch (emailErr) {
          console.error(`Failed to send interview invitation email to ${intern.email}:`, emailErr)
        }

        await adminDb.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'INTERVIEW_INVITED',
          target_type: 'intern',
          target_id: internId,
          details: { decision: 'call_interview', reason: reason || 'Invited to technical interview' }
        })

        results.push({ id: internId, status: 'success', decision: 'call_interview' })
      }
    }

    return NextResponse.json({
      message: 'Batch decision processing completed',
      results
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
