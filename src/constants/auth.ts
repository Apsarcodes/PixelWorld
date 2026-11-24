export const ADMIN_EMAILS: readonly string[] = Object.freeze([
  'mohamedapsarasif761@gmail.com',
  'rafimmedia@gmail.com',
  'apsarcodes@gmail.com',
])

export function isOwnerEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase().trim())
}
