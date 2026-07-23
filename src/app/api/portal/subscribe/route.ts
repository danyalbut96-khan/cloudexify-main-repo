import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const body = await request.json()
    const email = body.email ? String(body.email).trim().toLowerCase() : ''

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const supabase = createClient()
    
    // Insert into waitlist_subscribers
    const { error } = await supabase
      .from('waitlist_subscribers')
      .insert({ email })
    
    if (error) {
      // 23505 is unique violation in postgres
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already subscribed' })
      }
      return NextResponse.json({ error: 'Failed to subscribe: ' + error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
