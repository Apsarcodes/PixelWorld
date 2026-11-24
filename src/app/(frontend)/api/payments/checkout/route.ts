import { appAuth } from '@/lib/app-auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { paymentService } from '@/lib/payments/service'

export async function POST(request: Request) {
  try {
    const user = await appAuth.payloadUser(request)
    if (!user) {
      return Response.json({ error: 'Please sign in to complete checkout.' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`checkout:${user.id}_${ip}`, { limit: 15, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many checkout requests. Please wait a moment.' }, { status: 429 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const campaignId = body.campaignId as string | number
    const slotId = (body.slotId as string | number) || 1
    const durationDays = Number(body.durationDays) || 30
    const sizeCategory = (body.sizeCategory as any) || 'medium'
    const city = typeof body.city === 'string' ? body.city : 'Chennai'
    const width = Number(body.width) || undefined
    const height = Number(body.height) || undefined
    const addons = typeof body.addons === 'object' && body.addons !== null ? (body.addons as any) : undefined
    const returnUrl = (typeof body.returnUrl === 'string' && body.returnUrl) || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?screen=dashboard`

    const organizationId =
      user.defaultOrganization && typeof user.defaultOrganization === 'object' && 'id' in user.defaultOrganization
        ? (user.defaultOrganization as { id: string | number }).id
        : user.defaultOrganization || user.id

    const bookingResult = await paymentService.initiateBooking({
      userId: user.id,
      organizationId: organizationId as string | number,
      campaignId,
      slotId,
      durationDays,
      sizeCategory,
      city,
      width,
      height,
      addons,
      returnUrl,
      customer: {
        fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
        email: user.email,
        phoneNumber: user.phone || undefined,
      },
    })

    return Response.json(bookingResult, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create payment order.'
    return Response.json({ error: message }, { status: 400 })
  }
}
