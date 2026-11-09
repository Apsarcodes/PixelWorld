import { paymentService } from '@/lib/payments/service'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    // Rate limit webhooks to 120 calls/min per IP
    const rateLimit = checkRateLimit(`webhook:${ip}`, { limit: 120, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const rawBody = await request.text()
    const signatureHeader = request.headers.get('x-gateway-signature') || ''
    const timestampHeader = request.headers.get('x-gateway-timestamp')
    const deliveryId = request.headers.get('x-gateway-delivery-id')

    if (!signatureHeader) {
      return Response.json({ error: 'Missing webhook signature header' }, { status: 401 })
    }

    const result = await paymentService.processWebhook(
      rawBody,
      signatureHeader,
      timestampHeader,
      deliveryId,
    )

    return Response.json({ received: true, result }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook verification failed'
    return Response.json({ error: message }, { status: 400 })
  }
}
