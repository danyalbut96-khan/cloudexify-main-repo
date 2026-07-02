import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { ProposalPDF } from '@/components/documents/ProposalPDF'

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

    // 4. Render PDF to Buffer
    const docElement = React.createElement(ProposalPDF, {
      proposal,
      companySettings,
      adminName,
      signatureUrl
    })

    const pdfBuffer = await pdf(docElement as any).toBuffer()

    // 5. Return Stream response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Proposal_${proposal.proposal_title.replace(/\s+/g, '_')}.pdf"`,
        'Cache-Control': 'no-store'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error generating PDF' }, { status: 500 })
  }
}
