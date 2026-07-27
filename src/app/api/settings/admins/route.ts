import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

async function isSuperAdmin(userId: string) {
  const serverClient = createServerClient()
  const { data } = await serverClient
    .from('admin_profiles')
    .select('is_super_admin')
    .eq('admin_id', userId)
    .single()
  return !!data?.is_super_admin
}

export async function GET(request: NextRequest) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role-key')) {
    return NextResponse.json({ error: 'CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing or invalid. Please add your actual Service Role Key to .env.local and RESTART YOUR SERVER.' }, { status: 500 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const serverClient = createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  
  if (!user || !(await isSuperAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 })
  }

  try {
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) throw error

    // Fetch admin_profiles to get display names, etc.
    const { data: profiles, error: profilesError } = await serverClient
      .from('admin_profiles')
      .select('admin_id, display_name, designation, is_super_admin')

    const profilesMap = new Map()
    if (!profilesError && profiles) {
      profiles.forEach(p => profilesMap.set(p.admin_id, p))
    }

    const admins = usersData.users.map(u => {
      const profile = profilesMap.get(u.id)
      return {
        id: u.id,
        email: u.email,
        full_name: profile?.display_name || u.user_metadata?.full_name || u.email?.split('@')[0],
        designation: profile?.designation || 'Administrator',
        is_active: u.banned_until ? new Date(u.banned_until).getTime() < Date.now() : true,
        is_super_admin: profile?.is_super_admin || false,
        created_at: u.created_at,
        is_current_user: u.id === user.id
      }
    })

    return NextResponse.json({ admins })
  } catch (err: any) {
    console.error('Admin API GET Error:', err);
    
    // Completely foolproof error serialization
    let errorMessage = 'Unknown error';
    if (err) {
      if (typeof err === 'string') errorMessage = err;
      else if (err.message) errorMessage = err.message;
      else if (err.error_description) errorMessage = err.error_description;
      else errorMessage = String(err);
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const serverClient = createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  
  if (!user || !(await isSuperAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 })
  }

  try {
    const { id, action, new_password } = await request.json()
    
    if (!id || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (id === user.id && action !== 'password') {
      return NextResponse.json({ error: 'Cannot modify your own access status from here.' }, { status: 400 })
    }

    let updateData = {}
    if (action === 'disable') {
      updateData = { ban_duration: '876000h' } // ~100 years
    } else if (action === 'enable') {
      updateData = { ban_duration: 'none' }
    } else if (action === 'password') {
      if (!new_password || new_password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
      }
      updateData = { password: new_password }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin API PUT Error:', err);
    return NextResponse.json({ error: err.message || JSON.stringify(err) || 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const serverClient = createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  
  if (!user || !(await isSuperAdmin(user.id))) {
    return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    
    if (!id) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    if (id === user.id) return NextResponse.json({ error: 'Use account settings to delete your own account' }, { status: 400 })

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Admin API DELETE Error:', err);
    return NextResponse.json({ error: err.message || JSON.stringify(err) || 'Unknown error' }, { status: 500 })
  }
}
