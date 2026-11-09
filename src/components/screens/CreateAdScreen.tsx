import React, { useEffect, useState, useRef } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, Calendar, Check, ChevronDown, ChevronLeft, Clock, ExternalLink, MapPin, Minus, Plus, Sparkles, Upload, X } from 'lucide-react'
import type { Screen, CanvasTile, StoredCampaign } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { AdPreviewScreen } from '@/components/screens/AdPreviewScreen'
import { CheckoutScreen } from '@/components/screens/CheckoutScreen'
import { previewAuthorizationHeaders } from '@/lib/session'

export function CreateAdScreen({
  onBack,
  onNavigate,
  onCampaignSaved,
  initialCampaign,
}: {
  onBack: () => void
  onNavigate: (s: Screen) => void
  onCampaignSaved: (campaign: StoredCampaign) => void
  initialCampaign?: StoredCampaign | null
}) {
  const [step, setStep] = useState(initialCampaign ? 2 : 1)
  const [ctaType, setCtaType] = useState(initialCampaign?.callToAction ?? 'Visit Website')
  const [adName, setAdName] = useState(initialCampaign?.name ?? '')
  const [brandName, setBrandName] = useState(initialCampaign?.brandName ?? '')
  const [headline, setHeadline] = useState(initialCampaign?.headline ?? '')
  const [desc, setDesc] = useState(initialCampaign?.description ?? '')
  // Space config state
  const [adWidth, setAdWidth] = useState(initialCampaign?.width ?? 200)
  const [adHeight, setAdHeight] = useState(initialCampaign?.height ?? 200)
  const today = new Date().toISOString().split('T')[0]
  const defaultTo = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  const [dateFrom, setDateFrom] = useState(initialCampaign?.startsAt?.split('T')[0] ?? today)
  const [dateTo, setDateTo] = useState(
    initialCampaign?.endsAt?.split('T')[0] ??
      new Date(Date.now() + 86400000).toISOString().split('T')[0],
  )
  const [durationPreset, setDurationPreset] = useState<string>('1')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [savedCampaign, setSavedCampaign] = useState<StoredCampaign | null>(initialCampaign ?? null)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const DURATION_PRESETS = [
    { label: '1 Day', value: '1', days: 1 },
    { label: '3 Days', value: '3', days: 3 },
    { label: '7 Days', value: '7', days: 7 },
    { label: '14 Days', value: '14', days: 14 },
    { label: '1 Month', value: '30', days: 30 },
    { label: '3 Months', value: '90', days: 90 },
    { label: 'Custom', value: 'custom', days: 0 },
  ]

  const applyPreset = (val: string) => {
    setDurationPreset(val)
    if (val === 'custom') return
    const d = parseInt(val, 10)
    const from = dateFrom || today
    const toDate = new Date(new Date(from).getTime() + d * 86400000)
    setDateTo(toDate.toISOString().split('T')[0])
  }

  const handleDateFromChange = (val: string) => {
    setDateFrom(val)
    setDurationPreset('custom')
    // recalculate end date if a non-custom preset was active
  }

  const handleDateToChange = (val: string) => {
    setDateTo(val)
    setDurationPreset('custom')
  }

  const days = React.useMemo(() => {
    if (!dateFrom || !dateTo) return 0
    const diff = new Date(dateTo).getTime() - new Date(dateFrom).getTime()
    return Math.max(0, Math.round(diff / 86400000))
  }, [dateFrom, dateTo])
  const unitW = Math.round(adWidth / 100)
  const unitH = Math.round(adHeight / 100)
  const totalUnits = unitW * unitH
  const dailyRate = totalUnits * 50
  const totalCost = dailyRate * days

  const adjustDim = (dim: 'w' | 'h', delta: number) => {
    if (dim === 'w') setAdWidth((v) => Math.min(800, Math.max(100, v + delta)))
    else setAdHeight((v) => Math.min(800, Math.max(100, v + delta)))
  }

  const steps = ['Space & Details', 'Preview', 'Payment']

  const saveDraft = async () => {
    if (!uploadedFile) {
      setSaveError('Choose an image creative before previewing your campaign.')
      return
    }

    setIsSaving(true)
    setSaveError('')
    const form = new FormData()
    form.set('creative', uploadedFile)
    form.set('name', adName)
    form.set('brandName', brandName)
    form.set('headline', headline)
    form.set('description', desc)
    form.set('callToAction', ctaType)
    form.set('width', String(adWidth))
    form.set('height', String(adHeight))
    form.set('startsAt', dateFrom)
    form.set('endsAt', dateTo)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        body: form,
        credentials: 'include',
        headers: previewAuthorizationHeaders(),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save campaign.')
      const campaign = result.campaign as StoredCampaign
      setSavedCampaign(campaign)
      onCampaignSaved(campaign)
      setStep(2)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save campaign.')
    } finally {
      setIsSaving(false)
    }
  }

  if (step === 2)
    return (
      <AdPreviewScreen
        onBack={() => setStep(1)}
        onNavigate={onNavigate}
        campaign={savedCampaign as StoredCampaign}
      />
    )
  if (step === 3) return <CheckoutScreen onNavigate={onNavigate} campaign={savedCampaign} />

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit']"
          >
            <ArrowLeft size={16} /> Back to Canvas
          </button>
          <div className="w-px h-5 bg-white/10" />
          <PwLogo size="sm" />
        </div>
        <div className="flex items-center gap-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-['Outfit'] font-bold ${step > i + 1 ? 'bg-[#00A882] text-black' : step === i + 1 ? 'bg-[#6C5FE6] text-white' : 'bg-black/8 text-muted-foreground'}`}
              >
                {step > i + 1 ? <Check size={12} /> : i + 1}
              </div>
              <span
                className={`text-sm font-['Outfit'] ${step === i + 1 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
              >
                {s}
              </span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-white/10 ml-2" />}
            </div>
          ))}
        </div>
        <div className="w-32" />
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {step === 1 && (
          <div className="max-w-5xl">
            <h2 className="font-['Outfit'] font-black text-4xl text-foreground mb-1">
              Choose Your Space
            </h2>
            <p className="text-muted-foreground font-['Inter'] mb-8">
              Configure your ad dimensions, rental period, and upload your creative.
            </p>

            <div className="grid grid-cols-5 gap-6">
              {/* Left — config column */}
              <div className="col-span-3 space-y-5">
                {/* Space info */}
                <div className="rounded-2xl border border-[#6C5FE6]/20 bg-[#6C5FE6]/4 p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#6C5FE6]/12 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-[#6C5FE6]" />
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {[
                      ['Space ID', 'CHN-A-1024'],
                      ['Canvas', 'Chennai Main Canvas'],
                      ['Location', 'Chennai, Tamil Nadu'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                          {k}
                        </div>
                        <div className="text-sm font-['Outfit'] font-bold text-foreground mt-0.5">
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ad size picker */}
                <div className="rounded-2xl border border-black/8 bg-card p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-['Outfit'] font-bold text-base text-foreground">Ad Size</h3>
                    <span className="text-xs text-muted-foreground font-['JetBrains_Mono'] bg-[#EDF0F8] px-2 py-1 rounded-lg">
                      ₹50 per 100 × 100 px / day
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-['Inter'] mb-5">
                    Choose width and height in 100 px steps. Price scales with the area you select.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {(['Width', 'Height'] as const).map((label) => {
                      const val = label === 'Width' ? adWidth : adHeight
                      const dim = label === 'Width' ? 'w' : 'h'
                      return (
                        <div key={label}>
                          <div className="text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                            {label}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => adjustDim(dim, -100)}
                              disabled={val <= 100}
                              className="w-9 h-9 rounded-xl border border-black/10 bg-[#F0F2F8] hover:bg-[#E4E7F5] flex items-center justify-center text-foreground disabled:opacity-30 transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <div className="flex-1 h-9 rounded-xl border border-[#6C5FE6]/30 bg-[#6C5FE6]/5 flex items-center justify-center">
                              <span className="font-['JetBrains_Mono'] font-bold text-[#6C5FE6] text-sm">
                                {val} px
                              </span>
                            </div>
                            <button
                              onClick={() => adjustDim(dim, 100)}
                              disabled={val >= 800}
                              className="w-9 h-9 rounded-xl border border-black/10 bg-[#F0F2F8] hover:bg-[#E4E7F5] flex items-center justify-center text-foreground disabled:opacity-30 transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Quick presets */}
                  <div className="text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                    Quick Presets
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Small', w: 100, h: 100 },
                      { label: 'Standard', w: 200, h: 200 },
                      { label: 'Medium', w: 300, h: 300 },
                      { label: 'Large', w: 400, h: 400 },
                      { label: 'Wide Banner', w: 600, h: 200 },
                      { label: 'Tall', w: 200, h: 400 },
                      { label: 'Billboard', w: 800, h: 400 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setAdWidth(p.w)
                          setAdHeight(p.h)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-['Outfit'] font-semibold transition-all border ${adWidth === p.w && adHeight === p.h ? 'bg-[#6C5FE6] text-white border-[#6C5FE6]' : 'bg-[#F0F2F8] text-muted-foreground border-black/5 hover:text-foreground hover:bg-[#E4E7F5]'}`}
                      >
                        {p.label}
                        <span className="ml-1.5 opacity-60 font-['JetBrains_Mono'] text-[10px]">
                          {p.w}×{p.h}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                <div className="rounded-2xl border border-black/8 bg-card p-6">
                  <h3 className="font-['Outfit'] font-bold text-base text-foreground mb-1">
                    Rental Period
                  </h3>
                  <p className="text-xs text-muted-foreground font-['Inter'] mb-4">
                    Pick a quick duration or choose custom start and end dates.
                  </p>

                  {/* Duration preset dropdown */}
                  <div className="mb-4">
                    <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                      Duration
                    </label>
                    <div className="relative">
                      <select
                        value={durationPreset}
                        onChange={(e) => applyPreset(e.target.value)}
                        className="w-full appearance-none bg-[#6C5FE6]/8 border border-[#6C5FE6]/25 rounded-xl px-4 py-2.5 text-sm font-['Outfit'] font-semibold text-[#6C5FE6] focus:outline-none focus:border-[#6C5FE6]/50 cursor-pointer pr-10"
                      >
                        {DURATION_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C5FE6] pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Date pickers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        min={today}
                        onChange={(e) => handleDateFromChange(e.target.value)}
                        className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-2.5 text-sm font-['JetBrains_Mono'] text-foreground focus:outline-none focus:border-[#6C5FE6]/50 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        min={dateFrom || today}
                        onChange={(e) => handleDateToChange(e.target.value)}
                        className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-2.5 text-sm font-['JetBrains_Mono'] text-foreground focus:outline-none focus:border-[#6C5FE6]/50 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Summary strip */}
                  {days > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#00A882] font-['JetBrains_Mono'] bg-[#00A882]/8 rounded-lg px-3 py-2">
                      <Calendar size={12} />
                      Campaign runs for{' '}
                      <strong>
                        {days} day{days !== 1 ? 's' : ''}
                      </strong>{' '}
                      · {dateFrom} → {dateTo}
                    </div>
                  )}
                  {days === 0 && dateFrom && dateTo && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 font-['JetBrains_Mono'] bg-amber-50 rounded-lg px-3 py-2">
                      <AlertTriangle size={12} /> Start date and end date must be different
                    </div>
                  )}
                  {dateTo && dateFrom && new Date(dateTo) < new Date(dateFrom) && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-500 font-['JetBrains_Mono'] bg-red-50 rounded-lg px-3 py-2">
                      <AlertTriangle size={12} /> End date must be after start date
                    </div>
                  )}
                </div>

                {/* Design guide + upload */}
                <div className="rounded-2xl border border-black/8 bg-card p-6">
                  <h3 className="font-['Outfit'] font-bold text-base text-foreground mb-1">
                    Design & Upload Your Ad
                  </h3>
                  <p className="text-xs text-muted-foreground font-['Inter'] mb-4">
                    Create your ad at exactly{' '}
                    <strong className="text-foreground font-semibold">
                      {adWidth} × {adHeight} px
                    </strong>
                    . You can design it using any tool and upload the finished file here.
                  </p>

                  {/* Design tool links */}
                  <div className="rounded-xl border border-[#6C5FE6]/15 bg-[#6C5FE6]/4 p-4 mb-4">
                    <div className="text-xs font-['Outfit'] font-bold text-[#6C5FE6] mb-3 flex items-center gap-1.5">
                      <Sparkles size={12} /> Design online for free
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          name: 'Canva',
                          url: 'https://www.canva.com',
                          desc: 'Drag & drop design',
                          emoji: '🎨',
                        },
                        {
                          name: 'Adobe Express',
                          url: 'https://express.adobe.com',
                          desc: 'Professional templates',
                          emoji: '✦',
                        },
                        {
                          name: 'Figma',
                          url: 'https://www.figma.com',
                          desc: 'For designers',
                          emoji: '🖼',
                        },
                      ].map((tool) => (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-start gap-1 p-3 rounded-xl border border-black/6 bg-white hover:border-[#6C5FE6]/30 hover:bg-[#6C5FE6]/5 transition-all group"
                        >
                          <div className="text-xl mb-0.5">{tool.emoji}</div>
                          <div className="font-['Outfit'] font-bold text-xs text-foreground group-hover:text-[#6C5FE6] transition-colors">
                            {tool.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-['Inter']">
                            {tool.desc}
                          </div>
                          <div className="flex items-center gap-0.5 text-[10px] text-[#6C5FE6] font-['Outfit'] font-semibold mt-0.5">
                            Open <ExternalLink size={9} />
                          </div>
                        </a>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-['JetBrains_Mono'] mt-3 flex items-center gap-1">
                      <span className="text-amber-500">⚠</span>
                      Set canvas to{' '}
                      <strong>
                        {adWidth} × {adHeight} px
                      </strong>{' '}
                      when designing for a perfect fit on the canvas.
                    </p>
                  </div>

                  {/* Upload zone */}
                  <div
                    className={`rounded-xl border-2 border-dashed transition-all cursor-pointer group ${uploadedFile ? 'border-[#00A882]/40 bg-[#00A882]/5' : 'border-black/12 hover:border-[#6C5FE6]/40 hover:bg-[#6C5FE6]/3'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setUploadedFile(file)
                          setSaveError('')
                        }
                      }}
                    />
                    {uploadedFile ? (
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00A882]/15 flex items-center justify-center shrink-0">
                          <Check size={18} className="text-[#00A882]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-['Outfit'] font-bold text-foreground truncate">
                            {uploadedFile.name}
                          </div>
                          <div className="text-xs text-[#00A882] font-['JetBrains_Mono'] mt-0.5">
                            Ready to upload securely
                          </div>
                        </div>
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground font-['Outfit'] shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setUploadedFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-xl bg-[#EDF0F8] group-hover:bg-[#6C5FE6]/12 flex items-center justify-center transition-colors">
                          <Upload
                            size={18}
                            className="text-muted-foreground group-hover:text-[#6C5FE6] transition-colors"
                          />
                        </div>
                        <div className="text-sm font-['Outfit'] font-semibold text-foreground">
                          Drop your ad file here
                        </div>
                        <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                          JPG, PNG, GIF, WebP · Max 50 MB
                        </div>
                        <div className="text-xs text-muted-foreground font-['Inter']">
                          or design online above and come back to upload
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right — campaign info + cost */}
              <div className="col-span-2 space-y-5">
                {/* Campaign Information */}
                <div className="rounded-2xl border border-black/8 bg-card p-5">
                  <div className="text-sm font-['Outfit'] font-bold text-foreground mb-1">
                    Campaign Information
                  </div>
                  <p className="text-xs text-muted-foreground font-['Inter'] mb-4">
                    Tell us about your ad so viewers know who it's from.
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        label: 'Campaign Name',
                        value: adName,
                        setter: setAdName,
                        placeholder: 'Summer Sale 2025',
                      },
                      {
                        label: 'Business Name',
                        value: brandName,
                        setter: setBrandName,
                        placeholder: 'Acme Corp',
                      },
                      {
                        label: 'Ad Headline',
                        value: headline,
                        setter: setHeadline,
                        placeholder: 'Up to 50% off this summer!',
                      },
                    ].map(({ label, value, setter, placeholder }) => (
                      <div key={label}>
                        <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                          {label}
                        </label>
                        <input
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={placeholder}
                          className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Tell customers why they should choose you..."
                        rows={2}
                        className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                        Call to Action
                      </label>
                      <div className="relative">
                        <select
                          value={ctaType}
                          onChange={(e) => setCtaType(e.target.value)}
                          className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground focus:outline-none focus:border-[#6C5FE6]/50 appearance-none cursor-pointer"
                        >
                          {[
                            'Visit Website',
                            'Call Now',
                            'WhatsApp',
                            'Get Directions',
                            'Shop Now',
                            'Book Now',
                            'Learn More',
                          ].map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="rounded-2xl border border-[#6C5FE6]/20 bg-[#6C5FE6]/4 p-5 space-y-3">
                  <div className="text-sm font-['Outfit'] font-bold text-foreground">
                    Cost Breakdown
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Size', `${adWidth} × ${adHeight} px`],
                      ['Area units', `${unitW} × ${unitH} = ${totalUnits} units`],
                      ['Rate', `₹50 × ${totalUnits} = ₹${dailyRate} / day`],
                      ['Duration', `${days} day${days !== 1 ? 's' : ''}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground font-['JetBrains_Mono'] text-xs">
                          {k}
                        </span>
                        <span className="text-foreground font-['JetBrains_Mono'] text-xs font-semibold">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#6C5FE6]/15 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-['Outfit'] font-bold text-sm text-foreground">
                        Total
                      </span>
                      <span className="font-['Outfit'] font-black text-2xl text-[#6C5FE6]">
                        {days > 0 ? `₹${totalCost.toLocaleString()}` : '—'}
                      </span>
                    </div>
                    {days > 0 && (
                      <div className="text-[10px] text-muted-foreground font-['JetBrains_Mono'] mt-1 text-right">
                        ₹{dailyRate}/day × {days} days
                      </div>
                    )}
                  </div>
                  {days === 0 && (
                    <p className="text-xs text-amber-600 font-['Inter'] flex items-center gap-1">
                      <AlertTriangle size={11} /> Select valid dates to see total cost
                    </p>
                  )}
                </div>

                {/* Size reference table */}
                <div className="rounded-2xl border border-black/8 bg-card p-5">
                  <div className="text-xs font-['Outfit'] font-bold text-foreground mb-3">
                    Size Reference
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-black/5">
                        {['Size', 'Use for', '₹/day'].map((h) => (
                          <th
                            key={h}
                            className="text-left pb-2 text-muted-foreground font-['JetBrains_Mono'] font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-['JetBrains_Mono']">
                      {[
                        ['100×100', 'Icon / logo', '₹50'],
                        ['200×200', 'Standard post', '₹200'],
                        ['400×400', 'Feature ad', '₹800'],
                        ['600×200', 'Banner strip', '₹600'],
                        ['800×400', 'Billboard', '₹1,600'],
                      ].map(([sz, use, cost]) => (
                        <tr key={sz} className="border-b border-black/4 last:border-0">
                          <td className="py-1.5 text-[#6C5FE6] font-semibold">{sz}</td>
                          <td className="py-1.5 text-muted-foreground">{use}</td>
                          <td className="py-1.5 text-foreground font-semibold">{cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <Clock size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 font-['Inter'] leading-relaxed">
                    This space is reserved for <strong>10 minutes</strong> during checkout. Complete
                    payment to secure your dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-10">
          <GhostBtn onClick={() => onBack()}>
            <ChevronLeft size={16} /> Back to Canvas
          </GhostBtn>
          <div className="flex flex-col items-end gap-2">
            {saveError && (
              <p className="max-w-md text-right text-xs font-['Inter'] text-red-500">{saveError}</p>
            )}
            <PrimaryBtn onClick={saveDraft} disabled={isSaving}>
              {isSaving ? 'Saving Draft…' : 'Save Draft & Preview'} <ArrowRight size={16} />
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  )
}

