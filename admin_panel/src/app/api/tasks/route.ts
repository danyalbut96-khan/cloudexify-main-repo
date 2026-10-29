import { requireAdmin } from '@/lib/supabase/authorization'
import { getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

function rateLimited(request: NextRequest) {
  // Only use headers supplied by the hosting platform's trusted proxy.
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  return isRateLimited(ip)
}

export async function GET(request: NextRequest) {
  if (rateLimited(request)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response

  try {
    const { searchParams } = new URL(request.url)
    const batchId = searchParams.get('batch_id')
    const domain = searchParams.get('domain')
    const supabase = getAdminClient()
    let query = supabase.from('tasks').select('*, batches(name, status)').order('created_at', { ascending: false })
    if (batchId) query = query.eq('batch_id', batchId)
    if (domain) query = query.eq('domain', domain)
    const { data, error } = await query
    if (error) {
      console.error('Task lookup failed')
      return NextResponse.json({ error: 'Unable to load tasks' }, { status: 500 })
    }
    return NextResponse.json({ tasks: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (rateLimited(request)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response

  try {
    const body = await request.json()
    const { batch_id, domain, duration_label, title, description, file_url, start_date, end_date } = body
    if (!batch_id || !domain || !title || !duration_label) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const supabase = getAdminClient()
    const { data, error } = await supabase.from('tasks').insert([{
      batch_id, domain, duration_label, title, description, file_url,
      start_date: start_date || null, end_date: end_date || null,
    }]).select().single()
    if (error) {
      console.error('Task creation failed')
      return NextResponse.json({ error: 'Unable to create task' }, { status: 500 })
    }
    return NextResponse.json({ success: true, task: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (rateLimited(request)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response

  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing task ID' }, { status: 400 })
    const { error } = await getAdminClient().from('tasks').delete().eq('id', id)
    if (error) {
      console.error('Task deletion failed')
      return NextResponse.json({ error: 'Unable to delete task' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (rateLimited(request)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response

  try {
    const body = await request.json()
    const { id, batch_id, domain, duration_label, title, description, file_url, start_date, end_date } = body
    if (!id) return NextResponse.json({ error: 'Missing task ID' }, { status: 400 })
    const updateData: Record<string, unknown> = {}
    if (batch_id !== undefined) updateData.batch_id = batch_id
    if (domain !== undefined) updateData.domain = domain
    if (duration_label !== undefined) updateData.duration_label = duration_label
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (file_url !== undefined) updateData.file_url = file_url
    if (start_date !== undefined) updateData.start_date = start_date || null
    if (end_date !== undefined) updateData.end_date = end_date || null
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: 'No changes supplied' }, { status: 400 })

    const { data, error } = await getAdminClient().from('tasks').update(updateData).eq('id', id).select().single()
    if (error) {
      console.error('Task update failed')
      return NextResponse.json({ error: 'Unable to update task' }, { status: 500 })
    }
    return NextResponse.json({ success: true, task: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
