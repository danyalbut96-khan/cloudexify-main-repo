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
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Sanitize deep object properties recursively (handling arrays correctly)
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  if (Array.isArray(obj)) {
    return (obj as any).map((item: any) => {
      if (typeof item === 'string') return sanitizeInput(item);
      if (typeof item === 'object' && item !== null) return sanitizeObject(item);
      return item;
    }) as any;
  }
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
