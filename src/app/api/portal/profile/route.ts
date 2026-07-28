import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

export async function PATCH(request: NextRequest) {
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
    const { full_name, email, whatsapp, university, semester } = body

    if (!full_name || !email || !whatsapp || !university || !semester) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Check if new email is already used by someone else
    const { data: existingUser } = await supabase
      .from('interns')
      .select('id')
      .eq('email', email)
      .neq('id', internId)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json({ error: 'This email is already in use.' }, { status: 409 })
    }

    const { error: updateError } = await supabase
      .from('interns')
      .update({
        full_name,
        email,
        whatsapp,
        university,
        semester: parseInt(semester, 10)
      })
      .eq('id', internId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update profile: ' + updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully.' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
