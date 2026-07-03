import { createClient } from '@/lib/supabase/server'
import { isRateLimited, sanitizeInput } from '@/lib/utils'
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
    const type = body.type as string

    // Type 1: Save Company Details
    if (type === 'company') {
      // Sanitize text fields only — do NOT sanitize URLs (HTML-encoding breaks ://)
      const { data, error } = await supabase
        .from('company_settings')
        .update({
          company_name: sanitizeInput(String(body.company_name || '')),
          company_address: sanitizeInput(String(body.company_address || '')),
          company_website: String(body.company_website || '').trim(),
          company_email: String(body.company_email || '').trim().toLowerCase(),
          company_logo_url: body.company_logo_url ? String(body.company_logo_url).trim() : null,
          company_phone: body.company_phone ? sanitizeInput(String(body.company_phone)).trim() : null,
          bank_details: body.bank_details ? sanitizeInput(String(body.bank_details)) : null,
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
      // URLs must NOT be sanitized through HTML-encoding — handle separately
      const displayName = sanitizeInput(String(body.display_name || ''))
      const designation = sanitizeInput(String(body.designation || ''))
      const avatarUrl = body.avatar_url ? String(body.avatar_url).trim() : null
      const signatureUrl = body.signature_url ? String(body.signature_url).trim() : null

      const { data, error } = await supabase
        .from('admin_profiles')
        .upsert(
          {
            admin_id: user.id,
            display_name: displayName,
            avatar_url: avatarUrl,
            signature_url: signatureUrl,
            designation: designation,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'admin_id' }
        )
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: 'Failed to save profile: ' + error.message }, { status: 400 })
      }

      // Sync signature metadata back to admin_signatures for templates selector backwards compatibility
      const { error: syncError } = await supabase
        .from('admin_signatures')
        .upsert(
          {
            email: user.email!,
            full_name: displayName,
            signature_url: signatureUrl,
            designation: designation,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'email' }
        )

      if (syncError) {
        console.error('Signature sync warning:', syncError.message)
        // Non-fatal — profile was saved successfully
      }

      await logAction(user.email!, 'Updated personal administrator profile details', 'settings', user.id)
      return NextResponse.json({ adminProfile: data })
    }

    // Type 3: Connect Google Sheets
    if (type === 'sheet_connect') {
      const sheetUrl = body.sheet_url ? String(body.sheet_url).trim() : ''
      const sheetName = sanitizeInput(String(body.sheet_name || ''))
      const mappedTo = sanitizeInput(String(body.mapped_to || 'interns'))

      if (!sheetUrl) {
        return NextResponse.json({ error: 'Spreadsheet published CSV URL is required' }, { status: 400 })
      }

      // Test reachable check
      try {
        const testRes = await fetch(sheetUrl, { method: 'HEAD' })
        if (!testRes.ok) {
          throw new Error(`spreadsheet returned HTTP status ${testRes.status}`)
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return NextResponse.json({ error: 'Spreadsheet URL is unreachable. Ensure it is published as CSV and publicly accessible. Details: ' + msg }, { status: 400 })
      }

      const { data, error } = await supabase
        .from('sheet_connections')
        .insert({
          sheet_name: sheetName,
          sheet_url: sheetUrl,
          mapped_to: mappedTo,
          created_by: user.email
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      await logAction(user.email!, `Connected Google Sheet "${sheetName}" mapped to ${mappedTo}`, 'settings', data.id)
      return NextResponse.json({ sheetConnection: data })
    }

    // Type 4: Disconnect Google Sheet
    if (type === 'sheet_disconnect') {
      const connectionId = String(body.id || '')
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
      const connectionId = String(body.id || '')
      const isActive = Boolean(body.is_active)

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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
