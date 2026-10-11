import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

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

    const body = await request.json()
    const { feedback_text } = body

    if (!feedback_text || feedback_text.trim() === '') {
      return NextResponse.json({ error: 'Feedback text is required.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { error } = await supabase
      .from('intern_feedbacks')
      .insert({
        intern_id: payload.id,
        feedback_text: feedback_text.trim(),
      })

    if (error) {
      // If table doesn't exist, we return a clear error
      if (error.code === '42P01') {
        return NextResponse.json({ error: 'Database table missing. Admin needs to create "intern_feedbacks" table.' }, { status: 500 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Feedback submitted successfully! Thank you.' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
