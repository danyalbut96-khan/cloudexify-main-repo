import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

// In production, this should be in .env
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

export async function POST(request: NextRequest) {
  try {
    const { email, registration_number } = await request.json()

    if (!email || !registration_number) {
      return NextResponse.json({ error: 'Email and Registration Number are required.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 1. Find intern by email and reg number
    const { data: intern, error } = await supabase
      .from('interns')
      .select('id, full_name, email, registration_number, batch_id, domain')
      .ilike('email', email.trim())
      .eq('registration_number', registration_number.trim().toUpperCase())
      .maybeSingle()

    if (error || !intern) {
      return NextResponse.json({ error: 'Invalid Email or Registration Number.' }, { status: 401 })
    }

    // 2. Check Batch validity
    let batchStatus = 'active'
    if (intern.batch_id) {
      const { data: batch } = await supabase
        .from('batches')
        .select('status, end_date')
        .eq('id', intern.batch_id)
        .maybeSingle()

      if (batch) {
        batchStatus = batch.status
      }
    }

    // 3. Generate JWT Token
    const token = await new SignJWT({ 
        id: intern.id, 
        email: intern.email, 
        role: 'intern', 
        status: batchStatus 
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // 7 days login
      .sign(JWT_SECRET)

    // 4. Set Cookie
    cookies().set('intern_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return NextResponse.json({ 
      success: true, 
      intern: {
        id: intern.id,
        full_name: intern.full_name,
        email: intern.email,
        status: batchStatus,
        domain: intern.domain
      }
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
