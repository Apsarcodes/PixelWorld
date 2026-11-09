import { appAuth, isEmbeddedPreviewRuntime } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'

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
    const input = (await request.json()) as Record<string, unknown>
    const firstName = typeof input.firstName === 'string' ? input.firstName.trim() : ''
    const lastName = typeof input.lastName === 'string' ? input.lastName.trim() : ''
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
    const phone = typeof input.phone === 'string' ? input.phone.trim() : ''
    const password = typeof input.password === 'string' ? input.password : ''
    const accountType =
      typeof input.accountType === 'string' && accountTypes.has(input.accountType)
        ? input.accountType
        : 'advertiser'
    const company = typeof input.company === 'string' ? input.company.trim() : ''
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
    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
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
