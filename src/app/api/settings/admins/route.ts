import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  // We need the service role key to interact with Auth admin API
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const serverClient = createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) throw error

    // Fetch admin_profiles to get display names, etc.
    const { data: profiles, error: profilesError } = await serverClient
      .from('admin_profiles')
      .select('admin_id, display_name, designation')

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
        created_at: u.created_at,
        is_current_user: u.id === user.id
      }
    })

    return NextResponse.json({ admins })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, action } = await request.json()
    
    if (!id || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot modify your own access status' }, { status: 400 })
    }

    let updateData = {}
    if (action === 'disable') {
      updateData = { ban_duration: '876000h' } // ~100 years
    } else if (action === 'enable') {
      updateData = { ban_duration: 'none' }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await request.json()
    
    if (!id) return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    if (id === user.id) return NextResponse.json({ error: 'Use account settings to delete your own account' }, { status: 400 })

    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
