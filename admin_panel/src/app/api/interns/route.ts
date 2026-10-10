import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
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

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const domain = searchParams.get('domain') || ''
  const semester = searchParams.get('semester') || ''
  const offerStatus = searchParams.get('offer_letter_status') || ''
  const certStatus = searchParams.get('certificate_status') || ''
  const batchId = searchParams.get('batchId') || ''

  try {
    let query = supabase
      .from('interns')
      .select('*, intern_documents (*), intern_projects (count)')

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,registration_number.ilike.%${search}%`)
    }

    if (domain) {
      query = query.eq('domain', domain)
    }

    if (semester) {
      query = query.eq('semester', parseInt(semester))
    }

    if (batchId) {
      query = query.eq('batch_id', batchId)
    }

    // Sort so Pending comes first, then by newest
    const { data, error } = await query
      .order('status', { ascending: false }) // 'Pending' > 'Accepted' > 'Rejected' usually, but text sort puts 'Rejected' first. Wait, let's just order by created_at desc.
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by document generation status in JS to ensure clean join conditions
    let filteredData = data || []
    
    if (offerStatus) {
      const isGen = offerStatus === 'generated'
      filteredData = filteredData.filter((item: any) => 
        isGen 
          ? item.intern_documents?.offer_letter_generated === true 
          : !item.intern_documents || item.intern_documents.offer_letter_generated === false
      )
    }

    if (certStatus) {
      const isGen = certStatus === 'generated'
      filteredData = filteredData.filter((item: any) => 
        isGen 
          ? item.intern_documents?.certificate_generated === true 
          : !item.intern_documents || item.intern_documents.certificate_generated === false
      )
    }

    // Mark as viewed in the background
    const idsToMark = filteredData.filter((i: any) => i.is_new).map((i: any) => i.id);
    if (idsToMark.length > 0) {
      supabase.from('interns').update({ is_new: false }).in('id', idsToMark).then();
    }

    // Map project counts
    const finalData = filteredData.map((intern: any) => ({
      ...intern,
      submitted_projects_count: intern.intern_projects?.[0]?.count || 0
    }))

    return NextResponse.json(finalData)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
