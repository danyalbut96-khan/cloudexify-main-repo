import { en } from './en';

/**
 * Type-safe translation function for looking up nested strings in the locales dictionary.
 * Supports dot-separated keys like 'common.home' or 'blog.author'.
 * If the key is not found, returns the key itself as a fallback.
 */
export function t(key: string): string {
  const keys = key.split('.');
  let current: any = en;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return key;
    }
  }

  return typeof current === 'string' ? current : key;
}
