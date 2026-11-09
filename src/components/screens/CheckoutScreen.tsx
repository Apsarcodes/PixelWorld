'use client'

import React, { useState } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, Loader2, QrCode } from 'lucide-react'
import type { Screen, StoredCampaign } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn } from '@/components/common/UIComponents'
import { CreativeImage } from '@/components/common/CreativeImage'
import { previewAuthorizationHeaders } from '@/lib/session'

export function CheckoutScreen({
  onNavigate,
  campaign,
}: {
  onNavigate: (s: Screen) => void
  campaign: StoredCampaign | null
}) {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<{
    orderId: string
    paymentId: string
    amount: number
  } | null>(null)

  const handlePay = async () => {
    if (loading) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...previewAuthorizationHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          campaignId: campaign?.id || 1,
          slotId: 1,
          durationDays: 30,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment.')
      }

      setPaymentDetails({
        orderId: data.orderId,
        paymentId: data.paymentId,
        amount: data.amount,
      })

      // In development sandbox, simulate immediate or interactive confirmation
      if (data.checkoutUrl) {
        // If sandbox simulated checkout
        setPaymentSuccess(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initiation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-black/8 bg-card p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#00A882]/15 text-[#00A882] flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <h2 className="font-['Outfit'] font-black text-2xl text-foreground">
            Payment & Booking Confirmed!
          </h2>
          <p className="text-sm text-muted-foreground font-['Inter']">
            Your payment for <span className="font-semibold text-foreground">{campaign?.brandName || 'your campaign'}</span> has been processed securely via YouPI-PG.
          </p>
          <div className="rounded-xl border border-black/6 bg-[#EDF0F8] p-4 text-xs font-['JetBrains_Mono'] space-y-1 text-left">
            <div>Order ID: <span className="text-foreground font-semibold">{paymentDetails?.orderId}</span></div>
            <div>Payment ID: <span className="text-foreground font-semibold">{paymentDetails?.paymentId}</span></div>
            <div>Amount Paid: <span className="text-[#00A882] font-semibold">₹{paymentDetails?.amount}</span></div>
            <div>Status: <span className="text-[#00A882] font-semibold">Confirmed / In Moderation</span></div>
          </div>
          <PrimaryBtn className="w-full justify-center" onClick={() => onNavigate('dashboard')}>
            Go to Advertiser Dashboard <ArrowRight size={16} />
          </PrimaryBtn>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 sticky top-0 z-50 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl">
        <PwLogo size="sm" />
        <h2 className="font-['Outfit'] font-bold text-lg text-foreground">Secure Checkout</h2>
        <div className="w-24" />
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10 grid grid-cols-5 gap-8">
        {/* Summary */}
        <div className="col-span-3 space-y-6">
          <div className="rounded-2xl border border-black/8 bg-card p-6">
            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
              Campaign Summary
            </h3>
            {campaign?.creative.url && (
              <div className="relative mb-5 aspect-video overflow-hidden rounded-xl bg-[#EDF0F8]">
                <CreativeImage campaign={campaign} sizes="480px" />
              </div>
            )}
            <div className="space-y-3">
              {[
                ['Location', 'Chennai, Tamil Nadu'],
                ['Ad Space', 'CHN-A-1024'],
                ['Size', '100 × 100 units (Medium)'],
                ['Duration', '30 Days'],
                ['Payment Gateway', 'YouPI-PG (Direct Peer-to-Bank)'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-2 border-b border-black/5 last:border-0"
                >
                  <span className="text-sm text-muted-foreground font-['JetBrains_Mono']">{k}</span>
                  <span className="text-sm text-foreground font-['Outfit'] font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl border border-black/8 bg-card p-6">
            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
              Payment Method
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {(['upi', 'card', 'netbanking'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`p-3 rounded-xl border text-sm font-['Outfit'] font-semibold capitalize transition-all ${method === m ? 'border-[#6C5FE6] bg-[#6C5FE6]/10 text-[#6C5FE6]' : 'border-black/8 text-muted-foreground hover:border-black/12'}`}
                >
                  {m === 'upi' ? 'UPI / QR' : m === 'card' ? 'Card' : 'Net Banking'}
                </button>
              ))}
            </div>

            {method === 'upi' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#6C5FE6]/5 border border-[#6C5FE6]/20 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#6C5FE6]/15 flex items-center justify-center text-[#6C5FE6]">
                    <QrCode size={22} />
                  </div>
                  <div>
                    <div className="text-sm font-['Outfit'] font-bold text-foreground">YouPI-PG Instant Settlement</div>
                    <div className="text-xs text-muted-foreground">Scan dynamic QR or pay via any UPI app with 0% platform fee</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-['Outfit'] font-semibold text-foreground mb-2">
                    UPI ID (Virtual Payment Address)
                  </label>
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okhdfcbank"
                    className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                  />
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3">
                <input
                  placeholder="Card Number"
                  className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="MM / YY"
                    className="bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                  />
                  <input
                    placeholder="CVV"
                    className="bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price summary */}
        <div className="col-span-2">
          <div className="rounded-2xl border border-black/8 bg-card p-6 sticky top-24 space-y-5">
            <h3 className="font-['Outfit'] font-bold text-lg text-foreground">Order Total</h3>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-['Inter'] flex flex-col gap-2">
                <span>{error}</span>
                {error.toLowerCase().includes('sign in') && (
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-[#6C5FE6] font-['Outfit'] font-bold text-xs underline text-left"
                  >
                    Go to Sign In →
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {[
                ['Space Rental (30 days)', '₹999'],
                ['GST (18% Govt. Tax)', '₹180'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{k}</span>
                  <span className="text-sm text-foreground font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-black/8 pt-4 flex justify-between items-center">
              <span className="font-['Outfit'] font-bold text-foreground text-lg">Total</span>
              <span className="font-['Outfit'] font-black text-2xl text-[#6C5FE6]">₹1,179</span>
            </div>

            <PrimaryBtn
              className="w-full justify-center"
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Initializing YouPI…
                </>
              ) : (
                <>
                  Pay with YouPI-PG <ArrowRight size={16} />
                </>
              )}
            </PrimaryBtn>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
              <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-600 font-['Inter'] leading-relaxed">
                Your campaign creative will undergo automated content validation and manual moderation before going live.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
