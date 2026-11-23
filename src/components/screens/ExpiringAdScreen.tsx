import React from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { Screen, StoredCampaign } from '@/types/pixelworld'
import { PrimaryBtn, GhostBtn } from '@/components/common/UIComponents'
import { CreativeImage } from '@/components/common/CreativeImage'

export function ExpiringAdScreen({
  onNavigate,
  campaigns = [],
}: {
  onNavigate: (s: Screen) => void
  campaigns?: StoredCampaign[]
}) {
  const expiringCampaign = campaigns.find((c) => {
    if (!c.endsAt) return false
    const diffDays = Math.ceil((new Date(c.endsAt).getTime() - Date.now()) / 86400000)
    return diffDays > 0 && diffDays <= 7
  })

  if (!expiringCampaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-3xl border border-black/8 bg-card p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-[#00A882]/15 text-[#00A882] flex items-center justify-center mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h2 className="font-['Outfit'] font-black text-2xl text-foreground">
              All Campaigns Active
            </h2>
            <p className="text-sm text-muted-foreground font-['Inter'] mt-1">
              You currently have no ad spaces expiring soon. All your active ad spaces are running smoothly.
            </p>
          </div>
          <div className="pt-2">
            <PrimaryBtn className="w-full justify-center" onClick={() => onNavigate('dashboard')}>
              Back to Dashboard
            </PrimaryBtn>
          </div>
        </div>
      </div>
    )
  }

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(expiringCampaign.endsAt).getTime() - Date.now()) / 86400000),
  )
  const expiryDateFormatted = new Date(expiringCampaign.endsAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] mb-8 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle size={22} className="text-amber-400" />
            </div>
            <div>
              <div className="font-['Outfit'] font-black text-xl text-foreground">
                Your ad space is expiring soon!
              </div>
              <div className="text-sm text-amber-500 font-['Outfit'] font-semibold">
                Your ad space expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/8 bg-card p-6 mb-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#EDF0F8] relative shrink-0">
                <CreativeImage campaign={expiringCampaign} sizes="64px" />
              </div>
              <div>
                <div className="font-['Outfit'] font-bold text-lg text-foreground">
                  {expiringCampaign.name}
                </div>
                <div className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                  {expiringCampaign.brandName} · {expiringCampaign.width} × {expiringCampaign.height}px
                </div>
                <div className="text-sm text-amber-500 font-['Outfit'] font-semibold mt-1">
                  Expires: {expiryDateFormatted}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Views', value: '12.4K', color: '#6C5FE6' },
                { label: 'Interactions', value: '840', color: '#00A882' },
                { label: 'CTA Clicks', value: '310', color: '#EC4899' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-black/6 bg-[#F5F7FC] p-4 text-center"
                >
                  <div className="text-xl font-['Outfit'] font-black" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <PrimaryBtn className="flex-1 justify-center" onClick={() => onNavigate('checkout')}>
              Renew for 30 Days — ₹999 <ArrowRight size={16} />
            </PrimaryBtn>
            <GhostBtn className="flex-1 justify-center" onClick={() => onNavigate('dashboard')}>
              Let It Expire
            </GhostBtn>
          </div>
        </div>
      </div>
    </div>
  )
}
