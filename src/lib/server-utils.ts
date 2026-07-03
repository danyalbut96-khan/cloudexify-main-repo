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

export class StreamLogger {
  private writer: WritableStreamDefaultWriter<any> | null = null;
  private encoder = new TextEncoder();
  private logs: Array<{ type: string; message: string; timestamp: string }> = [];

  constructor(writer: WritableStreamDefaultWriter<any> | null) {
    this.writer = writer;
  }

  async log(message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const payload = { type, message, timestamp };
    this.logs.push(payload);
    console.log(`[${type.toUpperCase()}] ${message}`);

    if (this.writer) {
      try {
        await this.writer.write(this.encoder.encode(JSON.stringify(payload) + '\n'));
      } catch (err) {
        // Stream closed by browser
      }
    }
  }

  getLogs() {
    return this.logs;
  }
}
