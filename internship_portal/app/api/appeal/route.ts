import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

async function getAuthenticatedIntern() {
  const token = cookies().get('intern_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { id: string; email: string }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const authIntern = await getAuthenticatedIntern()
    if (!authIntern) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 })
    }

    const adminDb = getAdminClient()
    const { data: intern, error: fetchErr } = await adminDb
      .from('interns')
      .select('id, full_name, email, domain, status, pipeline_stage, rejected_at, created_at')
      .eq('id', authIntern.id)
      .single()

    if (fetchErr || !intern) {
      return NextResponse.json({ error: 'Candidate record not found' }, { status: 404 })
    }

    const isRejected = intern.status === 'Rejected' || String(intern.pipeline_stage).toLowerCase() === 'rejected'
    if (!isRejected) {
      return NextResponse.json({ error: 'Appeals are only applicable for rejected applications.' }, { status: 400 })
    }

    // Check if an appeal already exists in audit logs
    const { data: existingAppeals } = await adminDb
      .from('admin_audit_logs')
      .select('id')
      .eq('target_id', authIntern.id)
      .eq('action', 'CANDIDATE_APPEAL_SUBMITTED')
      .limit(1)

    if (existingAppeals && existingAppeals.length > 0) {
      return NextResponse.json({ error: 'You have already submitted a 1-time appeal for this decision. Multiple submissions are not allowed.' }, { status: 400 })
    }

    // 48-Hour Deadline Check
    const rejectionTime = intern.rejected_at ? new Date(intern.rejected_at).getTime() : new Date(intern.created_at).getTime()
    const hoursSinceRejection = (Date.now() - rejectionTime) / (1000 * 60 * 60)
    if (hoursSinceRejection > 48) {
      return NextResponse.json({ error: 'The 48-hour appeal window for this decision has elapsed.' }, { status: 400 })
    }

    const body = await request.json()
    const appealNote = body.appeal_note?.trim()
    if (!appealNote || appealNote.length < 10) {
      return NextResponse.json({ error: 'Please provide a detailed justification for your review request (at least 10 characters).' }, { status: 400 })
    }

    const nowIso = new Date().toISOString()

    // Record audit log
    await adminDb.from('admin_audit_logs').insert({
      admin_id: authIntern.id,
      action: 'CANDIDATE_APPEAL_SUBMITTED',
      target_type: 'intern',
      target_id: authIntern.id,
      details: {
        candidate_name: intern.full_name,
        email: intern.email,
        domain: intern.domain,
        appeal_note: appealNote,
        submitted_at: nowIso
      }
    })

    // Try updating interns table if columns exist
    try {
      await adminDb
        .from('interns')
        .update({
          review_requested: true,
          appeal_note: appealNote,
          appeal_submitted_at: nowIso,
          appeal_count: 1
        })
        .eq('id', intern.id)
    } catch {
      // Ignore if columns not yet added
    }

    return NextResponse.json({
      success: true,
      message: 'Your review request has been recorded and submitted to the Admissions Committee.'
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
