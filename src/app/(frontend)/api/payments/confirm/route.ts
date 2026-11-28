import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { sendOrderConfirmationEmail } from '@/lib/email/resend'
import { ensureUserOrganization } from '@/lib/organization'

export async function POST(request: Request) {
  try {
    const user = await appAuth.payloadUser(request)
    if (!user) {
      return Response.json({ error: 'Please sign in to confirm payment.' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`pay_confirm:${user.id}_${ip}`, { limit: 30, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const paymentId = String(body.paymentId || '')
    const orderId = String(body.orderId || '')
    const utr = String(body.utr || '').trim()
    const rawCampaignId = body.campaignId as string | number | undefined
    const slotId = body.slotId as string | number | undefined

    if (!paymentId && !orderId) {
      return Response.json({ error: 'Order ID or Payment ID is required.' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Resolve or provision default organization
    let organizationId: string | number | undefined =
      user.defaultOrganization &&
      typeof user.defaultOrganization === 'object' &&
      'id' in user.defaultOrganization
        ? (user.defaultOrganization as any).id
        : (user.defaultOrganization as any)

    if (!organizationId) {
      try {
        organizationId = await ensureUserOrganization(user as any, payload)
        user.defaultOrganization = organizationId as any
      } catch (err) {
        console.warn('[Payments Confirm] Organization resolution error:', err)
      }
    }

    // Safety fallback: if still missing, ensure organization exists
    if (!organizationId) {
      try {
        const orgs = await payload.find({ collection: 'organizations', limit: 1, overrideAccess: true })
        if (orgs.docs.length > 0) {
          organizationId = orgs.docs[0].id
        } else {
          const newOrg = await payload.create({
            collection: 'organizations',
            overrideAccess: true,
            data: { name: 'PixelWord Personal Org', type: 'personal', owner: user.id },
          })
          organizationId = newOrg.id
        }
      } catch {}
    }

    // Verify campaign validity if provided
    let validCampaignId: string | number | undefined = undefined
    if (rawCampaignId) {
      try {
        const found = await payload.findByID({
          collection: 'campaigns',
          id: rawCampaignId,
          overrideAccess: true,
        })
        if (found) validCampaignId = found.id
      } catch {
        validCampaignId = undefined
      }
    }

    // 1. Check if a payment already exists by indexed columns (never query nested json metadata in SQL)
    let paymentDoc: any = null
    if (paymentId) {
      try {
        const existing = await payload.find({
          collection: 'payments' as any,
          where: { paymentId: { equals: paymentId } },
          limit: 1,
          overrideAccess: true,
        })
        if (existing.docs.length > 0) paymentDoc = existing.docs[0]
      } catch (findErr) {
        console.warn('[Payments Confirm] Existing payment lookup note:', findErr)
      }
    }
    if (!paymentDoc && utr) {
      try {
        const existingByUtr = await payload.find({
          collection: 'payments' as any,
          where: { transactionHash: { equals: utr } },
          limit: 1,
          overrideAccess: true,
        })
        if (existingByUtr.docs.length > 0) paymentDoc = existingByUtr.docs[0]
      } catch {}
    }

    const totalAmount = Number(body.amount) || 50
    const subtotal = Number(body.subtotal) || Math.round(totalAmount / 1.18)
    const gstAmount = Number(body.gstAmount) || Math.round(totalAmount - subtotal)

    if (paymentDoc) {
      // Update existing payment to success
      paymentDoc = await payload.update({
        collection: 'payments' as any,
        id: paymentDoc.id,
        data: {
          status: 'success',
          transactionHash: utr || (paymentDoc as any).transactionHash || `UPI-${Date.now()}`,
          verifiedAt: new Date().toISOString(),
          ...(validCampaignId ? { campaign: validCampaignId } : {}),
        },
        overrideAccess: true,
      })
    } else {
      // Create new verified payment record with safe upsert
      const payIdToUse = paymentId || `youpi_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      try {
        paymentDoc = await payload.create({
          collection: 'payments' as any,
          data: {
            paymentId: payIdToUse,
            provider: 'youpi-pg',
            transactionHash: utr || `UPI-UTR-${Date.now()}`,
            amount: totalAmount,
            currency: 'INR',
            status: 'success',
            ...(validCampaignId ? { campaign: validCampaignId } : {}),
            ...(organizationId ? { organization: organizationId } : {}),
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
      } catch (createErr) {
        console.warn('[Payments Confirm] Upsert fallback on create note:', createErr)
        try {
          const fallback = await payload.find({
            collection: 'payments' as any,
            where: { paymentId: { equals: payIdToUse } },
            limit: 1,
            overrideAccess: true,
          })
          if (fallback.docs.length > 0) {
            paymentDoc = await payload.update({
              collection: 'payments' as any,
              id: fallback.docs[0].id,
              data: {
                status: 'success',
                transactionHash: utr || `UPI-${Date.now()}`,
                verifiedAt: new Date().toISOString(),
                ...(validCampaignId ? { campaign: validCampaignId } : {}),
              },
              overrideAccess: true,
            })
          }
        } catch {}
      }
    }

    // 2. Generate official GST tax invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    if (organizationId) {
      try {
        await payload.create({
          collection: 'invoices' as any,
          data: {
            invoiceNumber,
            organization: organizationId,
            user: user.id,
            ...(validCampaignId ? { campaign: validCampaignId } : {}),
            ...(paymentDoc?.id ? { payment: paymentDoc.id } : {}),
            amount: subtotal,
            tax: gstAmount,
            totalAmount,
            currency: 'INR',
            status: 'paid',
            issuedAt: new Date().toISOString(),
            paidAt: new Date().toISOString(),
          },
          overrideAccess: true,
        })
      } catch (invErr) {
        console.warn('[Payments Confirm] Invoice creation note:', invErr)
      }
    }

    // 3. Immediately activate and publish the campaign!
    if (validCampaignId) {
      try {
        await payload.update({
          collection: 'campaigns',
          id: validCampaignId,
          data: {
            _status: 'published',
          } as any,
          overrideAccess: true,
        })
      } catch (campErr) {
        console.warn('[Payments Confirm] Campaign publish note:', campErr)
      }
    }

    // 4. Update the reserved slot to occupied
    if (slotId) {
      try {
        await payload.update({
          collection: 'inventory-slots' as any,
          id: slotId,
          data: {
            status: 'occupied',
            ...(validCampaignId ? { activeCampaign: validCampaignId } : {}),
          },
          overrideAccess: true,
        })
      } catch (slotErr) {
        console.warn('[Payments Confirm] Slot status update note:', slotErr)
      }
    }

    // 5. In-app notification
    if (organizationId) {
      try {
        await payload.create({
          collection: 'notifications' as any,
          data: {
            user: user.id,
            organization: organizationId,
            title: 'UPI Payment Confirmed',
            message: `Your payment for campaign #${validCampaignId || ''} was confirmed via UPI (UTR: ${utr || orderId}). Your advertisement is now LIVE on the canvas!`,
            type: 'success',
            read: false,
          },
          overrideAccess: true,
        })
      } catch (notifErr) {
        console.warn('[Payments Confirm] Notification note:', notifErr)
      }
    }

    // 6. Send Order Confirmation & GST Tax Invoice Email via Resend
    if (user.email) {
      sendOrderConfirmationEmail({
        to: user.email,
        customerName: (user as any).firstName || user.email.split('@')[0],
        invoiceNumber,
        campaignName: String(body.campaignName || `Campaign #${validCampaignId || ''}`),
        city: String(body.city || 'Chennai'),
        days: Number(body.days) || 1,
        subtotal,
        gstAmount,
        totalAmount,
        utr: utr || undefined,
      }).catch((err) => console.error('[Order Confirmation Email Error]', err))
    }

    return Response.json({
      ok: true,
      status: 'success',
      paymentId: (paymentDoc as any)?.paymentId || paymentId,
      orderId,
      invoiceNumber,
      amount: totalAmount,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to confirm payment.'
    console.error('[Payment Confirmation Fatal Error]', error)
    return Response.json({ error: message }, { status: 400 })
  }
}
