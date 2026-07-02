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
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
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

    const { data, error } = await supabase
      .from('projects')
      .insert({
        project_name: sanitizedBody.project_name,
        client_name: sanitizedBody.client_name,
        status: sanitizedBody.status,
        start_date: sanitizedBody.start_date || null,
        end_date: sanitizedBody.end_date || null,
        value_pkr: sanitizedBody.value_pkr || 0.00
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await logAction(
      user.email!,
      `Created project "${sanitizedBody.project_name}" for client "${sanitizedBody.client_name}"`,
      'projects',
      data.id
    )

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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

    const { data, error } = await supabase
      .from('projects')
      .update({
        project_name: sanitizedBody.project_name,
        client_name: sanitizedBody.client_name,
        status: sanitizedBody.status,
        start_date: sanitizedBody.start_date || null,
        end_date: sanitizedBody.end_date || null,
        value_pkr: sanitizedBody.value_pkr || 0.00
      })
      .eq('id', sanitizedBody.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await logAction(
      user.email!,
      `Updated project "${sanitizedBody.project_name}" (status: ${sanitizedBody.status})`,
      'projects',
      data.id
    )

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
