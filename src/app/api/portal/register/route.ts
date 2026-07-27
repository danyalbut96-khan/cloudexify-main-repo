import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const DOMAIN_CODES: Record<string, string> = {
  'Python Programming': 'PY',
  'C++ Programming': 'CPP',
  'Java Programming': 'JAVA',
  'Data Science & AI Basics': 'DS',
  'Cybersecurity Fundamentals': 'CYB',
  'Full Stack Development': 'GEN',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, whatsapp, gender, university, semester, domain, skillLevel, availableHours, referralSource } = body

    if (!fullName || !email || !whatsapp || !gender || !university || !semester || !domain || !skillLevel || !availableHours || !referralSource) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Verify registration is open
    const { data: settings, error: settingsError } = await supabase
      .from('intern_analysis_settings')
      .select('registration_open')
      .eq('id', 1)
      .maybeSingle()

    if (settingsError || !settings?.registration_open) {
      return NextResponse.json({ error: 'Registration is currently closed.' }, { status: 403 })
    }

    // Get the currently active batch
    const { data: activeBatch } = await supabase
      .from('batches')
      .select('id')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle()

    if (!activeBatch) {
      return NextResponse.json({ error: 'No active batch is currently accepting registrations.' }, { status: 400 })
    }

    // Check if email already registered
    const { data: existingIntern } = await supabase
      .from('interns')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingIntern) {
      return NextResponse.json({ error: 'This email is already registered.' }, { status: 409 })
    }

    const domainCode = DOMAIN_CODES[domain]
    if (!domainCode) {
      return NextResponse.json({ error: 'Invalid domain selected.' }, { status: 400 })
    }

    // Auto-increment registration number
    const prefix = `CX-INT-2026-${domainCode}-`
    const { data: latestInterns } = await supabase
      .from('interns')
      .select('registration_number')
      .like('registration_number', `${prefix}%`)
      .order('registration_number', { ascending: false })
      .limit(1)

    let increment = 1
    if (latestInterns && latestInterns.length > 0) {
      const highestNumStr = latestInterns[0].registration_number.replace(prefix, '')
      const highestNum = parseInt(highestNumStr, 10)
      if (!isNaN(highestNum)) {
        increment = highestNum + 1
      }
    }

    const registrationNumber = `${prefix}${increment.toString().padStart(3, '0')}`

    // Insert Intern
    const { data: intern, error: insertError } = await supabase
      .from('interns')
      .insert({
        registration_number: registrationNumber,
        full_name: fullName,
        email: email,
        whatsapp: whatsapp,
        gender: gender,
        university: university,
        semester: parseInt(semester, 10),
        domain: domain,
        skill_level: skillLevel,
        available_hours: parseInt(availableHours, 10),
        referral_source: referralSource,
        batch_id: activeBatch.id
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: 'Failed to save registration: ' + insertError.message }, { status: 500 })
    }

    // Insert default documents row
    await supabase.from('intern_documents').insert({ intern_id: intern.id })

    // Insert Notification
    await supabase.from('admin_notifications').insert({
      title: 'New Intern Registration',
      message: `${fullName} has registered for ${domain}. (${registrationNumber})`,
      type: 'registration'
    })

    return NextResponse.json({ 
      success: true, 
      intern,
      message: 'Registration successful! We will review your application.'
    })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
