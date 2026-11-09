import crypto from 'crypto'
import type {
  PaymentProvider,
  CreatePaymentOrderParams,
  PaymentOrderResult,
  PaymentVerificationResult,
  WebhookVerificationOptions,
  VerifiedWebhookEvent,
  PaymentStatus,
} from './types'

export interface YoupiProviderConfig {
  apiUrl?: string
  merchantId?: string
  apiKey?: string
  webhookSecret?: string
}

export class YoupiPaymentProvider implements PaymentProvider {
  readonly name = 'youpi-pg'
  private readonly apiUrl: string
  private readonly merchantId: string
  private readonly apiKey: string
  private readonly webhookSecret: string

  constructor(config: YoupiProviderConfig = {}) {
    let url =
      config.apiUrl ||
      process.env.YOUPI_API_URL ||
      process.env.PAYMENT_API_URL ||
      'http://localhost:6100'
    while (url.endsWith('/')) url = url.slice(0, -1)
    this.apiUrl = url
    this.merchantId = config.merchantId || process.env.YOUPI_MERCHANT_ID || 'pixelworld_dev_merchant'
    this.apiKey = config.apiKey || process.env.YOUPI_API_KEY || 'youpi_dev_api_key'
    this.webhookSecret =
      config.webhookSecret || process.env.YOUPI_WEBHOOK_SECRET || 'youpi_dev_webhook_secret_32bytes'
  }

  /**
   * Dispatches order creation to YouPI-PG
   */
  async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    const url = `${this.apiUrl}/api/v1/payments`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Merchant-Id': this.merchantId,
      'X-Merchant-Key': this.apiKey || this.webhookSecret,
    }

    if (params.idempotencyKey) {
      headers['Idempotency-Key'] = params.idempotencyKey
    }

    const payload = {
      orderId: params.orderId,
      amount: params.amount,
      currency: params.currency || 'INR',
      returnUrl: params.returnUrl,
      customer: params.customer,
      metadata: params.metadata,
      autoActivate: true,
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000), // 5s timeout
      })

      if (res.ok) {
        const data = await res.json()
        return {
          paymentId: data.paymentId || data.id,
          orderId: data.orderId || params.orderId,
          amount: Number(data.amount) || params.amount,
          amountPaise: Number(data.amountPaise) || params.amount * 100,
          currency: data.currency || 'INR',
          status: this.mapStatus(data.status),
          checkoutUrl: data.checkoutUrl || `${this.apiUrl}/checkout/${data.paymentId}`,
        }
      }
    } catch {
      // In development, if YouPI-PG daemon is not actively running at localhost:6100,
      // generate a standard development sandbox checkout simulation.
      if (process.env.NODE_ENV !== 'production') {
        const simulatedPaymentId = `youpi_${crypto.randomBytes(8).toString('hex')}`
        return {
          paymentId: simulatedPaymentId,
          orderId: params.orderId,
          amount: params.amount,
          amountPaise: Math.round(params.amount * 100),
          currency: params.currency || 'INR',
          status: 'pending',
          checkoutUrl: `${params.returnUrl}${params.returnUrl.includes('?') ? '&' : '?'}paymentId=${simulatedPaymentId}&orderId=${params.orderId}&sandbox=1`,
        }
      }
      throw new Error(`YouPI-PG server connection failed at ${this.apiUrl}`)
    }

    throw new Error('YouPI-PG returned an unexpected response')
  }

  /**
   * Queries payment status directly from YouPI-PG
   */
  async verifyPayment(paymentId: string): Promise<PaymentVerificationResult> {
    const url = `${this.apiUrl}/api/v1/payments/${paymentId}`
    const headers: Record<string, string> = {
      'X-Merchant-Key': this.apiKey || this.webhookSecret,
    }

    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        const data = await res.json()
        return {
          paymentId: data.paymentId || paymentId,
          orderId: data.orderId,
          amount: Number(data.amount),
          amountPaise: Number(data.amountPaise),
          currency: data.currency || 'INR',
          status: this.mapStatus(data.status),
          method: data.method,
          completedAt: data.completedAt,
          bankRefNumber: data.bankRefNumber || data.rrn,
          raw: data,
        }
      }
    } catch {
      // In development mode, sandbox verification allows testing payment lifecycle
      if (process.env.NODE_ENV !== 'production' && paymentId.startsWith('youpi_')) {
        return {
          paymentId,
          orderId: `ORDER-${paymentId}`,
          amount: 999,
          amountPaise: 99900,
          currency: 'INR',
          status: 'success',
          method: 'UPI',
          completedAt: new Date().toISOString(),
          bankRefNumber: `SIM${Date.now()}`,
        }
      }
    }

    throw new Error(`Failed to query payment status for payment ID: ${paymentId}`)
  }

  /**
   * Verifies incoming webhook authenticity using HMAC-SHA256 signature
   * and timestamp freshness window
   */
  async verifyWebhook(
    rawBody: string,
    options: WebhookVerificationOptions,
  ): Promise<VerifiedWebhookEvent> {
    const { signatureHeader, timestampHeader, deliveryId, toleranceMs = 2 * 60 * 60 * 1000 } = options

    if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
      throw new Error('Invalid signature header format. Expected sha256=...')
    }

    const expectedSignature = signatureHeader.replace('sha256=', '')

    // Check timestamp freshness if supplied
    if (timestampHeader) {
      const tsNum = Number(timestampHeader)
      if (!Number.isFinite(tsNum) || Math.abs(Date.now() - tsNum) > toleranceMs) {
        throw new Error('Webhook timestamp is outside tolerance window (possible replay attack).')
      }
    }

    // Verify HMAC-SHA256
    const matchesRaw = this.verifyHmac(rawBody, this.webhookSecret, expectedSignature)
    const matchesTimestamped =
      timestampHeader !== null &&
      this.verifyHmac(`${timestampHeader}.${rawBody}`, this.webhookSecret, expectedSignature)

    if (!matchesRaw && !matchesTimestamped) {
      throw new Error('Webhook HMAC signature mismatch.')
    }

    const parsed = JSON.parse(rawBody)

    // Verify deliveryId deduplication if supplied
    if (deliveryId && parsed.deliveryId && String(deliveryId) !== String(parsed.deliveryId)) {
      throw new Error('Webhook deliveryId header mismatch.')
    }

    return {
      event: parsed.event || 'payment.success',
      paymentId: parsed.paymentId || parsed.id,
      orderId: parsed.orderId,
      amount: Number(parsed.amount),
      status: this.mapStatus(parsed.status),
      timestamp: Number(parsed.timestamp) || Date.now(),
      deliveryId: parsed.deliveryId || deliveryId || undefined,
      raw: parsed,
    }
  }

  private verifyHmac(payload: string, secret: string, expectedHash: string): boolean {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(payload)
    const calculatedHash = hmac.digest('hex')

    if (calculatedHash.length !== expectedHash.length) return false
    return crypto.timingSafeEqual(Buffer.from(calculatedHash), Buffer.from(expectedHash))
  }

  private mapStatus(status: unknown): PaymentStatus {
    const s = String(status || '').toUpperCase()
    if (s === 'SUCCESS' || s === 'PAID' || s === 'COMPLETED') return 'success'
    if (s === 'FAILED' || s === 'ERROR') return 'failed'
    if (s === 'EXPIRED') return 'expired'
    if (s === 'REFUNDED') return 'refunded'
    return 'pending'
  }
}

export const defaultPaymentProvider = new YoupiPaymentProvider()
