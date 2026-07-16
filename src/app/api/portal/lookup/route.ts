import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawName = String(body.full_name || '').trim()
    const rawRegNo = String(body.registration_number || '').trim().toUpperCase()

    if (!rawName && !rawRegNo) {
      return NextResponse.json({ error: 'Please enter a name or registration number to search.' }, { status: 400 })
    }

    const supabase = createClient()

    // Scenario A: Only full_name is provided (Search Suggestions)
    if (rawName && !rawRegNo) {
      const { data: matches, error } = await supabase
        .from('interns')
        .select('id, full_name, registration_number, domain, email')
        .ilike('full_name', `%${rawName}%`)
        .limit(10)

      if (error) {
        return NextResponse.json({ error: 'Database search failed.' }, { status: 500 })
      }

      return NextResponse.json({
        type: 'suggestions',
        suggestions: matches || []
      })
    }

    // Scenario B: registration_number is provided (direct search, optional name match)
    // Find the intern by registration_number (case-insensitive)
    const { data: intern, error } = await supabase
      .from('interns')
      .select('id, full_name, registration_number, domain, email')
      .filter('registration_number', 'ilike', rawRegNo)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: 'Database lookup failed.' }, { status: 500 })
    }

    if (!intern) {
      return NextResponse.json({ error: 'No intern found with that registration number. Please check your details.' }, { status: 404 })
    }

    // If name was also passed, verify it matches (case-insensitive, trimmed)
    if (rawName) {
      const storedName = (intern.full_name || '').trim().toLowerCase()
      const inputName = rawName.toLowerCase()
      if (storedName !== inputName && !storedName.includes(inputName) && !inputName.includes(storedName)) {
        return NextResponse.json({ error: 'Name does not match our records for this registration number.' }, { status: 404 })
      }
    }

    // Extract domain code from registration number (e.g. CX-2026-PY-001 or CX2026PY001)
    const regNo = intern.registration_number.toUpperCase()
    const normalizedReg = regNo.replace(/[^A-Z0-9]/g, '')
    const domainCodeMatch = normalizedReg.match(/[A-Z]{2}\d{4}([A-Z]+)\d{3,}/)
    const domainCode = domainCodeMatch ? domainCodeMatch[1] : ''

    // Count existing projects
    const { count: projectCount } = await supabase
      .from('intern_projects')
      .select('id', { count: 'exact', head: true })
      .eq('intern_id', intern.id)

    // Get max projects setting
    const { data: analysisSettings } = await supabase
      .from('intern_analysis_settings')
      .select('max_projects_per_intern')
      .eq('id', 1)
      .maybeSingle()

    const maxProjects = analysisSettings?.max_projects_per_intern ?? 4
    const submittedCount = projectCount ?? 0
    const nextProjectNumber = submittedCount + 1

    if (submittedCount >= maxProjects) {
      return NextResponse.json({
        error: `You have already submitted the maximum of ${maxProjects} projects. Thank you!`,
        maxReached: true
      }, { status: 400 })
    }

    return NextResponse.json({
      type: 'exact',
      intern: {
        id: intern.id,
        full_name: intern.full_name,
        registration_number: regNo,
        domain: intern.domain,
        domain_code: domainCode,
        email: intern.email
      },
      submittedCount,
      maxProjects,
      nextProjectNumber
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
