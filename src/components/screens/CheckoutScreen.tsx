import React, { useState } from 'react'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { Screen, StoredCampaign } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { CreativeImage } from '@/components/common/CreativeImage'

export function CheckoutScreen({
  onNavigate,
  campaign,
}: {
  onNavigate: (s: Screen) => void
  campaign: StoredCampaign | null
}) {
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking'>('upi')

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 sticky top-0 z-50 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl">
        <PwLogo size="sm" />
        <h2 className="font-['Outfit'] font-bold text-lg text-foreground">Checkout</h2>
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
                ['Start Date', '25 July 2025'],
                ['Expiry Date', '24 August 2025'],
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
                  {m === 'upi' ? 'UPI' : m === 'card' ? 'Card' : 'Net Banking'}
                </button>
              ))}
            </div>

            {method === 'upi' && (
              <div>
                <label className="block text-sm font-['Outfit'] font-semibold text-foreground mb-2">
                  UPI ID
                </label>
                <input
                  placeholder="yourname@bank"
                  className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                />
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
          <div className="rounded-2xl border border-black/8 bg-card p-6 sticky top-24">
            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">Order Total</h3>
            <div className="space-y-3 mb-5">
              {[
                ['Space Rental (30 days)', '₹999'],
                ['Creative Processing Fee', '₹49'],
                ['GST (18%)', '₹188'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{k}</span>
                  <span className="text-sm text-foreground font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-black/8 pt-4 flex justify-between items-center mb-6">
              <span className="font-['Outfit'] font-bold text-foreground text-lg">Total</span>
              <span className="font-['Outfit'] font-black text-2xl text-[#6C5FE6]">₹1,236</span>
            </div>

            <PrimaryBtn
              className="w-full justify-center mb-4"
              onClick={() => onNavigate('dashboard')}
            >
              Pay & Submit Ad <ArrowRight size={16} />
            </PrimaryBtn>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-400/80 font-['Inter'] leading-relaxed">
                Your advertisement will be reviewed before it becomes publicly visible. Review
                typically takes 2–4 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

