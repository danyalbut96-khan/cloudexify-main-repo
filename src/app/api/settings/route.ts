import { createClient } from '@/lib/supabase/server'
import { isRateLimited, sanitizeObject } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. Fetch company settings (single row, id = 1)
    const { data: companySettings } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single()

    // 2. Fetch admin profile from admin_profiles
    const { data: adminProfile } = await supabase
      .from('admin_profiles')
      .select('*')
      .eq('admin_id', user.id)
      .maybeSingle()

    // 3. Fetch sheet connections
    const { data: sheetConnections } = await supabase
      .from('sheet_connections')
      .select('*')
      .order('created_at', { ascending: false })

    // 4. Fetch all signatures (backwards compatibility dropdown selection)
    const { data: allSignatures } = await supabase
      .from('admin_signatures')
      .select('*')

    return NextResponse.json({
      companySettings: companySettings || null,
      adminProfile: adminProfile || null,
      sheetConnections: sheetConnections || [],
      allSignatures: allSignatures || []
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const sanitizedBody = sanitizeObject(body)
    const type = sanitizedBody.type

    // Type 1: Save Company Details
    if (type === 'company') {
      const { data, error } = await supabase
        .from('company_settings')
        .update({
          company_name: sanitizedBody.company_name,
          company_address: sanitizedBody.company_address,
          company_website: sanitizedBody.company_website,
          company_email: sanitizedBody.company_email,
          company_logo_url: sanitizedBody.company_logo_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      await logAction(user.email!, 'Updated global company branding details', 'settings', '1')
      return NextResponse.json({ companySettings: data })
    }

    // Type 2: Save Admin Profile
    if (type === 'profile') {
      const { data, error } = await supabase
        .from('admin_profiles')
        .upsert({
          admin_id: user.id,
          display_name: sanitizedBody.display_name,
          avatar_url: sanitizedBody.avatar_url,
          signature_url: sanitizedBody.signature_url,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      // Sync signature metadata back to admin_signatures for templates selector backwards compatibility
      await supabase
        .from('admin_signatures')
        .upsert({
          email: user.email!,
          full_name: sanitizedBody.display_name,
          signature_url: sanitizedBody.signature_url,
          updated_at: new Date().toISOString()
        })

      await logAction(user.email!, 'Updated personal administrator profile details', 'settings', user.id)
      return NextResponse.json({ adminProfile: data })
    }

    // Type 3: Connect Google Sheets
    if (type === 'sheet_connect') {
      const sheetUrl = sanitizedBody.sheet_url
      if (!sheetUrl) {
        return NextResponse.json({ error: 'Spreadsheet published CSV URL is required' }, { status: 400 })
      }

      // Test reachable check
      try {
        const testRes = await fetch(sheetUrl, { method: 'HEAD' })
        if (!testRes.ok) {
          throw new Error(`spreadsheet returned HTTP status ${testRes.status}`)
        }
      } catch (err: any) {
        return NextResponse.json({ error: 'Spreadsheet URL is unreachable. Ensure it is published as CSV and publicly accessible. Details: ' + err.message }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('sheet_connections')
        .insert({
          sheet_name: sanitizedBody.sheet_name,
          sheet_url: sheetUrl,
          mapped_to: sanitizedBody.mapped_to,
          created_by: user.email
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      await logAction(user.email!, `Connected Google Sheet "${sanitizedBody.sheet_name}" mapped to ${sanitizedBody.mapped_to}`, 'settings', data.id)
      return NextResponse.json({ sheetConnection: data })
    }

    // Type 4: Disconnect Google Sheet
    if (type === 'sheet_disconnect') {
      const connectionId = sanitizedBody.id
      const { error } = await supabase
        .from('sheet_connections')
        .delete()
        .eq('id', connectionId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      await logAction(user.email!, `Disconnected Google Sheet connection`, 'settings', connectionId)
      return NextResponse.json({ success: true })
    }

    // Type 5: Toggle Sheet Active Status
    if (type === 'sheet_toggle') {
      const connectionId = sanitizedBody.id
      const isActive = sanitizedBody.is_active

      const { data, error } = await supabase
        .from('sheet_connections')
        .update({ is_active: isActive })
        .eq('id', connectionId)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      await logAction(user.email!, `Toggled sheet connection active status to ${isActive}`, 'settings', connectionId)
      return NextResponse.json({ sheetConnection: data })
    }

    return NextResponse.json({ error: 'Invalid settings type option' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
