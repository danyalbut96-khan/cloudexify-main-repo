import { createClient } from '@/lib/supabase/server'
import { isRateLimited, sanitizeObject } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
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
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Mark as viewed in the background
    const idsToMark = data.filter(inv => inv.is_new).map(inv => inv.id);
    if (idsToMark.length > 0) {
      supabase.from('invoices').update({ is_new: false }).in('id', idsToMark).then();
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json()
    const sanitizedBody = sanitizeObject(body)

    // Generate consecutive invoice number based on invoice count
    const currentYear = new Date().getFullYear()
    const { count, error: countError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    const nextNum = (count || 0) + 1
    const invoiceNumber = `CX-INV-${currentYear}-${String(nextNum).padStart(3, '0')}`

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        client_name: sanitizedBody.client_name,
        client_email: sanitizedBody.client_email,
        project_name: sanitizedBody.project_name,
        invoice_number: invoiceNumber,
        line_items: sanitizedBody.line_items || [],
        amount_pkr: sanitizedBody.amount_pkr,
        generated_by: user.email,
        generated_date: new Date().toISOString().split('T')[0],
        status: sanitizedBody.status || 'unpaid',
        tax_percentage: sanitizedBody.tax_percentage || 0.00,
        payment_terms: sanitizedBody.payment_terms || 'Net 30'
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await logAction(
      user.email!,
      `Generated Invoice ${invoiceNumber} for client "${sanitizedBody.client_name}"`,
      'invoices',
      data.id
    )

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
