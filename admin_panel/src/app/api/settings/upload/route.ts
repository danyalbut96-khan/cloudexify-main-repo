import { requireAdmin } from '@/lib/supabase/authorization'
import { getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

function matchesSignature(type: string, buffer: Buffer): boolean {
  if (type === 'image/png') return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  if (type === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  if (type === 'image/webp') return buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
  return false
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-real-ip') || request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (isRateLimited(ip, 10, 60000)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })

  const authorization = await requireAdmin()
  if (!authorization.ok) return authorization.response

  try {
    const body = await request.json()
    const fileName = typeof body.fileName === 'string' ? body.fileName : ''
    const fileType = typeof body.fileType === 'string' ? body.fileType.toLowerCase() : ''
    const base64Data = typeof body.base64Data === 'string' ? body.base64Data : ''
    if (!base64Data || !ALLOWED_TYPES.has(fileType)) {
      return NextResponse.json({ error: 'Only PNG, JPEG, and WebP images are allowed.' }, { status: 400 })
    }

    const base64Content = base64Data.includes(',') ? base64Data.slice(base64Data.indexOf(',') + 1) : base64Data
    if (!base64Content || base64Content.length > Math.ceil(MAX_FILE_BYTES * 4 / 3) + 8 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64Content)) {
      return NextResponse.json({ error: 'Invalid or oversized image payload.' }, { status: 400 })
    }
    const buffer = Buffer.from(base64Content, 'base64')
    if (buffer.length === 0 || buffer.length > MAX_FILE_BYTES || !matchesSignature(fileType, buffer)) {
      return NextResponse.json({ error: 'Image content does not match the allowed file type or size.' }, { status: 400 })
    }

    // This endpoint is only for public brand assets; clients cannot choose arbitrary buckets.
    const bucketName = 'admin-assets'
    const adminClient = getAdminClient()
    const { data: buckets, error: bucketListError } = await adminClient.storage.listBuckets()
    if (bucketListError) return NextResponse.json({ error: 'Storage is temporarily unavailable.' }, { status: 503 })
    if (!buckets?.some(bucket => bucket.name === bucketName)) {
      const { error } = await adminClient.storage.createBucket(bucketName, { public: true, fileSizeLimit: MAX_FILE_BYTES, allowedMimeTypes: [...ALLOWED_TYPES] })
      if (error) return NextResponse.json({ error: 'Unable to initialize public asset storage.' }, { status: 500 })
    }

    const extension = fileType === 'image/png' ? 'png' : fileType === 'image/jpeg' ? 'jpg' : 'webp'
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80).replace(/\.+/g, '.')
    const path = `${authorization.user.id}/${Date.now()}-${safeName || 'asset'}.${extension}`
    const { error: uploadError } = await adminClient.storage.from(bucketName).upload(path, buffer, {
      contentType: fileType, upsert: false, cacheControl: '3600',
    })
    if (uploadError) {
      console.error('Public asset upload failed')
      return NextResponse.json({ error: 'Unable to upload image.' }, { status: 500 })
    }
    const { data } = adminClient.storage.from(bucketName).getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch {
    return NextResponse.json({ error: 'Invalid upload request.' }, { status: 400 })
  }
}
