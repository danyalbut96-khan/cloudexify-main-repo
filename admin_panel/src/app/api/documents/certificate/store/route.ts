import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/authorization'
import { isRateLimited } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { CertificatePDF } from '@/components/documents/CertificatePDF'
import { readFileSync } from 'fs'
import { join } from 'path'
import QRCode from 'qrcode'

function getLogoBase64(): string | null {
  try {
    const logoPath = join(process.cwd(), 'public', 'logo.png')
    const buffer = readFileSync(logoPath)
    if (buffer.length < 500) return null // Ignore invalid placeholder files
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

  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response
  const adminEmail = authorization.user.email || authorization.user.id
  const adminClient = getAdminClient()

  try {
    const { internId, completionDate, adminEmail: _requestedAdminEmail } = await request.json()

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

    // 5. Generate Random Certificate Number & QR Code
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const year = new Date().getFullYear()
    const certificateNumber = `CX-CERT-${year}-${randomNum}`

    const verificationUrl = `https://admin.cloudexify.site/verify/${certificateNumber}`
    let qrCodeBase64: string | null = null
    try {
      const qrBuffer = await QRCode.toBuffer(verificationUrl, {
        errorCorrectionLevel: 'M',
        width: 180,
        margin: 1,
      })
      qrCodeBase64 = `data:image/png;base64,${qrBuffer.toString('base64')}`
    } catch (qrErr) {
      console.error('QR code generation failed:', qrErr)
    }

    // 6. Render PDF to Buffer
    const docElement = React.createElement(CertificatePDF, {
      intern,
      companySettings,
      adminName,
      adminDesignation,
      signatureUrl,
      completionDate,
      logoBase64,
      qrCodeBase64,
      certificateNumber,
    })

    const pdfBuffer = await pdf(docElement as any).toBuffer()
    const generatedAt = new Date().toISOString()

    // 7. Upload to Supabase Storage
    const fileName = `certificates/${intern.id}.pdf`
    
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

    // 8. Get Public URL
    const { data: publicUrlData } = adminClient.storage
      .from('intern-documents')
      .getPublicUrl(fileName)

    const pdfUrl = publicUrlData.publicUrl

    // 9. Update Intern Document generated status
    const { error: docUpdateError } = await adminClient
      .from('intern_documents')
      .upsert({
        intern_id: internId,
        certificate_generated: true,
        certificate_date: generatedAt,
        certificate_url: pdfUrl
      }, { onConflict: 'intern_id' })

    if (docUpdateError) {
      console.error('Failed to update intern document record:', docUpdateError)
    }

    // 10. Save Verification Record
    const { error: verifyError } = await adminClient
      .from('document_verifications')
      .insert({
        document_type: 'certificate',
        document_number: certificateNumber,
        intern_id: internId,
        intern_name: intern.full_name,
        intern_domain: intern.domain,
        generated_at: generatedAt,
        generated_by: adminEmail })

    if (verifyError) {
      console.error('Failed to save document verification record:', verifyError)
    }

    // 11. Record in Audit Logs
    await logAction(
      adminEmail,
      `Generated and Stored Internship Completion Certificate for intern ${intern.full_name} (${certificateNumber})`,
      'documents',
      intern.id
    )

    return NextResponse.json({ success: true, url: pdfUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
