import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { savePasswordResetOtp } from '@/lib/otp-store'
import { sendPasswordResetOtpEmail } from '@/lib/email/resend'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`forgot_pw:${ip}`, { limit: 10, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many reset requests. Please wait a moment.' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    // To prevent user enumeration attacks, if user does not exist, return ok but don't send
    if (existing.docs.length === 0) {
      return Response.json({
        ok: true,
        message: 'If an account exists with this email, a 6-digit verification code has been sent.',
      })
    }

    // Generate 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    savePasswordResetOtp(email, otp)

    // Dispatch email via Resend
    await sendPasswordResetOtpEmail({ to: email, otp }).catch((err) => {
      console.error('[Forgot Password Email Error]', err)
    })

    return Response.json({
      ok: true,
      message: 'A 6-digit verification code has been sent to your email.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process reset request.'
    return Response.json({ error: message }, { status: 500 })
  }
}
