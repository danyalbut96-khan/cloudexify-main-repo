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
    const { name, start_date, end_date, is_active } = await request.json()
    if (!name || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // If this new batch is active, set all others to inactive first
    if (is_active) {
      await supabase.from('batches').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000') // hack to update all
    }

    const { data: newBatch, error } = await supabase
      .from('batches')
      .insert({ name, start_date, end_date, is_active })
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
    const { id, is_active } = await request.json()
    if (!id) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 })
    }

    // If making active, deactivate others
    if (is_active) {
      await supabase.from('batches').update({ is_active: false }).neq('id', id)
    }

    const { data: updatedBatch, error } = await supabase
      .from('batches')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await logAction(user.email || 'Admin', `Updated Batch ${updatedBatch.name} (Active: ${is_active})`, 'batch', id)

    return NextResponse.json(updatedBatch)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
