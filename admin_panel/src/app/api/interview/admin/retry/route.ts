import { createClient, getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendRetryGrantedEmail } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const adminDb = getAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { intern_id, reason } = body

    if (!intern_id) {
      return NextResponse.json({ error: 'intern_id is required' }, { status: 400 })
    }

    // 1. Fetch Intern
    const { data: intern, error: internError } = await adminDb
      .from('interns')
      .select('*, batches(id, name)')
      .eq('id', intern_id)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 })
    }

    // 2. Check retry count via audit logs to enforce limit
    const { count: retryCount } = await adminDb
      .from('admin_audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('target_id', intern_id)
      .eq('action', 'INTERVIEW_RETRY_GRANTED')

    if ((retryCount ?? 0) >= 2) {
      return NextResponse.json({ 
        error: 'Candidate has already exhausted their maximum allowed retries (limit: 2).' 
      }, { status: 400 })
    }

    const now = new Date()

    // 3. COMPLETELY ERASE PREVIOUS INTERVIEW SESSION DATA AS REQUESTED
    await adminDb
      .from('interview_sessions')
      .delete()
      .eq('intern_id', intern_id)

    // 4. Update intern state to interview_pending, clear any rejection markers
    await adminDb
      .from('interns')
      .update({
        pipeline_stage: 'interview_pending',
        status: 'Pending',
        final_rejection_reason: null,
        rejected_at: null
      })
      .eq('id', intern_id)

    // 5. Send Retry Notification Email
    try {
      await sendRetryGrantedEmail({
        to: intern.email,
        fullName: intern.full_name,
        batchName: intern.batches?.name || 'Internship Program'
      })
    } catch (emailErr) {
      console.error(`Failed to send retry email to ${intern.email}:`, emailErr)
    }

    // 6. Record in audit logs
    await adminDb.from('admin_audit_logs').insert({
      admin_id: user.id,
      action: 'INTERVIEW_RETRY_GRANTED',
      target_type: 'intern',
      target_id: intern_id,
      details: { 
        retry_granted_by: user.email,
        timestamp: now.toISOString(),
        reason: reason || 'Admin discretion - Session erased for fresh attempt' 
      }
    })

    return NextResponse.json({
      message: 'Previous session erased and retry granted successfully. Candidate can now start fresh.',
      intern_id,
      retry_count: (retryCount ?? 0) + 1
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
