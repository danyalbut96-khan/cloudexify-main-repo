import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const token = cookies().get('intern_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    let payload
    try {
      const { payload: jwtPayload } = await jwtVerify(token, JWT_SECRET)
      payload = jwtPayload
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 })
    }

    const internId = payload.id
    const body = await request.json()
    const { payment_method, payment_transaction_id, payment_screenshot_url } = body

    if (!payment_method || !payment_transaction_id || !payment_screenshot_url) {
      return NextResponse.json({ 
        error: 'Payment method, Transaction ID (TID), and receipt screenshot are required.' 
      }, { status: 400 })
    }

    const cleanTid = String(payment_transaction_id).trim()
    if (cleanTid.length < 4) {
      return NextResponse.json({ error: 'Please enter a valid Transaction ID.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Fetch current candidate record
    const { data: intern, error: internError } = await supabase
      .from('interns')
      .select('id, full_name, email, pipeline_stage, status, payment_deadline, batch_id')
      .eq('id', internId)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Intern record not found.' }, { status: 404 })
    }

    // 2. Validate current stage
    if (intern.pipeline_stage !== 'shortlisted') {
      return NextResponse.json({ 
        error: `Payment is not accepted at this stage (${intern.pipeline_stage}). You must be shortlisted first.` 
      }, { status: 400 })
    }

    // 3. Validate deadline
    if (intern.payment_deadline) {
      const deadlineDate = new Date(intern.payment_deadline)
      if (deadlineDate.getTime() < Date.now()) {
        return NextResponse.json({ 
          error: 'Your payment deadline has expired. Your seat has been released according to program rules.' 
        }, { status: 400 })
      }
    }

    // 4. Duplicate Transaction ID Check across the system
    const { data: duplicateCheck } = await supabase
      .from('interns')
      .select('id, full_name')
      .ilike('payment_transaction_id', cleanTid)
      .neq('id', internId)
      .limit(1)

    if (duplicateCheck && duplicateCheck.length > 0) {
      return NextResponse.json({ 
        error: 'This Transaction ID (TID) has already been submitted by another applicant. Please enter your genuine transaction reference number.' 
      }, { status: 400 })
    }

    const now = new Date()

    // 5. Update intern record with payment info
    const { error: updateError } = await supabase
      .from('interns')
      .update({
        payment_method,
        payment_transaction_id: cleanTid,
        payment_screenshot_url,
        payment_status: 'pending_verification',
        pipeline_stage: 'payment_pending'
      })
      .eq('id', internId)

    if (updateError) throw updateError

    // 6. Record Audit Log
    try {
      await supabase.from('admin_audit_logs').insert({
        action: 'PAYMENT_RECEIPT_SUBMITTED',
        target_type: 'intern',
        target_id: internId,
        details: {
          payment_method,
          transaction_id: cleanTid,
          screenshot_url: payment_screenshot_url,
          submitted_at: now.toISOString()
        }
      })
    } catch (auditErr) {
      console.error('Audit log failed:', auditErr)
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verification submitted successfully! CloudExify admissions will review your receipt shortly.'
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
