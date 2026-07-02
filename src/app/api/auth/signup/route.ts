import { createClient } from '@/lib/supabase/server'
import { isRateLimited, sanitizeInput } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

  // Rate Limiting: max 5 signup requests per minute per IP
  if (isRateLimited(ip, 5, 60000)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again after 1 minute.' },
      { status: 429 }
    )
  }

  try {
    const { email, password, fullName } = await request.json()
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedName = sanitizeInput(fullName)

    if (!sanitizedEmail || !password || !sanitizedName) {
      return NextResponse.json(
        { error: 'Missing required signup parameters.' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password: password,
      options: {
        data: {
          full_name: sanitizedName
        }
      }
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Write to audit log (the DB trigger also does this, but we log here just in case or keep single entry)
    await logAction(
      sanitizedEmail,
      `Registered a new administrator account: ${sanitizedName}`,
      'auth',
      data.user?.id || ''
    )

    return NextResponse.json({ user: data.user, session: data.session })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
