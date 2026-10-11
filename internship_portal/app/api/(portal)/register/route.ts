import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendRegistrationSuccessEmail, sendWaitlistEmail } from '@/lib/email-service'

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
    const {
      fullName,
      email,
      whatsapp,
      gender,
      university,
      universityRegistrationNumber,
      semester,
      domain,
      skillLevel,
      availableHours,
      referralSource,
      interest,
      linkedinUrl,
      resumeUrl
    } = body

    // 1. Validate required fields
    if (
      !fullName ||
      !email ||
      !whatsapp ||
      !gender ||
      !university ||
      !universityRegistrationNumber ||
      !semester ||
      !domain ||
      !skillLevel ||
      !availableHours ||
      !referralSource ||
      !interest
    ) {
      return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 })
    }

    // 2. Eligibility validation: fewer than 2 completed semesters is blocked
    const sem = parseInt(String(semester), 10)
    if (isNaN(sem) || sem < 2) {
      return NextResponse.json({
        error: 'Students who have completed fewer than 2 semesters are not eligible to apply. You must be in Semester 2 or higher.'
      }, { status: 400 })
    }

    // 3. Loose format validation on University Registration Number
    const normUnivReg = String(universityRegistrationNumber).trim()
    if (normUnivReg.length < 3 || !/^[A-Za-z0-9\-_/ ]{3,50}$/.test(normUnivReg)) {
      return NextResponse.json({
        error: 'Please enter a valid university registration number (3 to 50 alphanumeric characters or hyphens).'
      }, { status: 400 })
    }

    const normEmail = String(email).trim().toLowerCase()
    const normName = String(fullName).trim()
    const normUniv = normUnivReg.toLowerCase()

    const domainCode = DOMAIN_CODES[domain]
    if (!domainCode) {
      return NextResponse.json({ error: 'Invalid internship domain selected.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 4. Verify system-wide registration setting
    const { data: settings } = await supabase
      .from('intern_analysis_settings')
      .select('registration_open')
      .eq('id', 1)
      .maybeSingle()

    if (settings && settings.registration_open === false) {
      return NextResponse.json({ error: 'Registration is currently closed by administration.' }, { status: 403 })
    }

    // 5. Fetch currently active batch accepting applications
    const { data: activeBatch, error: batchError } = await supabase
      .from('batches')
      .select('id, name, status, registration_deadline')
      .eq('status', 'accepting')
      .maybeSingle()

    if (batchError || !activeBatch) {
      return NextResponse.json({ error: 'No active batch is currently accepting registrations.' }, { status: 400 })
    }

    // Check registration deadline if specified
    if (activeBatch.registration_deadline) {
      const deadline = new Date(activeBatch.registration_deadline)
      // Set to end of deadline day
      deadline.setHours(23, 59, 59, 999)
      if (new Date() > deadline) {
        return NextResponse.json({
          error: `Registration for ${activeBatch.name} closed on ${new Date(activeBatch.registration_deadline).toLocaleDateString()}.`
        }, { status: 403 })
      }
    }

    // 6. Duplicate Prevention per Batch
    // A person whose status is rejected or cancelled_non_payment in this batch CANNOT re-register in this same batch
    const { data: existingRecords, error: checkError } = await supabase
      .from('interns')
      .select('id, email, university_registration_number, status, pipeline_stage')
      .eq('batch_id', activeBatch.id)
      .or(`email.ilike.${normEmail},university_registration_number.ilike.${normUniv}`)

    if (checkError) {
      console.error('Duplicate check error:', checkError)
    }

    if (existingRecords && existingRecords.length > 0) {
      const matched = existingRecords[0]
      const statusLower = String(matched.status || '').toLowerCase()
      const stageLower = String(matched.pipeline_stage || '').toLowerCase()

      if (
        statusLower === 'rejected' ||
        stageLower === 'rejected' ||
        statusLower === 'cancelled_non_payment' ||
        stageLower === 'cancelled_non_payment'
      ) {
        return NextResponse.json({
          error: `Applications cannot be resubmitted for ${activeBatch.name} after a rejection or cancellation. You may apply again in the next batch.`
        }, { status: 403 })
      }

      if (statusLower === 'waitlisted' || stageLower === 'waitlisted') {
        return NextResponse.json({
          error: 'You are already registered on the waitlist for this batch. We will notify you when a seat becomes available.'
        }, { status: 409 })
      }

      return NextResponse.json({
        error: 'You have already registered for this batch. Please log in to your portal using your registration number.'
      }, { status: 409 })
    }

    // 7. Domain Seat Logic via batch_domains (Transaction-safe)
    const { data: domainConfig } = await supabase
      .from('batch_domains')
      .select('seats_total, seats_filled, is_open')
      .eq('batch_id', activeBatch.id)
      .eq('domain', domain)
      .maybeSingle()

    let isWaitlisted = false
    if (domainConfig) {
      if (!domainConfig.is_open || (domainConfig.seats_total > 0 && domainConfig.seats_filled >= domainConfig.seats_total)) {
        isWaitlisted = true
      }
    }

    // 8. Generate Registration Number
    const prefix = `CX-INT-2026-${domainCode}-`
    const { data: allInterns } = await supabase
      .from('interns')
      .select('registration_number')

    let maxNum = 0
    if (allInterns && allInterns.length > 0) {
      for (const currentIntern of allInterns) {
        const match = currentIntern.registration_number?.match(/-(\d+)$/)
        if (match && match[1]) {
          const num = parseInt(match[1], 10)
          if (!isNaN(num) && num > maxNum) {
            maxNum = num
          }
        }
      }
    }
    const increment = maxNum > 0 ? maxNum + 1 : 1
    const registrationNumber = `${prefix}${increment.toString().padStart(3, '0')}`

    // 9. Insert Candidate
    const initialStatus = isWaitlisted ? 'Waitlisted' : 'Pending'
    const initialStage = isWaitlisted ? 'waitlisted' : 'interview_pending'
    const waitlistedAt = isWaitlisted ? new Date().toISOString() : null

    const { data: intern, error: insertError } = await supabase
      .from('interns')
      .insert({
        registration_number: registrationNumber,
        full_name: normName,
        email: normEmail,
        whatsapp: String(whatsapp).trim(),
        gender: String(gender).trim(),
        university: String(university).trim(),
        university_registration_number: normUnivReg,
        semester: sem,
        domain: domain,
        skill_level: String(skillLevel).trim(),
        available_hours: parseInt(String(availableHours), 10) || 15,
        referral_source: String(referralSource).trim(),
        interest: String(interest).trim(),
        linkedin_url: linkedinUrl ? String(linkedinUrl).trim() : null,
        resume_url: resumeUrl ? String(resumeUrl).trim() : null,
        batch_id: activeBatch.id,
        status: initialStatus,
        pipeline_stage: initialStage,
        waitlisted_at: waitlistedAt,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Intern insert failed:', insertError)
      // Check if DB unique constraint caught a concurrent submission
      if (insertError.code === '23505' || insertError.message.includes('unique')) {
        return NextResponse.json({
          error: 'An application with this email or university registration number has already been registered for this batch.'
        }, { status: 409 })
      }
      return NextResponse.json({ error: 'Failed to complete registration: ' + insertError.message }, { status: 500 })
    }

    // Default documents row
    try { await supabase.from('intern_documents').insert({ intern_id: intern.id }); } catch(e) {}

    // Admin in-app notification
    await supabase.from('admin_notifications').insert({
      title: isWaitlisted ? 'New Waitlisted Intern' : 'New Candidate Registration',
      message: `${normName} registered for ${domain} (${registrationNumber})${isWaitlisted ? ' - Added to Waitlist' : ''}`,
      type: 'registration'
    })

    // 10. Email Notifications
    if (isWaitlisted) {
      await sendWaitlistEmail({
        to: normEmail,
        fullName: normName,
        domain: domain,
        batchName: activeBatch.name,
      }).catch(err => console.error('Waitlist email error:', err))

      return NextResponse.json({
        success: true,
        isWaitlisted: true,
        intern,
        message: 'You have been placed on the official waitlist. You will be emailed automatically when a seat opens up.'
      })
    } else {
      await sendRegistrationSuccessEmail({
        to: normEmail,
        fullName: normName,
        registrationNumber,
        domain,
        batchName: activeBatch.name,
      }).catch(err => console.error('Registration email error:', err))

      return NextResponse.json({
        success: true,
        isWaitlisted: false,
        intern,
        message: 'Registration successful! Please log in to your portal using your registration number to take your timed AI interview.'
      })
    }

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}