import { requireAdmin } from '@/lib/supabase/authorization'
import { getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response

  try {
    const { data, error } = await getAdminClient().from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(500)
    if (error) {
      console.error('Audit log query failed')
      return NextResponse.json({ error: 'Unable to load audit logs' }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
