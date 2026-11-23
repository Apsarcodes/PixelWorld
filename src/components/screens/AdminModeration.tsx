import React, { useState, useEffect } from 'react'
import { AlertTriangle, ArrowLeft, Check, Edit2, Shield, X, Loader2 } from 'lucide-react'
import type { Screen, StoredCampaign } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { CreativeImage } from '@/components/common/CreativeImage'
import { previewAuthorizationHeaders } from '@/lib/session'

export function AdminModeration({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [campaigns, setCampaigns] = useState<StoredCampaign[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [rejectReason, setRejectReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  )

  const fetchQueue = () => {
    setIsLoading(true)
    fetch('/api/admin/moderation', {
      credentials: 'include',
      headers: previewAuthorizationHeaders(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.campaigns) {
          setCampaigns(data.campaigns)
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchQueue()
  }, [])

  const currentCampaign = campaigns[selectedIndex] ?? null

  const handleModeration = async (modAction: 'approve' | 'reject' | 'flag') => {
    if (!currentCampaign) return
    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...previewAuthorizationHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          campaignId: currentCampaign.id,
          action: modAction,
          reason: modAction === 'reject' ? rejectReason : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')

      setStatusMessage({
        type: 'success',
        text: `Campaign "${currentCampaign.name}" ${
          modAction === 'approve'
            ? 'approved & published live to the canvas'
            : modAction === 'reject'
              ? 'rejected'
              : 'flagged for changes'
        }.`,
      })

      setTimeout(() => {
        setStatusMessage(null)
        setRejectReason('')
        fetchQueue()
      }, 1500)
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Moderation failed',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <header className="flex items-center gap-4 px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] cursor-pointer"
        >
          <ArrowLeft size={16} /> Admin Dashboard
        </button>
        <div className="w-px h-5 bg-black/10" />
        <h1 className="font-['Outfit'] font-bold text-lg text-foreground">Ad Moderation Queue</h1>
        <div className="ml-auto flex items-center gap-3">
          <Badge color={campaigns.length > 0 ? 'amber' : 'teal'}>
            {campaigns.length} {campaigns.length === 1 ? 'Pending' : 'Pending'}
          </Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {isLoading ? (
          <div className="py-24 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-['Outfit']">Loading moderation queue...</span>
          </div>
        ) : !currentCampaign ? (
          <div className="max-w-md mx-auto py-24 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#00A882]/15 text-[#00A882] flex items-center justify-center mx-auto">
              <Check size={32} />
            </div>
            <h2 className="font-['Outfit'] font-black text-2xl text-foreground">
              Queue is 100% Clean
            </h2>
            <p className="text-sm text-muted-foreground font-['Inter']">
              There are currently no ad campaigns awaiting review. All submitted campaigns are active.
            </p>
            <div className="pt-2">
              <PrimaryBtn onClick={() => onNavigate('admin')}>
                Back to Admin Dashboard
              </PrimaryBtn>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8">
            {/* Creative preview */}
            <div>
              <div className="rounded-2xl border border-black/8 bg-card overflow-hidden mb-4">
                <div className="aspect-video bg-[#EDF0F8] relative">
                  <CreativeImage campaign={currentCampaign} sizes="(max-width: 1200px) 50vw, 600px" />
                </div>
              </div>

              <div className="rounded-2xl border border-black/8 bg-card p-5">
                <div className="font-['Outfit'] font-semibold text-sm text-foreground mb-3">
                  Creative Specs
                </div>
                <div className="space-y-2">
                  {[
                    ['Campaign ID', `#${currentCampaign.id}`],
                    ['Brand', currentCampaign.brandName],
                    ['Dimensions', `${currentCampaign.width} × ${currentCampaign.height} px`],
                    ['Call to Action', currentCampaign.callToAction || 'Visit Website'],
                    ['Status', currentCampaign.status],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">{k}</span>
                      <span className="text-xs text-foreground font-['Outfit'] font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Review actions panel */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-black/8 bg-card p-6">
                <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-4">
                  Review & Decision
                </h3>

                {statusMessage && (
                  <div
                    className={`p-3 rounded-xl mb-4 text-xs font-['Outfit'] font-semibold flex items-center gap-2 ${
                      statusMessage.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-xs font-['Outfit'] font-semibold text-muted-foreground block mb-1">
                      Ad Headline
                    </label>
                    <div className="text-sm font-['Outfit'] font-bold text-foreground">
                      {currentCampaign.headline || currentCampaign.name}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-['Outfit'] font-semibold text-muted-foreground block mb-1">
                      Ad Description
                    </label>
                    <div className="text-xs font-['Inter'] text-muted-foreground leading-relaxed">
                      {currentCampaign.description || 'No description provided.'}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-xs font-['Outfit'] font-semibold text-muted-foreground block mb-1.5">
                    Feedback / Rejection Reason (Required if rejecting)
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Please use a higher resolution creative image"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-black/2 text-xs font-['Inter'] outline-none focus:border-[#6C5FE6]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleModeration('approve')}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-xl bg-[#00A882] hover:bg-[#008f6e] text-white text-xs font-['Outfit'] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Check size={16} /> Approve & Publish Live
                  </button>
                  <button
                    onClick={() => handleModeration('reject')}
                    disabled={isSubmitting || !rejectReason.trim()}
                    className="flex-1 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-['Outfit'] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <X size={16} /> Reject with Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
