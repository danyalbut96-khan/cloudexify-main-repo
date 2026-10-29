import { createClient, getAdminClient } from '@/lib/supabase/server'
import { isRateLimited, sanitizeInput } from '@/lib/utils'
import { logAction, notifyAdmin } from '@/lib/server-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip, 5, 60000)) {
    return NextResponse.json({ error: 'Too many requests. Please try again after 1 minute.' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    if (!email || !password || !fullName || password.length < 12 || password.length > 128 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email, name, and a password of at least 12 characters are required.' }, { status: 400 })
    }

    // Registration is denied unless the database enables it AND the email is
    // explicitly allowlisted by a server-only environment variable.
    const allowlist = (process.env.ADMIN_SIGNUP_ALLOWLIST || '')
      .split(',')
      .map(value => value.trim().toLowerCase())
      .filter(Boolean)
    if (allowlist.length === 0 || !allowlist.includes(email)) {
      return NextResponse.json({ error: 'This email is not authorized for administrator registration.' }, { status: 403 })
    }

    const admin = getAdminClient()
    const { data: settings, error: settingsError } = await admin
      .from('intern_analysis_settings')
      .select('admin_signup_open')
      .eq('id', 1)
      .maybeSingle()

    if (settingsError || !settings || settings.admin_signup_open !== true) {
      if (settingsError) console.error('Admin signup settings unavailable')
      return NextResponse.json({ error: 'Admin registration is currently unavailable.' }, { status: 403 })
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: sanitizeInput(fullName) } },
    })
    if (error) return NextResponse.json({ error: 'Unable to complete registration.' }, { status: 400 })

    // Audit/notification text is derived from the authenticated signup response, not used for authorization.
    await logAction(email, 'Registered a new administrator account', 'auth', data.user?.id || '')
    await notifyAdmin('New Admin Registration', 'A new administrator registration requires review.', 'registration')
    return NextResponse.json({ user: data.user, session: data.session })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
