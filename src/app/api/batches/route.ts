import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
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
    const { data: batches, error } = await supabase
      .from('batches')
      .select('*, interns(count)')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(batches)
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
    const { name, start_date, end_date, status = 'coming', documents_locked = false, duration, mode, projects, compensation, certificate } = await request.json()
    if (!name || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If this new batch is accepting, set all other accepting batches to something else (e.g. active)
    if (status === 'accepting') {
      await supabase.from('batches').update({ status: 'active' }).eq('status', 'accepting')
    }

    const { data: newBatch, error } = await supabase
      .from('batches')
      .insert({ name, start_date, end_date, status, documents_locked, duration, mode, projects, compensation, certificate })
      .select()
      .single()

    if (error) throw error

    await logAction(user.email || 'Admin', 'Created New Batch: ' + name, 'batch', newBatch.id)

    return NextResponse.json(newBatch)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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
    const { id, name, start_date, end_date, status, documents_locked, duration, mode, projects, compensation, certificate } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 })
    }

    // Prepare update object
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (start_date !== undefined) updateData.start_date = start_date
    if (end_date !== undefined) updateData.end_date = end_date
    if (status !== undefined) updateData.status = status
    if (documents_locked !== undefined) updateData.documents_locked = documents_locked
    if (duration !== undefined) updateData.duration = duration
    if (mode !== undefined) updateData.mode = mode
    if (projects !== undefined) updateData.projects = projects
    if (compensation !== undefined) updateData.compensation = compensation
    if (certificate !== undefined) updateData.certificate = certificate

    // If making accepting, deactivate others
    if (status === 'accepting') {
      await supabase.from('batches').update({ status: 'active' }).eq('status', 'accepting').neq('id', id)
    }

    const { data: updatedBatch, error } = await supabase
      .from('batches')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await logAction(user.email || 'Admin', `Updated Batch ${updatedBatch.name} (Status: ${status || updatedBatch.status})`, 'batch', id)

    return NextResponse.json(updatedBatch)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
