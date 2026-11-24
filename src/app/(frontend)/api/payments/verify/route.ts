import { appAuth } from '@/lib/app-auth'
import { defaultPaymentProvider } from '@/lib/payments/youpi-provider'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

export async function GET(request: Request) {
  try {
    const user = await appAuth.payloadUser(request)
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`verify_pay:${user.id}_${ip}`, { limit: 30, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return Response.json({ error: 'paymentId is required' }, { status: 400 })
    }

    // 1. Check local database first
    try {
      const { getPayloadClient } = await import('@/lib/payload')
      const payload = await getPayloadClient()
      const existing = await payload.find({
        collection: 'payments' as any,
        where: { paymentId: { equals: paymentId } },
        limit: 1,
        overrideAccess: true,
      })

      if (existing.docs.length > 0) {
        const doc = existing.docs[0] as any
        if (doc.status === 'success' || doc.status === 'completed') {
          return Response.json({ status: 'success', verification: doc })
        }
      }
    } catch {
      // Continue to provider check
    }

    const verification = await defaultPaymentProvider.verifyPayment(paymentId)
    return Response.json({ status: verification.status, verification })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment verification failed'
    return Response.json({ error: message }, { status: 400 })
  }
}
