import { createClient, getAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/authorization'
import { isRateLimited } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data: projects, error } = await supabase
      .from('intern_projects')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(projects)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id, manual_status, manual_marks, manual_feedback } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    const { data, error } = await supabase
      .from('intern_projects')
      .update({ manual_status, manual_marks, manual_feedback })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Automated Grading & Certificate Generation if approved and manual_marks >= 4 (out of 10)
    if (manual_status === 'approved' && manual_marks !== null && manual_marks >= 4) {
      let grade = 'Good';
      if (manual_marks >= 8) grade = 'Excellent';
      else if (manual_marks >= 6) grade = 'Very Good';
      
      try {
        const storeUrl = new URL('/api/documents/experience-certificate/store', request.url).toString();
        await fetch(storeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            internId: data.intern_id,
            completionDate: new Date().toISOString().split('T')[0],
            adminEmail: user.email,
            performanceGrade: grade,
            skillsGained: 'Manual grading: Demonstrated technical proficiency, problem solving, and successful implementation.'
          })
        });
      } catch (err) {
        console.error('Automated cert generation failed:', err);
      }
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}


