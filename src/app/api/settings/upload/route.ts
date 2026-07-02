import { createClient, getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

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
    const { fileName, fileType, base64Data, bucketName = 'admin-assets' } = await request.json()
    if (!base64Data) {
      return NextResponse.json({ error: 'Missing base64 data' }, { status: 400 })
    }

    // Extract base64 payload from data URI scheme
    const base64Content = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data
    const buffer = Buffer.from(base64Content, 'base64')

    const adminClient = getAdminClient()

    // Dynamically verify and generate the target storage bucket in Supabase if absent
    const { data: buckets } = await adminClient.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === bucketName)
    if (!bucketExists) {
      const { error: bucketError } = await adminClient.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2 // 2MB
      })
      if (bucketError) {
        return NextResponse.json({ error: 'Failed to initialize storage bucket: ' + bucketError.message }, { status: 500 })
      }
    }

    const filePath = `${user.id}/${Date.now()}_${fileName}`
    const { error: uploadError } = await adminClient.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: fileType,
        upsert: true
      })

    if (uploadError) {
      return NextResponse.json({ error: 'File upload error: ' + uploadError.message }, { status: 500 })
    }

    const { data: { publicUrl } } = adminClient.storage.from(bucketName).getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
