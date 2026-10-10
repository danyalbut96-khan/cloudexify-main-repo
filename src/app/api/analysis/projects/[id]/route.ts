import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { manual_status, manual_marks, manual_feedback } = await request.json()
    
    // Validate status
    if (manual_status && !['pending', 'approved', 'rejected'].includes(manual_status)) {
       return NextResponse.json({ error: 'Invalid manual status' }, { status: 400 })
    }

    const updateData: any = {}
    if (manual_status !== undefined) updateData.manual_status = manual_status
    if (manual_marks !== undefined) updateData.manual_marks = manual_marks
    if (manual_feedback !== undefined) updateData.manual_feedback = manual_feedback

    const { error } = await supabase
      .from('intern_projects')
      .update(updateData)
      .eq('id', params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error updating manual analysis:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
