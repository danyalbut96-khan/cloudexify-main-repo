import { createClient } from '@/lib/supabase/server'
import { logAction } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const email = user.email || 'unknown'
      await logAction(
        email,
        'Logged out of CloudExify Admin Dashboard',
        'auth',
        user.id
      )
      await supabase.auth.signOut()
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
