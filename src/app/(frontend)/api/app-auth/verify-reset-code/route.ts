import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { verifyPasswordResetOtp } from '@/lib/otp-store'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`verify_otp:${ip}`, { limit: 15, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many verification attempts. Please wait.' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
    const otp = typeof body.otp === 'string' ? body.otp.trim() : ''

    if (!email || !otp) {
      return Response.json({ error: 'Email and 6-digit code are required.' }, { status: 400 })
    }

    const result = verifyPasswordResetOtp(email, otp)
    if (!result.valid) {
      return Response.json({ error: result.error || 'Invalid or expired code.' }, { status: 400 })
    }

    return Response.json({
      ok: true,
      resetToken: result.resetToken,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed.'
    return Response.json({ error: message }, { status: 500 })
  }
}
