import { createClient, getAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/authorization'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { is_feedback_hidden, ai_feedback } = await request.json()
    const { id } = params

    if (!id) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })

    const updateData: any = {};
    if (is_feedback_hidden !== undefined) updateData.is_feedback_hidden = is_feedback_hidden;
    if (ai_feedback !== undefined) updateData.ai_feedback = ai_feedback;

    const { data: updated, error } = await supabase
      .from('intern_projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(updated)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
