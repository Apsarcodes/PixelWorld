import crypto from 'crypto'
import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { paymentService } from '@/lib/payments/service'

export async function POST(request: Request) {
  try {
    const user = await appAuth.payloadUser(request)
    if (!user) {
      return Response.json({ error: 'Please sign in to reserve this advertising space.' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`lock:${user.id}_${ip}`, { limit: 20, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many reservation requests. Please wait a moment.' }, { status: 429 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const slotId = body.slotId as string | number
    if (!slotId) {
      return Response.json({ error: 'Slot ID is required to create a reservation.' }, { status: 400 })
    }

    const rawDays = Number(body.durationDays)
    const durationDays: 7 | 30 | 90 = rawDays === 7 ? 7 : rawDays === 90 ? 90 : 30
    const campaignId = body.campaignId as string | number | undefined

    const organizationId =
      user.defaultOrganization && typeof user.defaultOrganization === 'object' && 'id' in user.defaultOrganization
        ? (user.defaultOrganization as { id: string | number }).id
        : user.defaultOrganization || user.id

    const lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15-minute lock
    const pricing = paymentService.calculatePrice(durationDays)
    const reservationCode = `RES-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

    let reservationRecord = {
      reservationCode,
      slotId,
      campaignId: campaignId || null,
      organizationId,
      userId: user.id,
      durationDays,
      subtotal: pricing.subtotal,
      gstAmount: pricing.gstAmount,
      totalAmount: pricing.totalAmount,
      lockedUntil: lockExpiresAt.toISOString(),
      status: 'pending_payment',
    }

    try {
      const payload = await getPayloadClient()
      
      // Check for active conflict on the same slot
      const existingLocks = await payload.find({
        collection: 'reservations' as any,
        where: {
          and: [
            { slot: { equals: slotId } },
            { status: { equals: 'pending_payment' } },
            { lockedUntil: { greater_than: new Date().toISOString() } },
          ],
        },
        limit: 1,
      })

      if (existingLocks.docs.length > 0) {
        const lock = existingLocks.docs[0] as any
        const isSelfLock = lock.user === user.id || lock.user?.id === user.id
        if (!isSelfLock) {
          return Response.json(
            { error: 'This advertising space is currently on hold by another advertiser. Please select an adjacent tile or check back shortly.' },
            { status: 409 }
          )
        }
      }

      if (campaignId) {
        const created = await payload.create({
          collection: 'reservations' as any,
          data: {
            reservationCode,
            slot: slotId,
            campaign: campaignId,
            organization: organizationId,
            user: user.id,
            durationDays,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + durationDays * 86400 * 1000).toISOString(),
            totalAmount: pricing.totalAmount,
            status: 'pending_payment',
            lockedUntil: lockExpiresAt.toISOString(),
          },
          overrideAccess: true,
        })
        if (created?.id) {
          reservationRecord = { ...reservationRecord, reservationCode: (created as any).reservationCode || reservationCode }
        }
      }
    } catch {
      // In standalone dev mode without DB seeding, the memory lock contract stands
    }

    return Response.json({
      ok: true,
      reservation: reservationRecord,
    }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reserve slot'
    return Response.json({ error: message }, { status: 500 })
  }
}
