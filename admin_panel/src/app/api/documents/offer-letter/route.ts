import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { OfferLetterPDF } from '@/components/documents/OfferLetterPDF'
import { readFileSync } from 'fs'
import { join } from 'path'
import QRCode from 'qrcode'

/** Read the logo from /public/logo.png and encode as base64 data URI for server-side PDF rendering */
function getLogoBase64(): string | null {
  try {
    const logoPath = join(process.cwd(), 'public/', 'logo.png')
    const buffer = readFileSync(logoPath)
    if (buffer.length < 500) return null // Ignore invalid placeholder files
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
  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const internId = searchParams.get('internId') || ''
  const joiningDate = searchParams.get('joiningDate') || new Date().toISOString().split('T')[0]
  const adminEmail = searchParams.get('adminEmail') || user.email || ''

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
      return NextResponse.json({ error: 'Intern not found: ' + (internError?.message || '') }, { status: 404 })
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

    // 3. Fetch Admin Signature Profile (using adminClient to ensure we can read all profiles)
    const adminClient = getAdminClient()
    const { data: adminProfileData } = await adminClient
      .from('admin_profiles')
      .select('*')
      .eq('admin_id', user.id) // Get logged-in admin's profile, fallback to signature lookup below
      .maybeSingle()

    const { data: signatureData } = await adminClient
      .from('admin_signatures')
      .select('*')
      .eq('email', adminEmail)
      .maybeSingle()

    const adminName = adminProfileData?.display_name || signatureData?.full_name || 'Authorized Signatory'
    const signatureUrl = adminProfileData?.signature_url || signatureData?.signature_url || null
    const adminDesignation = adminProfileData?.designation || signatureData?.designation || 'Founder & CEO'

    // 4. Generate unique offer letter number based on count
    const { count } = await adminClient
      .from('intern_documents')
      .select('*', { count: 'exact', head: true })
      .eq('offer_letter_generated', true)

    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const year = new Date().getFullYear()
    const offerLetterNumber = `CX-OL-${year}-${randomNum}`

    // 5. Generate QR Code
    const verificationUrl = `https://admin.cloudexify.site/verify/${offerLetterNumber}`
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

    // 6. Read logo from /public/logo.png as base64 for PDF rendering
    const logoBase64 = getLogoBase64()

    // 7. Render PDF to Buffer
    const docElement = React.createElement(OfferLetterPDF, {
      intern,
      companySettings,
      adminName,
      adminDesignation,
      signatureUrl,
      joiningDate,
      logoBase64,
      offerLetterNumber,
      qrCodeBase64
    })

    const pdfStream = await pdf(docElement as any).toBuffer() as any
    const chunks: Buffer[] = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk as Buffer)
    }
    const finalPdfBuffer = Buffer.concat(chunks)

    const generatedAt = new Date().toISOString()

    // 7.5 Upload to Supabase Storage
    const fileName = `offer-letters/${intern.id}.pdf`
    const { error: uploadError } = await adminClient.storage
      .from('intern-documents')
      .upload(fileName, finalPdfBuffer, {
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

    // 8. Update Intern Document generated status
    const { error: docUpdateError } = await adminClient
      .from('intern_documents')
      .upsert({
        intern_id: internId,
        offer_letter_generated: true,
        offer_letter_date: generatedAt,
        offer_letter_number: offerLetterNumber,
        offer_letter_generated_at: generatedAt,
        offer_letter_generated_by: user.email,
        offer_letter_url: pdfUrl
      }, { onConflict: 'intern_id' })

    if (docUpdateError) {
      console.error('Failed to update intern document record:', docUpdateError)
    }

    // 9. Save Verification Record
    const { error: verifyError } = await adminClient
      .from('document_verifications')
      .insert({
        document_type: 'offer_letter',
        document_number: offerLetterNumber,
        intern_id: internId,
        intern_name: intern.full_name,
        intern_domain: intern.domain,
        generated_at: generatedAt,
        generated_by: user.email
      })

    if (verifyError) {
      console.error('Failed to save document verification record:', verifyError)
    }

    // 10. Record in Audit Logs
    await logAction(
      user.email,
      `Generated Internship Offer Letter for intern ${intern.full_name} (${offerLetterNumber})`,
      'documents',
      intern.id
    )

    // 11. Return Stream response
    return new NextResponse(finalPdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Offer_Letter_${intern.registration_number}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err: unknown) {
    console.error('Error generating single offer letter:', err)
    const message = err instanceof Error ? err.message : 'Error generating PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
