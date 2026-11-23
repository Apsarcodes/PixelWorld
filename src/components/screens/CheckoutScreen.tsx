'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  QrCode,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react'
import type { Screen, StoredCampaign } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn } from '@/components/common/UIComponents'
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
  const [showUpiModal, setShowUpiModal] = useState(false)
  const [countdown, setCountdown] = useState(15 * 60) // 15-minute lock timer

  const [paymentDetails, setPaymentDetails] = useState<{
    orderId: string
    paymentId: string
    amount: number
    subtotal?: number
    gstAmount?: number
    checkoutUrl?: string
    upiIntentUrl?: string
    upiQrString?: string
  } | null>(null)

  // Countdown timer for 15-minute reservation lock
  useEffect(() => {
    if (!showUpiModal || paymentSuccess) return
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [showUpiModal, paymentSuccess])

  // Polling for real-time payment confirmation via YouPI-PG
  useEffect(() => {
    if (!showUpiModal || paymentSuccess || !paymentDetails?.paymentId) return

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payments/verify?paymentId=${paymentDetails.paymentId}`, {
          headers: previewAuthorizationHeaders(),
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'success') {
            setShowUpiModal(false)
            setPaymentSuccess(true)
          }
        }
      } catch {
        // Continue polling
      }
    }, 3500)

    return () => clearInterval(pollInterval)
  }, [showUpiModal, paymentSuccess, paymentDetails])

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`
  }

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
        subtotal: data.subtotal,
        gstAmount: data.gstAmount,
        checkoutUrl: data.checkoutUrl,
        upiIntentUrl: data.upiIntentUrl,
        upiQrString: data.upiQrString,
      })

      setShowUpiModal(true)
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
            Your payment for{' '}
            <span className="font-semibold text-foreground">
              {campaign?.brandName || 'your campaign'}
            </span>{' '}
            has been processed securely via YouPI-PG.
          </p>
          <div className="rounded-xl border border-black/6 bg-[#EDF0F8] p-4 text-xs font-['JetBrains_Mono'] space-y-1.5 text-left">
            <div>
              Order ID: <span className="text-foreground font-semibold">{paymentDetails?.orderId}</span>
            </div>
            <div>
              Payment ID: <span className="text-foreground font-semibold">{paymentDetails?.paymentId}</span>
            </div>
            <div>
              Amount Paid: <span className="text-[#00A882] font-semibold">₹{paymentDetails?.amount?.toLocaleString()} (incl. 18% GST)</span>
            </div>
            <div>
              Status: <span className="text-[#00A882] font-semibold">Confirmed / In Moderation</span>
            </div>
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
                  className={`p-3 rounded-xl border text-sm font-['Outfit'] font-semibold capitalize transition-all ${
                    method === m
                      ? 'border-[#6C5FE6] bg-[#6C5FE6]/10 text-[#6C5FE6]'
                      : 'border-black/8 text-muted-foreground hover:border-black/12'
                  }`}
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
                    <div className="text-sm font-['Outfit'] font-bold text-foreground">
                      YouPI-PG Instant Settlement
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Scan dynamic UPI QR or pay via GPay, PhonePe, Paytm with 0% platform fees
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-['Outfit'] font-semibold text-foreground mb-2">
                    UPI ID / VPA (Optional)
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
                  <Loader2 size={16} className="animate-spin" /> Initializing YouPI-PG…
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

      {/* YouPI-PG Interactive UPI Modal */}
      {showUpiModal && paymentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-black/10 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowUpiModal(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground p-1 rounded-lg"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#6C5FE6]/10 flex items-center justify-center text-[#6C5FE6]">
                <QrCode size={22} />
              </div>
              <div>
                <h3 className="font-['Outfit'] font-bold text-lg text-foreground">
                  YouPI-PG — Pay via UPI
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-['JetBrains_Mono']">
                  <span>Order: {paymentDetails.orderId}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-600 font-semibold">
                    <Clock size={12} /> {formatTimer(countdown)}
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic UPI QR Code */}
            <div className="my-5 p-4 rounded-2xl bg-[#F8FAFC] border border-black/8 flex flex-col items-center justify-center text-center">
              <div className="w-48 h-48 bg-white p-3 rounded-xl shadow-sm border border-black/5 flex items-center justify-center">
                {/* Standard dynamic QR code service rendering the UPI Intent URL */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    paymentDetails.upiQrString || paymentDetails.upiIntentUrl || 'upi://pay'
                  )}`}
                  alt="Scan to Pay via UPI"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-xs text-muted-foreground font-['Inter'] mt-3">
                Scan with <span className="font-semibold text-foreground">GPay, PhonePe, Paytm, BHIM</span> or your mobile bank app
              </p>
              <div className="mt-2 text-lg font-black font-['Outfit'] text-[#6C5FE6]">
                ₹{paymentDetails.amount.toLocaleString()}
              </div>
            </div>

            {/* Direct Mobile UPI Intent Buttons */}
            <div className="space-y-2 mb-5">
              <div className="text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1">
                Or Tap to Pay directly in your UPI App:
              </div>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={paymentDetails.upiIntentUrl || '#'}
                  className="p-2.5 rounded-xl border border-black/8 bg-card hover:bg-slate-50 text-center flex flex-col items-center gap-1 transition-all"
                >
                  <Smartphone size={16} className="text-[#4285F4]" />
                  <span className="text-[11px] font-['Outfit'] font-bold text-foreground">GPay</span>
                </a>
                <a
                  href={paymentDetails.upiIntentUrl || '#'}
                  className="p-2.5 rounded-xl border border-black/8 bg-card hover:bg-slate-50 text-center flex flex-col items-center gap-1 transition-all"
                >
                  <Smartphone size={16} className="text-[#5F259F]" />
                  <span className="text-[11px] font-['Outfit'] font-bold text-foreground">PhonePe</span>
                </a>
                <a
                  href={paymentDetails.upiIntentUrl || '#'}
                  className="p-2.5 rounded-xl border border-black/8 bg-card hover:bg-slate-50 text-center flex flex-col items-center gap-1 transition-all"
                >
                  <Smartphone size={16} className="text-[#00BAF2]" />
                  <span className="text-[11px] font-['Outfit'] font-bold text-foreground">Paytm</span>
                </a>
              </div>
            </div>

            {/* Status indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-['Inter'] py-2">
              <Loader2 size={13} className="animate-spin text-[#6C5FE6]" />
              <span>Awaiting payment from your UPI app...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
