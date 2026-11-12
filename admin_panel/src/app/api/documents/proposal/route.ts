import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAdminClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/supabase/authorization'
import { isRateLimited } from '@/lib/utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { ProposalPDF } from '@/components/documents/ProposalPDF'
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
  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response
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
  const proposalId = searchParams.get('proposalId') || ''

  if (!proposalId) {
    return NextResponse.json({ error: 'Missing proposalId parameter' }, { status: 400 })
  }

  try {
    // 1. Fetch Proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', proposalId)
      .single()

    if (proposalError || !proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
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

    // 3. Fetch Admin Signature Profile by proposal sender's email
    const { data: signatureData } = await supabase
      .from('admin_signatures')
      .select('*')
      .eq('email', proposal.sent_by)
      .maybeSingle()

    const adminName = signatureData?.full_name || 'Authorized Representative'
    const signatureUrl = signatureData?.signature_url || null
    const adminDesignation = signatureData?.designation || null

    // 4. Read logo from /public/logo.png as base64 for PDF rendering (FIX 9)
    const logoBase64 = getLogoBase64()

    // 5. Render PDF to Buffer
    const docElement = React.createElement(ProposalPDF, {
      proposal,
      companySettings,
      adminName,
      adminDesignation,
      signatureUrl,
      logoBase64,
    })

    const pdfBuffer = await pdf(docElement as any).toBuffer()

    // 5. Return Stream response
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Proposal_${proposal.proposal_title.replace(/\s+/g, '_')}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error generating PDF'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
