/**
 * Payment Service Abstraction Types
 * Decoupled interface allowing YouPI-PG or future providers to be swapped seamlessly.
 */

export type PaymentStatus =
  | 'created'
  | 'pending'
  | 'success'
  | 'failed'
  | 'expired'
  | 'refunded'

export interface CustomerDetails {
  phoneNumber?: string
  fullName?: string
  email?: string
}

export interface CreatePaymentOrderParams {
  orderId: string
  amount: number // in INR (Rupees)
  currency?: string
  returnUrl: string
  customer?: CustomerDetails
  metadata?: Record<string, unknown>
  idempotencyKey?: string
}

export interface PaymentOrderResult {
  paymentId: string
  orderId: string
  amount: number
  amountPaise: number
  currency: string
  status: PaymentStatus
  checkoutUrl: string
}

export interface PaymentVerificationResult {
  paymentId: string
  orderId: string
  amount: number
  amountPaise: number
  currency: string
  status: PaymentStatus
  method?: string
  completedAt?: string
  bankRefNumber?: string
  raw?: Record<string, unknown>
}

export interface WebhookVerificationOptions {
  signatureHeader: string
  timestampHeader?: string | number | null
  deliveryId?: string | null
  toleranceMs?: number
}

export interface VerifiedWebhookEvent {
  event: 'payment.success' | 'payment.failed' | 'payment.expired' | string
  paymentId: string
  orderId: string
  amount: number
  status: PaymentStatus
  timestamp: number
  deliveryId?: string
  transactionId?: string
  metadata?: Record<string, unknown>
  raw: Record<string, unknown>
}

export interface PaymentProvider {
  readonly name: string
  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>
  verifyPayment(paymentId: string): Promise<PaymentVerificationResult>
  verifyWebhook(
    rawBody: string,
    options: WebhookVerificationOptions,
  ): Promise<VerifiedWebhookEvent>
}
