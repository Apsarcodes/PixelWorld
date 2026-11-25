import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { consumeResetToken } from '@/lib/otp-store'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`reset_pw:${ip}`, { limit: 10, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : ''
    const resetToken = typeof body.resetToken === 'string' ? body.resetToken : ''
    const newPassword = typeof body.password === 'string' ? body.password : ''

    if (!email || !resetToken || !newPassword) {
      return Response.json({ error: 'Email, token, and new password are required.' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 })
    }

    const tokenValid = consumeResetToken(email, resetToken)
    if (!tokenValid) {
      return Response.json({ error: 'Reset session expired or invalid. Please start again.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const users = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    if (users.docs.length === 0) {
      return Response.json({ error: 'Account not found.' }, { status: 404 })
    }

    const user = users.docs[0]
    await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: {
        password: newPassword,
      },
    })

    return Response.json({
      ok: true,
      message: 'Password has been successfully updated.',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update password.'
    return Response.json({ error: message }, { status: 500 })
  }
}
