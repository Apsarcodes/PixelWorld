import { appAuth, isEmbeddedPreviewRuntime } from '@/lib/app-auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isValidEmail } from '@/lib/security'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`login:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 })
    if (!rateLimit.success) {
      return Response.json(
        { error: 'Too many login attempts. Please wait a few minutes before trying again.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        },
      )
    }

    const input = (await request.json()) as Record<string, unknown>
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
    const password = typeof input.password === 'string' ? input.password : ''

    if (!email || !password || !isValidEmail(email)) {
      return Response.json({ error: 'Valid email and password are required.' }, { status: 400 })
    }

    const result = await appAuth.login(email, password)
    return Response.json({
      user: result.user,
      previewToken: isEmbeddedPreviewRuntime() ? result.token : undefined,
    })
  } catch {
    return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
  }
}
