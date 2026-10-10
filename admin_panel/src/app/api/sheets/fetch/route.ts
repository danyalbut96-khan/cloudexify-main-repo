import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'
import { NextRequest, NextResponse } from 'next/server'
import { fetchAndParseSheet, ParsedSheetRow } from '@/lib/sheets'

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
  const mappedTo = searchParams.get('mappedTo') // "interns", "employees", etc.

  if (!mappedTo || !['interns', 'employees', 'projects', 'invoices', 'proposals'].includes(mappedTo)) {
    return NextResponse.json({ error: 'Invalid or missing mappedTo parameter' }, { status: 400 })
  }

  try {
    // 1. Fetch active sheet connections
    const { data: connections, error: connError } = await supabase
      .from('sheet_connections')
      .select('*')
      .eq('mapped_to', mappedTo)
      .eq('is_active', true)

    if (connError) {
      return NextResponse.json({ error: connError.message }, { status: 500 })
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({ message: 'No active Google Sheet connections found for this section', syncedCount: 0 })
    }

    // 2. Fetch and parse all spreadsheet rows
    let mergedRows: ParsedSheetRow[] = []
    for (const conn of connections) {
      try {
        const parsed = await fetchAndParseSheet(conn.sheet_url)
        mergedRows = [...mergedRows, ...parsed]
      } catch (sheetErr: any) {
        console.error(`Error parsing sheet connection "${conn.sheet_name}":`, sheetErr)
      }
    }

    // Deduplicate in-memory by email address
    const uniqueSheetRows: Record<string, ParsedSheetRow> = {}
    mergedRows.forEach(row => {
      if (row.email) {
        uniqueSheetRows[row.email.toLowerCase()] = row
      }
    });

    const rowsToSync = Object.values(uniqueSheetRows)
    if (rowsToSync.length === 0) {
      return NextResponse.json({ message: 'No valid rows found in connected sheets', syncedCount: 0 })
    }

    let syncedCount = 0

    // 3. For Interns, match database, generate registrations, and insert/update
    if (mappedTo === 'interns') {
      // Fetch all existing database interns to get existing registration serial numbers
      const { data: existingInterns, error: fetchErr } = await supabase
        .from('interns')
        .select('id, email, registration_number')

      if (fetchErr) throw fetchErr

      const dbEmailMap = new Map<string, any>()
      let maxSerialNum = 0

      existingInterns?.forEach(i => {
        if (i.email) {
          dbEmailMap.set(i.email.toLowerCase(), i)
        }
        const match = i.registration_number.match(/CX-INT-2025-(\d+)/)
        if (match) {
          const serial = parseInt(match[1], 10)
          if (serial > maxSerialNum) {
            maxSerialNum = serial
          }
        }
      });

      // Prepare the insert and update operations with pre-assigned serial numbers synchronously
      const operations = rowsToSync.map((row) => {
        const emailLower = row.email!.toLowerCase()
        const existing = dbEmailMap.get(emailLower)

        if (existing) {
          return {
            isUpdate: true,
            id: existing.id,
            payload: {
              full_name: row.full_name,
              whatsapp: row.whatsapp || null,
              gender: row.gender || null,
              university: row.university || null,
              semester: row.semester || null,
              domain: row.domain,
              skill_level: row.skill_level || null,
              available_hours: row.available_hours || null,
              referral_source: row.referral_source || null
            }
          }
        } else {
          let registrationNumber = row.registration_number
          if (!registrationNumber) {
            maxSerialNum++
            registrationNumber = `CX-INT-2025-${String(maxSerialNum).padStart(3, '0')}`
          }
          return {
            isUpdate: false,
            payload: {
              registration_number: registrationNumber,
              full_name: row.full_name,
              email: emailLower,
              whatsapp: row.whatsapp || null,
              gender: row.gender || null,
              university: row.university || null,
              semester: row.semester || null,
              domain: row.domain,
              skill_level: row.skill_level || null,
              available_hours: row.available_hours || null,
              referral_source: row.referral_source || null
            }
          }
        }
      })

      // Execute database operations in parallel batches of 50 to avoid timeouts
      const batchSize = 50
      for (let i = 0; i < operations.length; i += batchSize) {
        const batch = operations.slice(i, i + batchSize)
        await Promise.all(
          batch.map(async (op) => {
            if (op.isUpdate) {
              const { error: updateErr } = await supabase
                .from('interns')
                .update(op.payload as any)
                .eq('id', op.id)
              if (!updateErr) syncedCount++
            } else {
              const { data: newIntern, error: insertErr } = await supabase
                .from('interns')
                .insert(op.payload as any)
                .select()
                .single()

              if (!insertErr && newIntern) {
                // Initialize document tracker
                await supabase
                  .from('intern_documents')
                  .insert({ intern_id: newIntern.id })
                syncedCount++
              } else if (insertErr) {
                console.error('Error inserting synced intern:', insertErr)
              }
            }
          })
        )
      }
    }

    // Write audit log trail
    await logAction(
      user.email!,
      `Synchronized ${mappedTo} metrics with connected Google Sheets (${syncedCount} rows synced)`,
      mappedTo,
      connections[0].id
    )

    return NextResponse.json({
      message: `Sheets synchronization completed successfully`,
      syncedCount
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
