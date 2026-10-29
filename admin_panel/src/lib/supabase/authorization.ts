import { createClient, getAdminClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export type AdminAuthorization =
  | { ok: true; user: User; isSuperAdmin: boolean }
  | { ok: false; response: NextResponse }

export async function requireAdmin(options: { superAdminOnly?: boolean } = {}): Promise<AdminAuthorization> {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  // The profile row is the server-side allowlist for administrator accounts.
  // Never trust role flags or email addresses supplied by the browser.
  const adminClient = getAdminClient()
  const { data: profile, error: profileError } = await adminClient
    .from('admin_profiles')
    .select('is_super_admin')
    .eq('admin_id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  const isSuperAdmin = profile.is_super_admin === true
  if (options.superAdminOnly && !isSuperAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return { ok: true, user, isSuperAdmin }
}
