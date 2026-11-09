import React, { useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, Clock } from 'lucide-react'
import type { Screen } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'

export function ExpiringAdScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] mb-8"
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
              <div className="text-sm text-amber-400 font-['Outfit'] font-semibold">
                Your Chennai ad space expires in 3 days
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/8 bg-card p-6 mb-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center text-3xl">
                🪔
              </div>
              <div>
                <div className="font-['Outfit'] font-bold text-lg text-foreground">
                  Festival Offer Campaign
                </div>
                <div className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                  CHN-A-0842 · Chennai Main Canvas
                </div>
                <div className="text-sm text-amber-400 font-['Outfit'] font-semibold mt-1">
                  Expires: 28 July 2025
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Views', value: '128,440', color: '#6C5FE6' },
                { label: 'Interactions', value: '9,821', color: '#00A882' },
                { label: 'CTA Clicks', value: '3,450', color: '#EC4899' },
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

        <div className="rounded-2xl border border-black/8 bg-card p-5">
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground font-['Inter'] leading-relaxed">
              If you don&#39;t renew, your ad will be removed and the space will become available to
              other advertisers after the{' '}
              <strong className="text-foreground">48-hour grace period</strong>. You can still
              reactivate it within this window if you change your mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

