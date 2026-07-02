import { getAdminClient } from '@/lib/supabase/server'

// Server-side audit logging helper
export async function logAction(
  adminEmail: string,
  action: string,
  entityType: string,
  entityId: string
) {
  try {
    const adminClient = getAdminClient()
    const { error } = await adminClient.from('audit_logs').insert({
      admin_email: adminEmail,
      action,
      entity_type: entityType,
      entity_id: entityId
    })
    if (error) {
      console.error('Audit logging table error:', error)
    }
  } catch (error) {
    console.error('Failed to log audit action:', error)
  }
}
