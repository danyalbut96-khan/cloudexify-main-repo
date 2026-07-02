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

  try {
    let query = supabase
      .from('interns')
      .select('*, intern_documents (*)')

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,registration_number.ilike.%${search}%`)
    }

    if (domain) {
      query = query.eq('domain', domain)
    }

    if (semester) {
      query = query.eq('semester', parseInt(semester))
    }

    const { data, error } = await query.order('registration_number', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Filter by document generation status in JS to ensure clean join conditions
    let filteredData = data || []
    
    if (offerStatus) {
      const isGen = offerStatus === 'generated'
      filteredData = filteredData.filter(item => 
        isGen 
          ? item.intern_documents?.offer_letter_generated === true 
          : !item.intern_documents || item.intern_documents.offer_letter_generated === false
      )
    }

    if (certStatus) {
      const isGen = certStatus === 'generated'
      filteredData = filteredData.filter(item => 
        isGen 
          ? item.intern_documents?.certificate_generated === true 
          : !item.intern_documents || item.intern_documents.certificate_generated === false
      )
    }

    return NextResponse.json(filteredData)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
