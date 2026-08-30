import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { ExperienceCertificatePDF } from '@/components/documents/ExperienceCertificatePDF'
import { readFileSync } from 'fs'
import { join } from 'path'

function getLogoBase64(): string | null {
  try {
    const logoPath = join(process.cwd(), 'public', 'logo.png')
    const buffer = readFileSync(logoPath)
    if (buffer.length < 500) return null
    return `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const adminClient = getAdminClient()

  try {
    const { internId, completionDate, startDate, adminEmail, performanceGrade, skillsGained } = await request.json()

    if (!internId) {
      return NextResponse.json({ error: 'Missing internId parameter' }, { status: 400 })
    }

    // 1. Fetch Intern Details
    const { data: intern, error: internError } = await adminClient
      .from('interns')
      .select('*')
      .eq('id', internId)
      .single()

    if (internError || !intern) {
      return NextResponse.json({ error: 'Intern not found' }, { status: 404 })
    }

    // 2. Fetch Company Settings
    const { data: companySettings, error: csError } = await adminClient
      .from('company_settings')
      .select('*')
      .eq('id', 1)
      .single()

    if (csError || !companySettings) {
      return NextResponse.json({ error: 'Company settings not found' }, { status: 500 })
    }

    // 3. Fetch Admin Signature Profile
    const { data: signatureData } = await adminClient
      .from('admin_signatures')
      .select('*')
      .eq('email', adminEmail)
      .maybeSingle()

    const adminName = signatureData?.full_name || 'Authorized Signatory'
    const signatureUrl = signatureData?.signature_url || null
    const adminDesignation = signatureData?.designation || null

    // 4. Read logo from /public/logo.png as base64 for PDF rendering
    const logoBase64 = getLogoBase64()

    // 5. Render PDF to Buffer
    const docElement = React.createElement(ExperienceCertificatePDF, {
      intern,
      companySettings,
      adminName,
      adminDesignation,
      signatureUrl,
      completionDate: completionDate || new Date().toISOString().split('T')[0],
      startDate: startDate || new Date(new Date(completionDate).getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      performanceGrade: performanceGrade || 'Excellent',
      skillsGained: skillsGained || 'Git, GitHub, HTML/CSS, JavaScript, and Team Collaboration',
      logoBase64,
    })

    const pdfBuffer = await pdf(docElement as any).toBuffer()
    const generatedAt = new Date().toISOString()

    // 6. Upload to Supabase Storage
    const fileName = `experience-certificates/${intern.id}.pdf`
    
    const { error: uploadError } = await adminClient.storage
      .from('intern-documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to upload PDF to storage' }, { status: 500 })
    }

    // 7. Get Public URL
    const { data: publicUrlData } = adminClient.storage
      .from('intern-documents')
      .getPublicUrl(fileName)

    const pdfUrl = publicUrlData.publicUrl

    // 8. Update Intern Document generated status
    const { error: docUpdateError } = await adminClient
      .from('intern_documents')
      .upsert({
        intern_id: internId,
        experience_certificate_generated: true,
        experience_certificate_date: generatedAt,
        experience_certificate_url: pdfUrl
      }, { onConflict: 'intern_id' })

    if (docUpdateError) {
      console.error('Failed to update intern document record:', docUpdateError)
    }

    // 9. Record in Audit Logs
    await logAction(
      adminEmail,
      `Generated and Stored Internship Experience Certificate for intern ${intern.full_name} (${intern.registration_number})`,
      'documents',
      intern.id
    )

    return NextResponse.json({ success: true, url: pdfUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
