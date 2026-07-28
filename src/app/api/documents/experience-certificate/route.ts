import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { ExperienceCertificatePDF } from '@/components/documents/ExperienceCertificatePDF'
import { readFileSync } from 'fs'
import { join } from 'path'

/** Read the logo from /public/logo.png and encode as base64 data URI for server-side PDF rendering */
function getLogoBase64(): string | null {
  try {
    const logoPath = join(process.cwd(), 'public', 'logo.png')
    const buffer = readFileSync(logoPath)
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

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
  const performanceGrade = (searchParams.get('performanceGrade') || 'Excellent') as 'Excellent' | 'Very Good' | 'Good'
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
    const adminDesignation = signatureData?.designation || null

    // 4. Read logo from /public/logo.png as base64 for PDF rendering (FIX 9)
    const logoBase64 = getLogoBase64()

    // 5. Render PDF to Buffer
    const docElement = React.createElement(ExperienceCertificatePDF, {
      intern,
      companySettings,
      adminName,
      adminDesignation,
      signatureUrl,
      completionDate,
      performanceGrade,
      skillsGained,
      logoBase64,
    })

    const pdfBuffer = await pdf(docElement as any).toBuffer()

    // Upload to Supabase Storage
    const adminClient = getAdminClient()
    const fileName = `experience-certificates/${intern.id}.pdf`
    const pdfCopy = Buffer.from(pdfBuffer)
    const { error: uploadError } = await adminClient.storage
      .from('intern-documents')
      .upload(fileName, pdfCopy, {
        contentType: 'application/pdf',
        upsert: true
      })

    let pdfUrl = null
    if (!uploadError) {
      const { data: publicUrlData } = adminClient.storage
        .from('intern-documents')
        .getPublicUrl(fileName)
      pdfUrl = publicUrlData.publicUrl
    }

    // 6. Update Intern Document generated status
    const { error: docUpdateError } = await adminClient
      .from('intern_documents')
      .upsert({
        intern_id: internId,
        experience_certificate_generated: true,
        experience_certificate_date: new Date().toISOString(),
        experience_certificate_url: pdfUrl
      }, { onConflict: 'intern_id' })

    if (docUpdateError) {
      console.error('Failed to update intern document record:', docUpdateError)
    }

    // 7. Record in Audit Logs
    await logAction(
      user.email!,
      `Generated Internship Experience Certificate for intern ${intern.full_name} (${intern.registration_number})`,
      'documents',
      intern.id
    )

    // 8. Return Stream response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Experience_Certificate_${intern.registration_number}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err: unknown) {
    console.error('Error generating single experience cert:', err)
    const message = err instanceof Error ? err.message : 'Error generating PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
