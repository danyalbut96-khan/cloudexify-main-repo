import { getAdminClient } from '@/lib/supabase/server'

// Simple helper to merge Tailwind CSS classes
export function cn(...inputs: any[]) {
  return inputs.flat().filter(Boolean).join(' ')
}

// Currency Formatter (PKR)
export function formatPKR(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Rs. 0.00';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num).replace('PKR', 'Rs.');
}

// Date Formatter
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

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

// In-memory rate limiting mechanism (simple window token bucket)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(ip: string, limit = 40, windowMs = 60000): boolean {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip);

  if (!clientData || now > clientData.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + windowMs
    });
    return false;
  }

  if (clientData.count >= limit) {
    return true;
  }

  clientData.count++;
  return false;
}

// Input sanitization to prevent XSS injection attacks
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// Sanitize deep object properties recursively
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj } as any;
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]);
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  return sanitized;
}
