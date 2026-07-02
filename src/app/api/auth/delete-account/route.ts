import { NextRequest, NextResponse } from 'next/server'
import { createClient, getAdminClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils'
import { logAction } from '@/lib/server-utils'

export async function DELETE(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Authenticate the current session
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = getAdminClient()

  try {
    // 1. Fetch admin profile to get avatar/signature URLs before deleting
    const { data: profile } = await adminClient
      .from('admin_profiles')
      .select('avatar_url, signature_url')
      .eq('admin_id', user.id)
      .maybeSingle()

    // 2. Log the account deletion BEFORE any destructive action
    await logAction(
      user.email!,
      `Admin account self-deleted: ${user.email} (auth user ID: ${user.id})`,
      'admin_account',
      user.id
    )

    // 3. Delete avatar from storage if present
    if (profile?.avatar_url) {
      try {
        const avatarPath = extractStoragePath(profile.avatar_url, 'admin-avatars')
        if (avatarPath) {
          await adminClient.storage.from('admin-avatars').remove([avatarPath])
        }
      } catch (storageErr) {
        console.error('Failed to delete avatar from storage:', storageErr)
        // Non-fatal — continue with deletion
      }
    }

    // 4. Delete signature from storage if present
    if (profile?.signature_url) {
      try {
        const sigPath = extractStoragePath(profile.signature_url, 'admin-signatures')
        if (sigPath) {
          await adminClient.storage.from('admin-signatures').remove([sigPath])
        }
      } catch (storageErr) {
        console.error('Failed to delete signature from storage:', storageErr)
        // Non-fatal — continue with deletion
      }
    }

    // 5. Delete admin_profiles row
    const { error: profileDeleteError } = await adminClient
      .from('admin_profiles')
      .delete()
      .eq('admin_id', user.id)

    if (profileDeleteError) {
      console.error('Failed to delete admin_profiles row:', profileDeleteError)
      // Non-fatal — continue, the auth user deletion is the critical step
    }

    // 6. Delete from admin_signatures (backwards-compat table) if present
    await adminClient
      .from('admin_signatures')
      .delete()
      .eq('email', user.email!)

    // 7. Delete the Supabase auth user (requires service role)
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(user.id)

    if (deleteAuthError) {
      return NextResponse.json(
        { error: 'Failed to delete auth account: ' + deleteAuthError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error during account deletion'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * Extracts the storage object path from a full Supabase public URL.
 * e.g. "https://<project>.supabase.co/storage/v1/object/public/admin-avatars/abc/file.png"
 * → "abc/file.png"
 */
function extractStoragePath(publicUrl: string, bucket: string): string | null {
  try {
    const marker = `/object/public/${bucket}/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return null
    return publicUrl.slice(idx + marker.length)
  } catch {
    return null
  }
}
