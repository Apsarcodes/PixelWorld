import React, { useState, useMemo } from 'react'
import { ArrowRight, Check, Clock, Info, ShieldCheck, Sparkles, X, Zap } from 'lucide-react'
import type { CanvasTile } from '@/types/pixelworld'
import { PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { calculateDynamicPrice, type SizeCategory } from '@/lib/pricing'

export interface SelectedSpaceConfig {
  size: SizeCategory
  duration: number
  space: CanvasTile
  price: number
  subtotal: number
  gstAmount: number
  city: string
  width: number
  height: number
  addons: {
    whatsappCta: boolean
    verifiedBadge: boolean
    priorityPlacement: boolean
    analyticsPro: boolean
  }
}

export function SelectSpacePanel({
  space,
  onClose,
  onContinue,
}: {
  space: CanvasTile
  onClose: () => void
  onContinue: (config: SelectedSpaceConfig) => void
}) {
  const initialSize: SizeCategory = useMemo(() => {
    if (space.size === 'small' || space.w <= 100) return 'small'
    if (space.size === 'large' || space.w >= 400) return 'large'
    return 'medium'
  }, [space])

  const [selectedSize, setSelectedSize] = useState<SizeCategory>(initialSize)

  React.useEffect(() => {
    if (space.size === 'small' || space.w <= 100) setSelectedSize('small')
    else if (space.size === 'large' || space.w >= 400) setSelectedSize('large')
    else setSelectedSize('medium')
  }, [space])

  const [duration, setDuration] = useState<number>(1)
  const [isReserving, setIsReserving] = useState(false)

  // Interactive Add-ons (Defaulted to false for future enhancement)
  const [addons, setAddons] = useState({
    whatsappCta: false,
    verifiedBadge: false,
    priorityPlacement: false,
    analyticsPro: false,
  })

  // Extract city from space location or default to Chennai
  const cityName = useMemo(() => {
    if (space.location) {
      return space.location.split(',')[0].trim()
    }
    return 'Chennai'
  }, [space.location])

  const dimensions = useMemo(() => {
    if (selectedSize === 'small') return { w: 100, h: 100 }
    if (selectedSize === 'large') return { w: 400, h: 200 }
    return { w: 200, h: 200 }
  }, [selectedSize])

  // Real-time server-aligned dynamic price calculation
  const pricing = useMemo(() => {
    return calculateDynamicPrice({
      city: cityName,
      sizeCategory: selectedSize,
      width: dimensions.w,
      height: dimensions.h,
      durationDays: duration,
      addons,
    })
  }, [cityName, selectedSize, dimensions, duration, addons])

  const toggleAddon = (key: keyof typeof addons) => {
    setAddons((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleContinue = async () => {
    setIsReserving(true)
    try {
      await fetch('/api/reservations/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: space.id,
          durationDays: duration,
        }),
      }).catch(() => {})
    } finally {
      setIsReserving(false)
      onContinue({
        size: selectedSize,
        duration,
        space,
        price: pricing.totalAmount,
        subtotal: pricing.subtotal,
        gstAmount: pricing.gstAmount,
        city: cityName,
        width: dimensions.w,
        height: dimensions.h,
        addons,
      })
    }
  }

  const sizeOptions: Array<{ id: SizeCategory; label: string; dims: string; badge?: string; desc: string }> = [
    { id: 'small', label: 'Small', dims: '100 × 100 px', desc: 'Square Icon / Logo Badge' },
    { id: 'medium', label: 'Medium', dims: '200 × 200 px', badge: 'Popular', desc: 'Standard Feature Ad' },
    { id: 'large', label: 'Large', dims: '400 × 200 px', badge: 'High Impact', desc: 'Wide Premium Banner' },
  ]

  const durationPresets = [
    { d: 1, label: '1D', discount: '' },
    { d: 7, label: '7D', discount: '' },
    { d: 14, label: '14D', discount: '-5%' },
    { d: 30, label: '30D', discount: '-15%' },
    { d: 60, label: '60D', discount: '-20%' },
    { d: 90, label: '90D', discount: '-25%' },
  ]

  return (
    <div className="flex flex-col h-full max-h-screen bg-card text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-black/8 sticky top-0 bg-card/95 backdrop-blur-md z-10">
        <div>
          <h3 className="font-['Outfit'] font-bold text-lg text-foreground">Customize & Reserve Space</h3>
          <p className="text-xs text-muted-foreground font-['Inter']">Real-time dynamic pricing tailored to your selection</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/10 flex items-center justify-center text-muted-foreground transition-all"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Space Context Card */}
        <div className="rounded-2xl border border-black/8 bg-[#F4F6FC] p-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-['JetBrains_Mono']">Location & Canvas</span>
            <span className="font-semibold text-foreground font-['Outfit']">{cityName}, India</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-['JetBrains_Mono']">Ad Placement</span>
            <span className="font-semibold text-[#00A882] font-['Outfit'] flex items-center gap-1">
              <Sparkles size={12} /> Live Interactive Billboard
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-['JetBrains_Mono']">Grid Coordinate</span>
            <span className="font-semibold text-foreground font-['JetBrains_Mono']">
              X:{space.x || 0} · Y:{space.y || 0} (#{space.id})
            </span>
          </div>
        </div>

        {/* 1. Size Selection */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm font-['Outfit'] font-bold text-foreground">1. Select Ad Dimensions</label>
            <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">{dimensions.w} × {dimensions.h} px</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sizeOptions.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSize(s.id)}
                className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  selectedSize === s.id
                    ? 'border-[#6C5FE6] bg-[#6C5FE6]/10 text-foreground ring-2 ring-[#6C5FE6]'
                    : 'border-black/8 bg-card hover:border-black/15 text-muted-foreground'
                }`}
              >
                {s.badge && (
                  <span className="self-start mb-1 px-1.5 py-0.5 rounded text-[9px] font-['Outfit'] font-bold bg-[#6C5FE6] text-white">
                    {s.badge}
                  </span>
                )}
                <div className="font-['Outfit'] font-bold text-sm text-foreground">{s.label}</div>
                <div className="font-['JetBrains_Mono'] text-xs font-semibold text-[#6C5FE6] mt-0.5">{s.dims}</div>
                <div className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Rental Duration */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-sm font-['Outfit'] font-bold text-foreground">2. Campaign Duration</label>
            <span className="text-xs font-['Outfit'] font-semibold text-[#6C5FE6]">
              {duration} Days {pricing.durationDiscountPct > 0 && `(${pricing.durationDiscountPct}% Bulk Savings)`}
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex gap-1.5 mb-3">
            {durationPresets.map(({ d, label, discount }) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`flex-1 py-2 px-1 rounded-xl border text-center transition-all ${
                  duration === d
                    ? 'border-[#6C5FE6] bg-[#6C5FE6] text-white font-bold'
                    : 'border-black/8 bg-card text-muted-foreground hover:border-black/15 font-semibold text-xs'
                }`}
              >
                <div>{label}</div>
                {discount && <div className="text-[10px] opacity-80">{discount}</div>}
              </button>
            ))}
          </div>

          {/* Fine-grain slider */}
          <div className="px-1">
            <input
              type="range"
              min={1}
              max={180}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full accent-[#6C5FE6]"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground font-['JetBrains_Mono'] mt-1">
              <span>1 Day</span>
              <span>1 Month</span>
              <span>3 Months</span>
              <span>6 Months</span>
            </div>
          </div>
        </div>

        {/* 3. Pricing Calculation Breakdown */}
        <div className="rounded-2xl border border-[#6C5FE6]/25 bg-[#6C5FE6]/5 p-4.5 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-black/8">
            <span className="text-xs font-['Outfit'] font-bold uppercase tracking-wider text-[#6C5FE6]">
              Real-Time Dynamic Pricing
            </span>
            <Badge color="purple">{pricing.durationDays} Days Active</Badge>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Space Rental ({pricing.dimensions})</span>
            <span className="font-semibold font-['JetBrains_Mono']">
              ₹{pricing.spaceRentalSubtotal.toLocaleString()}
            </span>
          </div>

          {pricing.durationDiscountPct > 0 && (
            <div className="flex justify-between text-xs text-[#00A882]">
              <span>Duration Bulk Discount ({pricing.durationDiscountPct}%)</span>
              <span className="font-semibold font-['JetBrains_Mono']">Applied in rate</span>
            </div>
          )}

          {pricing.addonsTotal > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Power-Ups ({pricing.activeAddons.length})</span>
              <span className="font-semibold font-['JetBrains_Mono']">+₹{pricing.addonsTotal.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">GST (18% Govt. Tax)</span>
            <span className="font-semibold font-['JetBrains_Mono']">₹{pricing.gstAmount.toLocaleString()}</span>
          </div>

          <div className="border-t border-black/8 pt-3 flex justify-between items-center">
            <div>
              <div className="font-['Outfit'] font-bold text-foreground text-sm">Total Investment</div>
              <div className="text-[11px] text-muted-foreground">Direct Bank Settlement via UPI</div>
            </div>
            <div className="text-right">
              <span className="font-['Outfit'] font-black text-2xl text-[#6C5FE6]">
                ₹{pricing.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground font-['Inter'] flex items-center gap-1.5 leading-relaxed">
          <Clock size={12} className="shrink-0 text-[#6C5FE6]" /> Coordinates held exclusively for 15 minutes upon confirmation.
        </p>
      </div>

      {/* Footer CTA */}
      <div className="p-4 border-t border-black/8 bg-card sticky bottom-0">
        <PrimaryBtn className="w-full justify-center py-3 text-sm" onClick={handleContinue} disabled={isReserving}>
          {isReserving ? 'Reserving Coordinates...' : `Lock Space for ₹${pricing.totalAmount.toLocaleString()}`}
          <ArrowRight size={16} />
        </PrimaryBtn>
      </div>
    </div>
  )
}
