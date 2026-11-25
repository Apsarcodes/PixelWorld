import crypto from 'crypto'

interface StoredOtp {
  hash: string
  expiresAt: number
  attempts: number
  resetToken?: string
}

// In-memory OTP cache (keyed by normalized email)
const otpCache = new Map<string, StoredOtp>()

function hashOtp(email: string, otp: string): string {
  const secret = process.env.PAYLOAD_SECRET || 'pixelworld-otp-secret'
  return crypto.createHmac('sha256', secret).update(`${email.toLowerCase()}:${otp}`).digest('hex')
}

export function savePasswordResetOtp(email: string, otp: string): void {
  const normalized = email.toLowerCase().trim()
  const hash = hashOtp(normalized, otp)
  otpCache.set(normalized, {
    hash,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  })
}

export function verifyPasswordResetOtp(email: string, otp: string): { valid: boolean; resetToken?: string; error?: string } {
  const normalized = email.toLowerCase().trim()
  const record = otpCache.get(normalized)

  if (!record) {
    return { valid: false, error: 'Reset code expired or not found. Please request a new code.' }
  }

  if (Date.now() > record.expiresAt) {
    otpCache.delete(normalized)
    return { valid: false, error: 'Reset code has expired. Please request a new one.' }
  }

  if (record.attempts >= 5) {
    otpCache.delete(normalized)
    return { valid: false, error: 'Too many incorrect attempts. Please request a new code.' }
  }

  record.attempts += 1
  const providedHash = hashOtp(normalized, otp)

  if (record.hash !== providedHash) {
    return { valid: false, error: 'Incorrect 6-digit code. Please try again.' }
  }

  // Issue temporary single-use reset token valid for 15 minutes
  const resetToken = crypto.randomBytes(32).toString('hex')
  record.resetToken = resetToken
  record.expiresAt = Date.now() + 15 * 60 * 1000 // 15 mins to enter new password

  return { valid: true, resetToken }
}

export function consumeResetToken(email: string, resetToken: string): boolean {
  const normalized = email.toLowerCase().trim()
  const record = otpCache.get(normalized)

  if (!record || !record.resetToken || record.resetToken !== resetToken) {
    return false
  }

  if (Date.now() > record.expiresAt) {
    otpCache.delete(normalized)
    return false
  }

  // Token is valid; delete record to prevent replay
  otpCache.delete(normalized)
  return true
}
