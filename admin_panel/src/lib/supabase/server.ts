import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createBaseClient } from '@supabase/supabase-js'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Can be ignored if handled by middleware session refreshing
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Can be ignored if handled by middleware session refreshing
          }
        },
      },
    }
  )
}

// Bypasses Row Level Security for admin actions that need absolute authority (like writing system audit logs, updating settings, etc.)
export const getAdminClient = () => {
  return createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )
}
