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
      .from('proposals')
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
      .from('proposals')
      .insert({
        client_name: sanitizedBody.client_name,
        client_email: sanitizedBody.client_email,
        proposal_title: sanitizedBody.proposal_title,
        description: sanitizedBody.description,
        scope_of_work: sanitizedBody.scope_of_work,
        timeline: sanitizedBody.timeline,
        estimated_cost: sanitizedBody.estimated_cost,
        sent_by: user.email,
        sent_date: new Date().toISOString().split('T')[0],
        status: sanitizedBody.status || 'draft'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await logAction(
      user.email!,
      `Created proposal "${sanitizedBody.proposal_title}" for client "${sanitizedBody.client_name}"`,
      'proposals',
      data.id
    )

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
