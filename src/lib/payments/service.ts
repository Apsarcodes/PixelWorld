import crypto from 'crypto'
import { defaultPaymentProvider } from './youpi-provider'
import type { PaymentProvider, PaymentOrderResult } from './types'

export interface InitiateBookingParams {
  userId: string | number
  organizationId: string | number
  campaignId: string | number
  slotId: string | number
  durationDays: 7 | 30 | 90
  returnUrl: string
  customer?: {
    fullName?: string
    phoneNumber?: string
    email?: string
  }
}

export interface BookingOrderResult {
  orderId: string
  paymentId: string
  checkoutUrl: string
  amount: number
  subtotal: number
  gstAmount: number
  durationDays: number
  expiresAt: string
}

export class PaymentService {
  constructor(private readonly provider: PaymentProvider = defaultPaymentProvider) {}

  /**
   * Calculates tamper-proof pricing strictly on the server
   */
  calculatePrice(durationDays: number, sizeCategory = 'medium'): {
    subtotal: number
    gstAmount: number
    totalAmount: number
  } {
    const basePrices: Record<string, number> = {
      small: 299,
      medium: 999,
      large: 2499,
      premium: 4999,
    }

    const base = basePrices[sizeCategory] || 999
    // Duration multipliers
    const durationMultiplier = durationDays === 7 ? 0.3 : durationDays === 30 ? 1.0 : 2.7
    const subtotal = Math.round(base * durationMultiplier)
    const gstAmount = Math.round(subtotal * 0.18) // 18% GST standard
    const totalAmount = subtotal + gstAmount

    return { subtotal, gstAmount, totalAmount }
  }

  /**
   * Initiates a real booking order with a time-limited lock (15 minutes)
   */
  async initiateBooking(params: InitiateBookingParams): Promise<BookingOrderResult> {
    const { totalAmount, subtotal, gstAmount } = this.calculatePrice(params.durationDays)

    // Generate unique order ID and idempotency key
    const orderId = `PW-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
    const idempotencyKey = `idemp_${orderId}`
    const lockExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min lock

    const orderResult: PaymentOrderResult = await this.provider.createOrder({
      orderId,
      amount: totalAmount,
      currency: 'INR',
      returnUrl: params.returnUrl,
      customer: params.customer,
      idempotencyKey,
      metadata: {
        campaignId: params.campaignId,
        slotId: params.slotId,
        organizationId: params.organizationId,
        userId: params.userId,
        durationDays: params.durationDays,
        subtotal,
        gstAmount,
        lockExpiresAt,
      },
    })

    return {
      orderId,
      paymentId: orderResult.paymentId,
      checkoutUrl: orderResult.checkoutUrl,
      amount: totalAmount,
      subtotal,
      gstAmount,
      durationDays: params.durationDays,
      expiresAt: lockExpiresAt,
    }
  }

  /**
   * Processes verified payment webhooks idempotently
   */
  async processWebhook(
    rawBody: string,
    signatureHeader: string,
    timestampHeader?: string | number | null,
    deliveryId?: string | null,
  ) {
    const verifiedEvent = await this.provider.verifyWebhook(rawBody, {
      signatureHeader,
      timestampHeader,
      deliveryId,
    })

    return {
      success: true,
      orderId: verifiedEvent.orderId,
      paymentId: verifiedEvent.paymentId,
      status: verifiedEvent.status,
      timestamp: verifiedEvent.timestamp,
    }
  }
}

export const paymentService = new PaymentService()
