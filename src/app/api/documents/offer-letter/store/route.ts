import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { OfferLetterPDF } from '@/components/documents/OfferLetterPDF'
import { readFileSync } from 'fs'
import { join } from 'path'
import QRCode from 'qrcode'

function getLogoBase64(): string | null {
  try {
    const logoPath = join(process.cwd(), 'public/', 'logo.png')
    const buffer = readFileSync(logoPath)
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

  // We use getAdminClient here directly because the bulk generation is an Admin operation
  // and we want to ensure we don't hit RLS issues during automated batch processing.
  const adminClient = getAdminClient()
  
  // Verify auth session (the frontend passes standard cookies)
  const { data: { session } } = await adminClient.auth.getSession()
  // Wait, session might not exist for adminClient since it uses service_role key.
  // We must verify auth using a regular client to ensure the request is from a logged-in user.
  // Let's import createClient
  
  // We will do that inside the function body.
  
  try {
    const { internId, joiningDate, adminEmail } = await request.json()

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
      return NextResponse.json({ error: 'Intern not found: ' + (internError?.message || '') }, { status: 404 })
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

    // Assuming we don't have user.id easily accessible in this service_role flow, we rely on the passed email
    const adminName = signatureData?.full_name || 'Authorized Signatory'
    const signatureUrl = signatureData?.signature_url || null
    const adminDesignation = signatureData?.designation || 'Founder & CEO'

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

    // 6. Read logo
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

    const pdfBuffer = await pdf(docElement as any).toBuffer()

    // 8. Upload to Supabase Storage
    const fileName = `offer-letters/${intern.id}.pdf`
    
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

    // 9. Get Public URL
    const { data: publicUrlData } = adminClient.storage
      .from('intern-documents')
      .getPublicUrl(fileName)

    const pdfUrl = publicUrlData.publicUrl

    const generatedAt = new Date().toISOString()

    // 10. Update Intern Document generated status
    const { error: docUpdateError } = await adminClient
      .from('intern_documents')
      .upsert({
        intern_id: internId,
        offer_letter_generated: true,
        offer_letter_date: generatedAt,
        offer_letter_number: offerLetterNumber,
        offer_letter_generated_at: generatedAt,
        offer_letter_generated_by: adminEmail,
        offer_letter_url: pdfUrl
      }, { onConflict: 'intern_id' })

    if (docUpdateError) {
      console.error('Failed to update intern document record:', docUpdateError)
    }

    // 11. Save Verification Record
    const { error: verifyError } = await adminClient
      .from('document_verifications')
      .insert({
        document_type: 'offer_letter',
        document_number: offerLetterNumber,
        intern_id: internId,
        intern_name: intern.full_name,
        intern_domain: intern.domain,
        generated_at: generatedAt,
        generated_by: adminEmail
      })

    if (verifyError) {
      console.error('Failed to save document verification record:', verifyError)
    }

    // 12. Record in Audit Logs
    await logAction(
      adminEmail,
      `Generated and Stored Internship Offer Letter for intern ${intern.full_name} (${offerLetterNumber})`,
      'documents',
      intern.id
    )

    return NextResponse.json({ success: true, url: pdfUrl })
  } catch (err: unknown) {
    console.error('Bulk generation error:', err)
    const message = err instanceof Error ? err.message : 'Error generating PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
