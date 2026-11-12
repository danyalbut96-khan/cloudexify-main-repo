import { createClient, getAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/authorization'
import { NextRequest, NextResponse } from 'next/server'
import { 
  sendRegistrationSuccessEmail, 
  sendInterviewInvitationEmail,
  sendShortlistedEmail, 
  sendApprovalEmail, 
  sendRejectionEmail 
} from '@/lib/email-service'

export async function POST(request: NextRequest) {
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { intern_id, email_type } = body

    if (!intern_id || !email_type) {
      return NextResponse.json({ error: 'intern_id and email_type are required' }, { status: 400 })
    }

    const adminDb = getAdminClient()

    // 1. Fetch intern
    const { data: intern, error: internError } = await adminDb
      .from('interns')
      .select('*, batches(id, name)')
      .eq('id', intern_id)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 })
    }

    const batchName = intern.batches?.name || 'Internship Program'
    let sentSubject = ''

    if (email_type === 'interview_invite') {
      await sendInterviewInvitationEmail({
        to: intern.email,
        fullName: intern.full_name,
        registrationNumber: intern.registration_number,
        domain: intern.domain,
        batchName
      })
      sentSubject = 'Technical Interview Invitation'

    } else if (email_type === 'registration') {
      await sendRegistrationSuccessEmail({
        to: intern.email,
        fullName: intern.full_name,
        registrationNumber: intern.registration_number,
        domain: intern.domain,
        batchName
      })
      sentSubject = 'Registration Details'

    } else if (email_type === 'shortlisted') {
      const formattedDeadline = intern.payment_deadline 
        ? new Date(intern.payment_deadline).toLocaleString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
          })
        : 'within 72 hours'

      await sendShortlistedEmail({
        to: intern.email,
        fullName: intern.full_name,
        batchName,
        paymentDeadline: formattedDeadline
      })
      sentSubject = 'Shortlist & Payment Notification'

    } else if (email_type === 'approval') {
      await sendApprovalEmail({
        to: intern.email,
        fullName: intern.full_name,
        batchName,
        domain: intern.domain,
        registrationNumber: intern.registration_number
      })
      sentSubject = 'Official Acceptance & Welcome'

    } else if (email_type === 'rejection') {
      await sendRejectionEmail({
        to: intern.email,
        fullName: intern.full_name,
        batchName,
        reason: intern.final_rejection_reason || undefined
      })
      sentSubject = 'Application Decision Update'

    } else {
      return NextResponse.json({ error: 'Invalid email_type' }, { status: 400 })
    }

    // Log action
    await adminDb.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'RESEND_EMAIL',
      target_type: 'intern',
      target_id: intern_id,
      details: {
        email_type,
        to: intern.email,
        subject: sentSubject,
        resent_by: user.email
      }
    })

    return NextResponse.json({
      success: true,
      message: `${sentSubject} email resent to ${intern.email}`
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
