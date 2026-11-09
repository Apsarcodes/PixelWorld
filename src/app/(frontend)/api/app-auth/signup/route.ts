import { appAuth, isEmbeddedPreviewRuntime } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isStrongPassword, isValidEmail, sanitizeString } from '@/lib/security'

const accountTypes = new Set(['advertiser', 'business', 'agency'])
const categoryValues = [
  'Food & Dining',
  'Real Estate',
  'Fashion',
  'Electronics',
  'Jobs',
  'Travel',
  'Healthcare',
  'Fintech',
  'Entertainment',
  'Automotive',
] as const
type Category = (typeof categoryValues)[number]
const categories = new Set<string>(categoryValues)

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`signup:${ip}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    if (!rateLimit.success) {
      return Response.json(
        { error: 'Too many registration attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateLimit.resetMs / 1000)),
          },
        },
      )
    }

    const input = (await request.json()) as Record<string, unknown>
    const firstName = sanitizeString(input.firstName, 80)
    const lastName = sanitizeString(input.lastName, 80)
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
    const phone = sanitizeString(input.phone, 20)
    const password = typeof input.password === 'string' ? input.password : ''
    const accountType =
      typeof input.accountType === 'string' && accountTypes.has(input.accountType)
        ? input.accountType
        : 'advertiser'
    const company = sanitizeString(input.company, 120)
    const preferredCategories = Array.isArray(input.preferredCategories)
      ? input.preferredCategories.filter(
          (value): value is Category => typeof value === 'string' && categories.has(value),
        )
      : []

    if (!firstName || !email || !password) {
      return Response.json(
        { error: 'First name, email, and password are required.' },
        { status: 400 },
      )
    }

    if (!isValidEmail(email)) {
      return Response.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 },
      )
    }

    const passwordCheck = isStrongPassword(password)
    if (!passwordCheck.valid) {
      return Response.json(
        { error: passwordCheck.reason || 'Password does not meet security requirements.' },
        { status: 400 },
      )
    }

    if (input.agreed !== true) {
      return Response.json(
        { error: 'You must accept the Terms of Service and Privacy Policy.' },
        { status: 400 },
      )
    }

    if ((accountType === 'business' || accountType === 'agency') && !company) {
      return Response.json({ error: 'Company name is required.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    await payload.create({
      collection: 'users',
      overrideAccess: false,
      user: null,
      data: {
        firstName,
        lastName: lastName || undefined,
        email,
        phone: phone || undefined,
        password,
        accountType: accountType as 'advertiser' | 'business' | 'agency',
        company: company || undefined,
        preferredCategories,
        termsAcceptedAt: new Date().toISOString(),
      },
    })

    const result = await appAuth.login(email, password)
    return Response.json(
      {
        user: result.user,
        previewToken: isEmbeddedPreviewRuntime() ? result.token : undefined,
      },
      { status: 201 },
    )
  } catch (error) {
    const message =
      error instanceof Error && /email|unique|duplicate/i.test(error.message)
        ? 'An account with this email already exists.'
        : 'We could not create your account. Please check your details and try again.'
    return Response.json({ error: message }, { status: 400 })
  }
}
