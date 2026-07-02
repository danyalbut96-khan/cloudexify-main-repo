import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited, logAction } from '@/lib/utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { ExperienceCertificatePDF } from '@/components/documents/ExperienceCertificatePDF'

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
  const internId = searchParams.get('internId') || ''
  const completionDate = searchParams.get('completionDate') || new Date().toISOString().split('T')[0]
  const adminEmail = searchParams.get('adminEmail') || user.email || ''
  const performanceGrade = (searchParams.get('performanceGrade') || 'Excellent') as any
  const skillsGained = searchParams.get('skillsGained') || 'Git, GitHub, HTML/CSS, JavaScript, and Team Collaboration'

  if (!internId) {
    return NextResponse.json({ error: 'Missing internId parameter' }, { status: 400 })
  }

  try {
    // 1. Fetch Intern Details
    const { data: intern, error: internError } = await supabase
      .from('interns')
      .select('*')
      .eq('id', internId)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 })
    }

    // 2. Fetch Company Settings
    const { data: companySettings, error: csError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (csError || !companySettings) {
      return NextResponse.json({ error: 'Company settings not found' }, { status: 500 })
    }

    // 3. Fetch Admin Signature Profile
    const { data: signatureData } = await supabase
      .from('admin_signatures')
      .select('*')
      .eq('email', adminEmail)
      .maybeSingle()

    const adminName = signatureData?.full_name || 'Authorized Signatory'
    const signatureUrl = signatureData?.signature_url || null

    // 4. Render PDF to Buffer
    const docElement = React.createElement(ExperienceCertificatePDF, {
      intern,
      companySettings,
      adminName,
      signatureUrl,
      completionDate,
      performanceGrade,
      skillsGained
    })

    const pdfBuffer = await pdf(docElement).toBuffer()

    // 5. Update Intern Document generated status
    const { error: docUpdateError } = await supabase
      .from('intern_documents')
      .upsert({
        intern_id: internId,
        experience_certificate_generated: true,
        experience_certificate_date: new Date().toISOString()
      }, { onConflict: 'intern_id' })

    if (docUpdateError) {
      console.error('Failed to update intern document record:', docUpdateError)
    }

    // 6. Record in Audit Logs
    await logAction(
      user.email!,
      `Generated Internship Experience Certificate for intern ${intern.full_name} (${intern.registration_number})`,
      'documents',
      intern.id
    )

    // 7. Return Stream response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Experience_Certificate_${intern.registration_number}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error generating PDF' }, { status: 500 })
  }
}
