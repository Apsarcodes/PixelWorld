import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isOwnerEmail } from '@/constants/auth'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`admin_refund:${ip}`, { limit: 20, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests' }, { status: 429 })
    }

    const user = await appAuth.payloadUser(request)
    const isAdmin =
      user &&
      ((user as any).role === 'admin' ||
        (user as any).collection === 'admins' ||
        isOwnerEmail(user.email))

    if (!isAdmin) {
      return Response.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const paymentId = String(body.paymentId || '').trim()
    const reason = String(body.reason || 'Admin approved refund upon user request.').trim()

    if (!paymentId) {
      return Response.json({ error: 'Payment ID is required to process refund.' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // 1. Locate the payment record
    const paymentResult = await payload.find({
      collection: 'payments' as any,
      where: {
        or: [
          { id: { equals: paymentId } },
          { paymentId: { equals: paymentId } },
          { transactionHash: { equals: paymentId } },
        ],
      },
      limit: 1,
      overrideAccess: true,
      depth: 1,
    })

    const paymentDoc = paymentResult.docs[0] as any
    if (!paymentDoc) {
      return Response.json({ error: `Payment record not found for ID: ${paymentId}` }, { status: 404 })
    }

    if (paymentDoc.status === 'refunded') {
      return Response.json({ error: 'This payment has already been refunded.' }, { status: 400 })
    }

    // 2. Mark payment as refunded
    const updatedPayment = await payload.update({
      collection: 'payments' as any,
      id: paymentDoc.id,
      data: {
        status: 'refunded',
        metadata: {
          ...(paymentDoc.metadata || {}),
          refundedAt: new Date().toISOString(),
          refundReason: reason,
          refundedBy: user.email,
        },
      },
      overrideAccess: true,
    })

    // 3. Update associated campaign if exists
    const campaignId =
      paymentDoc.campaign && typeof paymentDoc.campaign === 'object'
        ? paymentDoc.campaign.id
        : paymentDoc.campaign

    if (campaignId) {
      try {
        await payload.update({
          collection: 'campaigns',
          id: campaignId,
          data: {
            _status: 'draft',
          } as any,
          overrideAccess: true,
        })
      } catch (campErr) {
        console.warn('[Admin Refund] Campaign status update note:', campErr)
      }

      // 4. Free up any inventory slot linked to this campaign
      try {
        const slotsResult = await payload.find({
          collection: 'inventory-slots' as any,
          where: { activeCampaign: { equals: campaignId } },
          limit: 10,
          overrideAccess: true,
        })

        for (const slot of slotsResult.docs) {
          await payload.update({
            collection: 'inventory-slots' as any,
            id: slot.id,
            data: {
              status: 'available',
              activeCampaign: null,
            },
            overrideAccess: true,
          })
        }
      } catch (slotErr) {
        console.warn('[Admin Refund] Slot release note:', slotErr)
      }
    }

    // 5. In-app notification for the user
    const recipientUserId =
      paymentDoc.user && typeof paymentDoc.user === 'object'
        ? paymentDoc.user.id
        : paymentDoc.user

    const recipientOrgId =
      paymentDoc.organization && typeof paymentDoc.organization === 'object'
        ? paymentDoc.organization.id
        : paymentDoc.organization

    if (recipientUserId && recipientOrgId) {
      try {
        await payload.create({
          collection: 'notifications' as any,
          data: {
            user: recipientUserId,
            organization: recipientOrgId,
            title: 'Refund Processed',
            message: `A refund of ₹${paymentDoc.amount || 0} has been processed for payment #${paymentDoc.paymentId || paymentDoc.id}. Reason: ${reason}`,
            type: 'info',
            read: false,
          },
          overrideAccess: true,
        })
      } catch (notifErr) {
        console.warn('[Admin Refund] Notification creation note:', notifErr)
      }
    }

    return Response.json({
      success: true,
      message: `Refund of ₹${paymentDoc.amount || 0} successfully processed.`,
      payment: updatedPayment,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process refund.'
    return Response.json({ error: message }, { status: 400 })
  }
}
