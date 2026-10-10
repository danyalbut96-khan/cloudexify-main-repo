import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = getAdminClient()
    const { data } = await supabase
      .from('intern_analysis_settings')
      .select('admin_signup_open')
      .eq('id', 1)
      .maybeSingle()
    
    return NextResponse.json({ open: data?.admin_signup_open ?? true })
  } catch (err: any) {
    return NextResponse.json({ open: true }) // default open on error
  }
}
