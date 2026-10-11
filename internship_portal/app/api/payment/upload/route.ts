import { getAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_cloudexify_12345')

async function getAuthenticatedIntern() {
  const token = cookies().get('intern_token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { id: string; email: string }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const authIntern = await getAuthenticatedIntern()
    if (!authIntern) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Size limit 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 })
    }

    const adminDb = getAdminClient()
    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `receipts/${authIntern.id}_${Date.now()}.${fileExt}`

    // Ensure bucket exists
    try {
      await adminDb.storage.createBucket('payment_receipts', { public: true })
    } catch {
      // Ignore if exists
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const { data: uploadData, error: uploadErr } = await adminDb.storage
      .from('payment_receipts')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png',
        upsert: true
      })

    if (uploadErr) {
      // Fallback to resumes bucket
      const { data: fbData, error: fbErr } = await adminDb.storage
        .from('resumes')
        .upload(fileName, buffer, {
          contentType: file.type || 'image/png',
          upsert: true
        })

      if (fbErr) {
        return NextResponse.json({ error: 'Storage upload failed: ' + fbErr.message }, { status: 500 })
      }

      const { data: urlData } = adminDb.storage.from('resumes').getPublicUrl(fileName)
      return NextResponse.json({ success: true, url: urlData.publicUrl })
    }

    const { data: urlData } = adminDb.storage.from('payment_receipts').getPublicUrl(fileName)
    return NextResponse.json({ success: true, url: urlData.publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 })
  }
}
