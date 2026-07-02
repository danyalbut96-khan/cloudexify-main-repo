import { createClient } from '@/lib/supabase/server'
import { isRateLimited, logAction, sanitizeObject } from '@/lib/utils'
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
    const { data: companySettings, error: csError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single()

    const { data: adminSignature, error: sigError } = await supabase
      .from('admin_signatures')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()

    // Also fetch all signatures so the doc generator dropdown can see signatures of all founders
    const { data: allSignatures } = await supabase
      .from('admin_signatures')
      .select('*')

    return NextResponse.json({
      companySettings: companySettings || null,
      adminSignature: adminSignature || null,
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
      await logAction(user.email!, 'Updated global company details', 'settings', '1')
      return NextResponse.json({ companySettings: data })
    }

    if (type === 'signature') {
      const { data, error } = await supabase
        .from('admin_signatures')
        .upsert({
          email: user.email!,
          full_name: sanitizedBody.full_name,
          signature_url: sanitizedBody.signature_url,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      await logAction(
        user.email!,
        `Updated personal signature profile details`,
        'settings',
        user.email!
      )
      return NextResponse.json({ adminSignature: data })
    }

    return NextResponse.json({ error: 'Invalid update type' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
