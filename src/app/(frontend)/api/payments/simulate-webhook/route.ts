import crypto from 'crypto'
import { paymentService } from '@/lib/payments/service'

export async function POST(request: Request) {
  // Allow only in non-production or for testing
  if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_PAYMENT_SIMULATION) {
    return Response.json({ error: 'Simulation disabled in production' }, { status: 403 })
  }

  try {
    const body = (await request.json()) as Record<string, unknown>
    const orderId = String(body.orderId || `PW-TEST-${Date.now()}`)
    const paymentId = String(body.paymentId || `youpi_${crypto.randomBytes(6).toString('hex')}`)
    const amount = Number(body.amount) || 1179
    const timestamp = Date.now()
    const deliveryId = `del_${crypto.randomBytes(8).toString('hex')}`

    const webhookSecret =
      process.env.YOUPI_WEBHOOK_SECRET || 'youpi_dev_webhook_secret_32bytes'

    const payloadObj = {
      event: 'payment.success',
      paymentId,
      orderId,
      amount,
      status: 'SUCCESS',
      timestamp,
      deliveryId,
      transactionId: `UPI${Date.now()}`,
      metadata: body.metadata || {
        campaignId: body.campaignId || 1,
        slotId: body.slotId || 1,
        durationDays: body.durationDays || 30,
        subtotal: Math.round(amount / 1.18),
        gstAmount: Math.round(amount - amount / 1.18),
      },
    }

    const rawBody = JSON.stringify(payloadObj)
    const hmac = crypto.createHmac('sha256', webhookSecret)
    hmac.update(rawBody)
    const signature = `sha256=${hmac.digest('hex')}`

    // Process through the official payment service pipeline
    const result = await paymentService.processWebhook(
      rawBody,
      signature,
      timestamp,
      deliveryId,
    )

    return Response.json({
      ok: true,
      message: 'Simulated YouPI-PG payment webhook processed successfully.',
      result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Simulation failed'
    return Response.json({ error: message }, { status: 400 })
  }
}
