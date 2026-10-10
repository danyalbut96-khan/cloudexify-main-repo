import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { InvoicePDF } from '@/components/documents/InvoicePDF'
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
  const invoiceId = searchParams.get('invoiceId') || ''

  if (!invoiceId) {
    return NextResponse.json({ error: 'Missing invoiceId parameter' }, { status: 400 })
  }

  try {
    // 1. Fetch Invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
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

    // 3. Fetch Admin Signature Profile by invoice creator's email
    const { data: signatureData } = await supabase
      .from('admin_signatures')
      .select('*')
      .eq('email', invoice.generated_by)
      .maybeSingle()

    const adminName = signatureData?.full_name || 'Authorized Accountant'
    const signatureUrl = signatureData?.signature_url || null

    // 4. Read logo from /public/logo.png as base64 for PDF rendering (FIX 9)
    const logoBase64 = getLogoBase64()

    // 5. Render PDF to Buffer
    const docElement = React.createElement(InvoicePDF, {
      invoice,
      companySettings,
      adminName,
      signatureUrl,
      logoBase64,
    })

    const pdfBuffer = await pdf(docElement as any).toBuffer()

    // 5. Return Stream response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice_${invoice.invoice_number}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
