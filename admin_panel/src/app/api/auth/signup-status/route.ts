import { getAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await getAdminClient()
      .from('intern_analysis_settings')
      .select('admin_signup_open')
      .eq('id', 1)
      .maybeSingle()

    // Fail closed: missing settings or a database error must never advertise open signup.
    if (error || !data) {
      if (error) console.error('Admin signup status unavailable')
      return NextResponse.json({ open: false }, { status: 503 })
    }
    return NextResponse.json({ open: data.admin_signup_open === true })
  } catch {
    return NextResponse.json({ open: false }, { status: 503 })
  }
}
