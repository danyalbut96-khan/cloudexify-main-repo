import { createClient, getAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/authorization'
import { isRateLimited } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminClient = getAdminClient()

  try {
    const { data: feedback, error } = await adminClient
      .from('intern_feedbacks')
      .select('*, interns(full_name, registration_number)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(feedback || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
