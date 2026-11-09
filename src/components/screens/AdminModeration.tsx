import React, { useState } from 'react'
import { AlertTriangle, ArrowLeft, Check, Edit2, Shield, X } from 'lucide-react'
import type { Screen } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'

export function AdminModeration({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [action, setAction] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <header className="flex items-center gap-4 px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit']"
        >
          <ArrowLeft size={16} /> Admin Dashboard
        </button>
        <div className="w-px h-5 bg-white/10" />
        <h1 className="font-['Outfit'] font-bold text-lg text-foreground">Ad Moderation</h1>
        <div className="ml-auto flex items-center gap-3">
          <Badge color="amber">23 Pending</Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-2 gap-8">
        {/* Creative preview */}
        <div>
          <div className="rounded-2xl border border-black/8 bg-card overflow-hidden mb-4">
            <div className="aspect-video bg-gradient-to-br from-[#FF6B35] to-[#E23744] flex flex-col items-center justify-center gap-3 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />
              <div className="text-5xl">🍕</div>
              <div className="font-['Outfit'] font-black text-white text-3xl">
                Chennai Pizza Co.
              </div>
              <div className="font-['Inter'] text-white/80 text-base">
                Best pizza in the city · Free delivery
              </div>
              <div className="px-6 py-2.5 bg-white rounded-xl text-[#FF6B35] font-['Outfit'] font-bold">
                Order Now
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-black/8 bg-card p-5">
            <div className="font-['Outfit'] font-semibold text-sm text-foreground mb-3">
              Ad Creative Details
            </div>
            <div className="space-y-2">
              {[
                ['Format', 'Static Image · JPG · 1200×628px'],
                ['File Size', '842 KB'],
                ['Color Profile', 'sRGB'],
                ['Destination URL', 'https://chennaipizzaco.in/order'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">{k}</span>
                  <span className="text-xs text-foreground font-['Outfit']">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/8 bg-card p-6">
            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
              Ad Information
            </h3>
            <div className="space-y-2.5">
              {[
                ['Advertiser', 'Priya Subramanian'],
                ['Business Name', 'Chennai Pizza Co.'],
                ['Campaign', 'Weekend Special Offer'],
                ['Canvas', 'Chennai Main Canvas · Zone B'],
                ['City', 'Chennai, Tamil Nadu'],
                ['Rental Duration', '30 Days'],
                ['Start Date', '25 July 2025'],
                ['Expiry Date', '24 August 2025'],
                ['CTA Type', 'Order Now → chennaipizzaco.in'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-1.5 border-b border-black/4 last:border-0"
                >
                  <span className="text-sm text-muted-foreground font-['JetBrains_Mono']">{k}</span>
                  <span className="text-sm text-foreground font-['Outfit'] font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl border border-black/8 bg-card p-6">
            <h3 className="font-['Outfit'] font-bold text-base text-foreground mb-4">
              Moderation Checklist
            </h3>
            {[
              {
                label: 'Creative Quality',
                status: 'pass',
                note: 'Clear, high-res image meets minimum requirements',
              },
              { label: 'Content Policy', status: 'pass', note: 'No prohibited content detected' },
              {
                label: 'Destination URL',
                status: 'pass',
                note: 'URL resolves and loads correctly',
              },
              {
                label: 'Business Information',
                status: 'review',
                note: 'GST number not provided — verify manually',
              },
            ].map(({ label, status, note }) => (
              <div
                key={label}
                className="flex items-start gap-3 py-2.5 border-b border-black/4 last:border-0"
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${status === 'pass' ? 'bg-[#00A882]/15' : 'bg-amber-500/15'}`}
                >
                  {status === 'pass' ? (
                    <Check size={11} className="text-[#00A882]" />
                  ) : (
                    <AlertTriangle size={10} className="text-amber-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-['Outfit'] font-semibold text-foreground">
                    {label}
                  </div>
                  <div className="text-xs text-muted-foreground font-['Inter'] mt-0.5">{note}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {action === 'reject' ? (
            <div className="rounded-2xl border border-[#E03E4D]/20 bg-[#E03E4D]/5 p-5">
              <div className="font-['Outfit'] font-semibold text-sm text-foreground mb-3">
                Rejection Reason (required)
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this ad is being rejected..."
                rows={3}
                className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#E03E4D]/40 resize-none mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 py-2.5 rounded-xl border border-black/8 text-sm font-['Outfit'] text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-[#E03E4D] text-white text-sm font-['Outfit'] font-semibold hover:bg-[#E03E4D] transition-all">
                  Send Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00A882] text-[#07080F] font-['Outfit'] font-bold text-sm hover:bg-[#00B891] transition-all"
              >
                <Check size={16} /> Approve Ad
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#6C5FE6]/30 text-[#6C5FE6] font-['Outfit'] font-bold text-sm hover:bg-[#6C5FE6]/10 transition-all">
                <Edit2 size={14} /> Request Changes
              </button>
              <button
                onClick={() => setAction('reject')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E03E4D]/30 text-[#E03E4D] font-['Outfit'] font-bold text-sm hover:bg-[#E03E4D]/10 transition-all"
              >
                <X size={16} /> Reject Ad
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-black/8 text-muted-foreground font-['Outfit'] font-bold text-sm hover:text-foreground hover:border-black/12 transition-all">
                <Shield size={14} /> Suspend Advertiser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

