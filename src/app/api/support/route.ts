import { createClient } from '@/lib/supabase/server'
import { isRateLimited, sanitizeInput } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = createClient()
  
  // URL params to check if it's a public lookup or an admin fetch
  const { searchParams } = new URL(request.url)
  const ticketNumber = searchParams.get('ticket_number')

  if (ticketNumber) {
    // Public fetch by ticket number
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('ticket_number', ticketNumber.toUpperCase())
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket: data })
  }

  // Otherwise, it must be an admin fetching all tickets
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Mark as viewed
    const idsToMark = data.filter(t => t.is_new).map(t => t.id)
    if (idsToMark.length > 0) {
      supabase.from('support_tickets').update({ is_new: false }).in('id', idsToMark).then()
    }

    return NextResponse.json({ tickets: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip, 3, 60000)) { // Stricter rate limit for creation
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = createClient()

  try {
    const body = await request.json()
    const name = sanitizeInput(body.user_name || '')
    const email = String(body.user_email || '').trim().toLowerCase()
    const subject = sanitizeInput(body.subject || '')
    const description = sanitizeInput(body.description || '')

    if (!name || !email || !subject || !description) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
    }

    // Generate ticket number CX-SUP-[YEAR]-[RANDOM 4 chars]
    const year = new Date().getFullYear()
    const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase()
    const ticketNumber = `CX-SUP-${year}-${randomChars}`

    const { data, error } = await supabase
      .from('support_tickets')
      .insert({
        ticket_number: ticketNumber,
        user_name: name,
        user_email: email,
        subject,
        description,
        status: 'open',
        is_new: true
      })
      .select()
      .single()

    if (error) {
      // If collision on unique constraint, retry or return error
      return NextResponse.json({ error: 'Failed to create ticket. Please try again.' }, { status: 500 })
    }

    // Insert admin notification
    await supabase.from('admin_notifications').insert({
      title: 'New Support Ticket',
      message: `${name} opened ticket ${ticketNumber}: ${subject}`,
      type: 'system',
      link: '/dashboard/support',
      is_read: false
    })

    return NextResponse.json({ ticket: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = !!user;

  try {
    const body = await request.json()
    const id = body.id
    const replyText = sanitizeInput(body.reply_text || '')
    const sender = body.sender // 'admin' or 'user'
    let status = body.status

    if (!id || !replyText || !sender) {
      return NextResponse.json({ error: 'Ticket ID, reply text, and sender are required' }, { status: 400 })
    }

    if (sender === 'admin' && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized to send admin reply' }, { status: 401 })
    }

    // Fetch the current ticket to get the messages array
    const { data: currentTicket, error: fetchError } = await supabase
      .from('support_tickets')
      .select('messages, status, ticket_number')
      .eq('id', id)
      .single()
      
    if (fetchError || !currentTicket) {
       return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const messages = currentTicket.messages || []
    
    messages.push({
      sender,
      text: replyText,
      timestamp: new Date().toISOString()
    })

    // Auto-update status and is_new based on who is replying
    if (sender === 'admin') {
       status = status || 'answered'
    } else {
       status = 'open' // Reopen ticket if user replies
    }
    
    const isNew = sender === 'user'

    const { data, error } = await supabase
      .from('support_tickets')
      .update({
        messages,
        status,
        is_new: isNew
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (isAdmin) {
      await logAction(
        user.email!,
        `Replied to support ticket ${data.ticket_number}`,
        'support',
        data.id
      )
    }

    return NextResponse.json({ ticket: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
