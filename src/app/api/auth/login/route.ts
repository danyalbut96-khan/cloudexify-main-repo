import { createClient } from '@/lib/supabase/server'
import { isRateLimited, sanitizeInput } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

  // Rate Limiting: max 5 login requests per minute per IP
  if (isRateLimited(ip, 5, 60000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again after 1 minute.' },
      { status: 429 }
    )
  }

  try {
    const { email, password } = await request.json()
    const sanitizedEmail = sanitizeInput(email)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: password
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    // Success login, write to audit logs
    await logAction(
      sanitizedEmail,
      'Logged into CloudExify Admin Dashboard',
      'auth',
      data.user.id
    )

    return NextResponse.json({ user: data.user, session: data.session })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
