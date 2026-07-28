import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { RecommendationLetterPDF } from '@/components/documents/RecommendationLetterPDF'
import { readFileSync } from 'fs'
import { join } from 'path'
import QRCode from 'qrcode'

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
  const customText = searchParams.get('customText') || undefined

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

    // 5. Generate Random ID & QR code as base64 PNG
    const randomNum = Math.floor(1000 + Math.random() * 9000)
    const year = new Date().getFullYear()
    const recommendationLetterNumber = `CX-RL-${year}-${randomNum}`

    const verificationUrl = `https://admin.cloudexify.site/verify/${recommendationLetterNumber}`
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
    const docElement = React.createElement(RecommendationLetterPDF, {
      intern,
      companySettings,
      adminName,
      adminDesignation,
      signatureUrl,
      completionDate,
      customText,
      logoBase64,
      recommendationLetterNumber,
      qrCodeBase64,
    })

    const pdfStream = await pdf(docElement as any).toBuffer() as any
    const chunks: Buffer[] = []
    for await (const chunk of pdfStream) {
      chunks.push(chunk as Buffer)
    }
    const finalPdfBuffer = Buffer.concat(chunks)
    const generatedAt = new Date().toISOString()

    // Upload to Supabase Storage
    const adminClient = getAdminClient()
    const fileName = `recommendation-letters/${intern.id}.pdf`
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

    // 7. Update Intern Document generated status
    const { error: docUpdateError } = await adminClient
      .from('intern_documents')
      .upsert({
        intern_id: internId,
        recommendation_letter_generated: true,
        recommendation_letter_date: generatedAt,
        recommendation_letter_url: pdfUrl
      }, { onConflict: 'intern_id' })

    if (docUpdateError) {
      console.error('Failed to update intern document record:', docUpdateError)
    }

    // 8. Save Verification Record
    const { error: verifyError } = await adminClient
      .from('document_verifications')
      .insert({
        document_type: 'recommendation_letter',
        document_number: recommendationLetterNumber,
        intern_id: internId,
        intern_name: intern.full_name,
        intern_domain: intern.domain,
        generated_at: generatedAt,
        generated_by: user.email
      })

    if (verifyError) {
      console.error('Failed to save document verification record:', verifyError)
    }

    // 9. Record in Audit Logs
    await logAction(
      user.email!,
      `Generated Recommendation Letter for intern ${intern.full_name} (${recommendationLetterNumber})`,
      'documents',
      intern.id
    )

    // 8. Return Stream response
    return new NextResponse(finalPdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Recommendation_Letter_${intern.registration_number}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err: unknown) {
    console.error('Error generating single rec letter:', err)
    const message = err instanceof Error ? err.message : 'Error generating PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
