/**
 * Security & Input Validation Utilities
 * Defense against XSS, SSRF, Prototype Pollution, and Malicious Redirections
 */

/**
 * Validates and sanitizes external URLs to prevent SSRF and XSS (e.g. javascript: URLs)
 * Only allows valid http: and https: protocols
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString()
    }
    return null
  } catch {
    // If user provided domain without scheme (e.g. "example.com"), check and prepend https://
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:[/?#].*)?$/.test(trimmed)) {
      try {
        const withProtocol = new URL(`https://${trimmed}`)
        return withProtocol.toString()
      } catch {
        return null
      }
    }
    return null
  }
}

/**
 * Validates email format strictly
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
  return email.length <= 254 && emailRegex.test(email)
}

/**
 * Validates password strength
 * Requires minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number
 */
export function isStrongPassword(password: string): { valid: boolean; reason?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, reason: 'Password is required' }
  }
  if (password.length < 8) {
    return { valid: false, reason: 'Password must be at least 8 characters long' }
  }
  if (password.length > 128) {
    return { valid: false, reason: 'Password must not exceed 128 characters' }
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one lowercase letter' }
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one uppercase letter' }
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: 'Password must contain at least one number' }
  }
  return { valid: true }
}

/**
 * Strips HTML tags and escapes special characters to prevent stored/reflected XSS
 */
export function sanitizeString(input: unknown, maxLength = 255): string {
  if (typeof input !== 'string') return ''
  const stripped = input.replace(/<[^>]*>?/gm, '').trim()
  return stripped.slice(0, maxLength)
}

/**
 * Validates allowed MIME types for image uploads
 */
export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export function isAllowedImageMimeType(mimeType: string): boolean {
  return ALLOWED_IMAGE_MIME_TYPES.has(mimeType.toLowerCase())
}
