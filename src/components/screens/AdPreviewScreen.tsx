import React, { useState } from 'react'
import { ArrowRight, Edit2, ExternalLink, Phone } from 'lucide-react'
import type { Screen, StoredCampaign } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn } from '@/components/common/UIComponents'
import { CreativeImage } from '@/components/common/CreativeImage'

export function AdPreviewScreen({
  onBack,
  onNavigate,
  campaign,
}: {
  onBack: () => void
  onNavigate: (s: Screen) => void
  campaign: StoredCampaign
}) {
  const [mode, setMode] = useState<'canvas' | 'hover' | 'detail'>('canvas')

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 sticky top-0 z-50 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl">
        <PwLogo size="sm" />
        <h2 className="font-['Outfit'] font-bold text-lg text-foreground">Ad Preview</h2>
        <div className="flex gap-3">
          <GhostBtn small onClick={onBack}>
            <Edit2 size={14} /> Back to Edit
          </GhostBtn>
          <PrimaryBtn small onClick={() => onNavigate('checkout')}>
            Continue to Payment <ArrowRight size={14} />
          </PrimaryBtn>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex gap-2 mb-8">
          {(['canvas', 'hover', 'detail'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-xl text-sm font-['Outfit'] font-semibold capitalize transition-all ${mode === m ? 'bg-[#6C5FE6] text-white' : 'bg-black/5 text-muted-foreground hover:text-foreground'}`}
            >
              {m === 'canvas' ? 'Canvas View' : m === 'hover' ? 'Hover View' : 'Ad Detail View'}
            </button>
          ))}
        </div>

        {mode === 'canvas' && (
          <div className="rounded-3xl border border-black/8 overflow-hidden bg-[#ECF0FA] p-6 min-h-[400px] relative canvas-grid-preview">
            <style>{`.canvas-grid-preview { background-image: linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px); background-size: 80px 80px; }`}</style>
            <div className="flex items-center justify-center gap-4 h-72">
              {/* surrounding tiles */}
              <div className="w-24 h-24 rounded-lg bg-[#E23744] opacity-50" />
              <div className="w-36 h-36 rounded-xl overflow-hidden relative shadow-[0_0_30px_rgba(124,111,247,0.4)] ring-2 ring-[#6C5FE6]">
                <CreativeImage campaign={campaign} sizes="144px" />
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-[#6C5FE6] rounded text-white text-xs font-['JetBrains_Mono']">
                  YOUR AD
                </div>
              </div>
              <div className="w-20 h-20 rounded-lg bg-[#FF6B35] opacity-50" />
            </div>
            <p className="text-center text-xs text-muted-foreground font-['JetBrains_Mono'] mt-2">
              Your ad appears on the Chennai canvas alongside other advertisers
            </p>
          </div>
        )}

        {mode === 'hover' && (
          <div className="rounded-3xl border border-black/8 overflow-hidden bg-[#ECF0FA] p-6 flex items-center justify-center min-h-[400px]">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-xl">
              <CreativeImage campaign={campaign} sizes="192px" />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4">
                <div className="font-['Outfit'] font-bold text-white text-base text-center">
                  {campaign.brandName}
                </div>
                <div className="font-['Inter'] text-white/75 text-xs text-center">
                  {campaign.headline}
                </div>
                <div className="mt-1 px-4 py-1.5 bg-[#6C5FE6] rounded-lg text-white text-xs font-['Outfit'] font-bold">
                  View Ad
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'detail' && (
          <div className="max-w-md mx-auto rounded-3xl border border-black/8 bg-card overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-[#6C5FE6] to-[#4C3FBF]">
              <CreativeImage campaign={campaign} sizes="448px" />
            </div>
            <div className="p-6">
              <h3 className="font-['Outfit'] font-bold text-xl text-foreground mb-1">
                {campaign.brandName}
              </h3>
              <p className="text-sm text-muted-foreground font-['Inter'] mb-4">
                {campaign.headline} — {campaign.description || 'Tap to learn more.'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#6C5FE6] text-white text-sm font-['Outfit'] font-semibold">
                  <ExternalLink size={14} /> Visit Website
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-black/8 text-sm font-['Outfit'] text-foreground">
                  <Phone size={14} /> Call Now
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

