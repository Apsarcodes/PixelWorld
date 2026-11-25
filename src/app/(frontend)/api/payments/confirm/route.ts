import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { sendOrderConfirmationEmail } from '@/lib/email/resend'

export async function POST(request: Request) {
  try {
    const user = await appAuth.payloadUser(request)
    if (!user) {
      return Response.json({ error: 'Please sign in to confirm payment.' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`pay_confirm:${user.id}_${ip}`, { limit: 20, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const paymentId = String(body.paymentId || '')
    const orderId = String(body.orderId || '')
    const utr = String(body.utr || '').trim()
    const campaignId = body.campaignId as string | number
    const slotId = body.slotId as string | number

    if (!paymentId && !orderId) {
      return Response.json({ error: 'Order ID or Payment ID is required.' }, { status: 400 })
    }

    const payload = await getPayloadClient()
    const organizationId =
      user.defaultOrganization && typeof user.defaultOrganization === 'object' && 'id' in user.defaultOrganization
        ? (user.defaultOrganization as { id: string | number }).id
        : user.defaultOrganization || user.id

    // 1. Check if a payment already exists
    const existingPayments = await payload.find({
      collection: 'payments' as any,
      where: {
        or: [
          { paymentId: { equals: paymentId } },
          { transactionHash: { equals: utr || orderId } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    let paymentDoc = existingPayments.docs[0]

    if (paymentDoc) {
      // Update to success
      paymentDoc = await payload.update({
        collection: 'payments' as any,
        id: paymentDoc.id,
        data: {
          status: 'success',
          transactionHash: utr || (paymentDoc as any).transactionHash || `UPI-${Date.now()}`,
          verifiedAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })
    } else {
      // Create new verified payment record
      paymentDoc = await payload.create({
        collection: 'payments' as any,
        data: {
          paymentId: paymentId || `youpi_${Date.now()}`,
          provider: 'youpi-pg',
          transactionHash: utr || `UPI-UTR-${Date.now()}`,
          amount: Number(body.amount) || 1179,
          currency: 'INR',
          status: 'success',
          campaign: campaignId || undefined,
          organization: organizationId,
          user: user.id,
          verifiedAt: new Date().toISOString(),
          metadata: {
            orderId,
            utr,
            source: 'upi_direct_settlement',
            merchantVpa: 'rafimmedia-1@oksbi',
          },
        },
        overrideAccess: true,
      })
    }

    // 2. Generate official GST tax invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    const subtotal = Number(body.subtotal) || Math.round((Number(body.amount) || 1179) / 1.18)
    const gstAmount = Number(body.gstAmount) || Math.round((Number(body.amount) || 1179) - subtotal)

    await payload.create({
      collection: 'invoices' as any,
      data: {
        invoiceNumber,
        organization: organizationId,
        user: user.id,
        campaign: campaignId || undefined,
        payment: paymentDoc?.id,
        amount: subtotal,
        tax: gstAmount,
        totalAmount: Number(body.amount) || subtotal + gstAmount,
        currency: 'INR',
        status: 'paid',
        issuedAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
      },
      overrideAccess: true,
    }).catch(() => {})

    // 3. Immediately activate and publish the campaign!
    if (campaignId) {
      await payload.update({
        collection: 'campaigns',
        id: campaignId,
        data: {
          status: 'published',
        },
        overrideAccess: true,
      }).catch(() => {})
    }

    // 4. Update the reserved slot to occupied
    if (slotId) {
      await payload.update({
        collection: 'inventory-slots' as any,
        id: slotId,
        data: {
          status: 'occupied',
          activeCampaign: campaignId,
        },
        overrideAccess: true,
      }).catch(() => {})
    }

    // 5. In-app notification
    await payload.create({
      collection: 'notifications' as any,
      data: {
        user: user.id,
        organization: organizationId,
        title: 'UPI Payment Confirmed',
        message: `Your payment for campaign #${campaignId} was confirmed via UPI (UTR: ${utr || orderId}). Your advertisement is now LIVE on the canvas!`,
        type: 'success',
        read: false,
      },
      overrideAccess: true,
    }).catch(() => {})

    // 6. Send Order Confirmation & GST Tax Invoice Email via Resend
    if (user.email) {
      sendOrderConfirmationEmail({
        to: user.email,
        customerName: (user as any).name || user.email.split('@')[0],
        invoiceNumber,
        campaignName: String(body.campaignName || `Campaign #${campaignId || ''}`),
        city: String(body.city || 'Chennai'),
        days: Number(body.days) || 7,
        subtotal,
        gstAmount,
        totalAmount: Number(body.amount) || subtotal + gstAmount,
        utr: utr || undefined,
      }).catch((err) => console.error('[Order Confirmation Email Error]', err))
    }

    return Response.json({
      ok: true,
      status: 'success',
      paymentId: (paymentDoc as any)?.paymentId || paymentId,
      orderId,
      invoiceNumber,
      amount: Number(body.amount) || 1179,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to confirm payment.'
    return Response.json({ error: message }, { status: 400 })
  }
}
