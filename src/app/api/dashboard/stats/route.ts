import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

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

  try {
    // 1. Query Interns & Document status
    const { data: interns, error: internsError } = await supabase
      .from('interns')
      .select('id, domain')

    const { data: documents, error: docsError } = await supabase
      .from('intern_documents')
      .select('*')

    if (internsError || docsError) {
      return NextResponse.json(
        { error: internsError?.message || docsError?.message },
        { status: 500 }
      )
    }

    const totalInterns = interns.length
    
    // Initialize Domain Count breakdown map
    const domainBreakdown: Record<string, number> = {
      'Python Programming': 0,
      'C++ Programming': 0,
      'Java Programming': 0,
      'Data Science & AI Basics': 0,
      'Cybersecurity Fundamentals': 0,
      'Full Stack Development': 0
    }

    interns.forEach(i => {
      if (domainBreakdown[i.domain] !== undefined) {
        domainBreakdown[i.domain]++
      }
    })

    const offerLetters = { generated: 0, pending: 0 }
    const certificates = { generated: 0, pending: 0 }
    const experienceCertificates = { generated: 0, pending: 0 }
    const recommendationLetters = { generated: 0, pending: 0 }

    documents.forEach(d => {
      if (d.offer_letter_generated) offerLetters.generated++; else offerLetters.pending++;
      if (d.certificate_generated) certificates.generated++; else certificates.pending++;
      if (d.experience_certificate_generated) experienceCertificates.generated++; else experienceCertificates.pending++;
      if (d.recommendation_letter_generated) recommendationLetters.generated++; else recommendationLetters.pending++;
    })

    // Catch interns that do not have matching row inside document status table
    const docInternIds = new Set(documents.map(d => d.intern_id))
    interns.forEach(i => {
      if (!docInternIds.has(i.id)) {
        offerLetters.pending++
        certificates.pending++
        experienceCertificates.pending++
        recommendationLetters.pending++
      }
    })

    // 2. Query Project Metrics
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('status')

    if (projError) {
      return NextResponse.json({ error: projError.message }, { status: 500 })
    }

    let activeProjects = 0
    let completedProjects = 0
    let totalInquiries = 0

    projects.forEach(p => {
      if (p.status === 'in_progress') activeProjects++
      else if (p.status === 'completed') completedProjects++
      else if (p.status === 'inquiry') totalInquiries++
    })

    // 3. Query Proposals (Recent list & total count)
    const { data: proposals, error: propError } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false })

    if (propError) {
      return NextResponse.json({ error: propError.message }, { status: 500 })
    }

    const proposalsSentCount = proposals.length
    const recentProposals = proposals.slice(0, 5)

    // 4. Query Invoice Totals & Breakdown
    const { data: invoices, error: invError } = await supabase
      .from('invoices')
      .select('*')

    if (invError) {
      return NextResponse.json({ error: invError.message }, { status: 500 })
    }

    const invoicesCount = invoices.length
    const invoicesAmount = invoices.reduce((sum, inv) => sum + Number(inv.amount_pkr), 0)

    const adminBreakdown: Record<string, { count: number; amount: number }> = {}
    invoices.forEach(inv => {
      const email = inv.generated_by || 'unknown@cloudexify.com'
      if (!adminBreakdown[email]) {
        adminBreakdown[email] = { count: 0, amount: 0 }
      }
      adminBreakdown[email].count++
      adminBreakdown[email].amount += Number(inv.amount_pkr)
    })

    return NextResponse.json({
      interns: {
        total: totalInterns,
        domainBreakdown,
        offerLetters,
        certificates,
        experienceCertificates,
        recommendationLetters
      },
      projects: {
        active: activeProjects,
        completed: completedProjects,
        inquiries: totalInquiries,
        proposalsSentCount,
        recentProposals,
        invoicesCount,
        invoicesAmount,
        adminBreakdown
      }
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
