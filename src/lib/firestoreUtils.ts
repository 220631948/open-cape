/**
 * Sanitizes an object for Firestore by removing undefined values.
 * Recursively traverses arrays and nested objects.
 * Sets explicitly provided null values where required.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) return null as any;
  if (data === null || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }

  const sanitized: any = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const value = data[key];
      if (value !== undefined) {
        sanitized[key] = sanitizeForFirestore(value);
      } else {
        // Explicitly set undefined to null for Firestore compatibility
        sanitized[key] = null;
      }
    }
  }
  return sanitized as T;
}
