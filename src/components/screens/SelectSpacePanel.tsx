import React, { useState } from 'react'
import { ArrowRight, Clock, X } from 'lucide-react'
import type { CanvasTile } from '@/types/pixelworld'
import { PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'

export function SelectSpacePanel({
  space,
  onClose,
  onContinue,
}: {
  space: CanvasTile
  onClose: () => void
  onContinue: (config: { size: string; duration: number; space: CanvasTile; price: number }) => void
}) {
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | 'premium'>(
    'medium',
  )
  const [duration, setDuration] = useState<7 | 30 | 90>(30)
  const [isReserving, setIsReserving] = useState(false)

  const sizes = [
    { id: 'small' as const, label: 'Small', dims: '50 × 50 units', base: 299 },
    { id: 'medium' as const, label: 'Medium', dims: '100 × 100 units', base: 999 },
    { id: 'large' as const, label: 'Large', dims: '200 × 200 units', base: 2499 },
    { id: 'premium' as const, label: 'Premium', dims: 'Custom Size', base: 4999 },
  ]

  const durations = [
    { d: 7 as const, label: '7 Days', mult: 0.3 },
    { d: 30 as const, label: '30 Days', mult: 1 },
    { d: 90 as const, label: '90 Days', mult: 2.6 },
  ]

  const basePrice = sizes.find((s) => s.id === selectedSize)?.base ?? 999
  const mult = durations.find((d) => d.d === duration)?.mult ?? 1
  const price = Math.round(basePrice * mult)

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
      onContinue({ size: selectedSize, duration, space, price })
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-['Outfit'] font-bold text-xl text-foreground">Reserve Ad Space</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/6 flex items-center justify-center text-muted-foreground transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Space info */}
      <div className="rounded-xl border border-black/8 bg-card p-4 mb-6 space-y-2">
        {[
          ['Location', 'Chennai, India'],
          ['Canvas', 'Chennai Main Canvas'],
          ['Space ID', 'CHN-A-1024'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">{k}</span>
            <span className="text-xs text-foreground font-['Outfit'] font-semibold">{v}</span>
          </div>
        ))}
      </div>

      {/* Size selection */}
      <div className="mb-6">
        <label className="block text-sm font-['Outfit'] font-semibold text-foreground mb-3">
          Ad Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSize(s.id)}
              className={`p-3 rounded-xl border text-left transition-all ${selectedSize === s.id ? 'border-[#6C5FE6] bg-[#6C5FE6]/10' : 'border-black/8 hover:border-black/12'}`}
            >
              <div className="font-['Outfit'] font-bold text-sm text-foreground">{s.label}</div>
              <div className="font-['JetBrains_Mono'] text-xs text-muted-foreground mt-0.5">
                {s.dims}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-sm font-['Outfit'] font-semibold text-foreground mb-3">
          Rental Duration
        </label>
        <div className="flex gap-2">
          {durations.map(({ d, label }) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-['Outfit'] font-semibold transition-all ${duration === d ? 'border-[#6C5FE6] bg-[#6C5FE6]/10 text-[#6C5FE6]' : 'border-black/8 text-muted-foreground hover:border-black/12'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price summary */}
      <div className="rounded-xl border border-[#6C5FE6]/20 bg-[#6C5FE6]/5 p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground font-['Outfit']">Space Size</span>
          <span className="text-sm text-foreground font-['Outfit'] font-semibold">
            {sizes.find((s) => s.id === selectedSize)?.dims}
          </span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground font-['Outfit']">Duration</span>
          <span className="text-sm text-foreground font-['Outfit'] font-semibold">
            {duration} Days
          </span>
        </div>
        <div className="border-t border-black/8 pt-3 flex justify-between items-center">
          <span className="font-['Outfit'] font-bold text-foreground">Total Price</span>
          <span className="font-['Outfit'] font-black text-2xl text-[#6C5FE6]">
            ₹{price.toLocaleString()}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-['Inter'] mb-5 flex items-center gap-1.5">
        <Clock size={12} /> This space will be reserved for 10 minutes during checkout.
      </p>

      <PrimaryBtn className="w-full justify-center" onClick={handleContinue} disabled={isReserving}>
        {isReserving ? 'Holding Space...' : 'Reserve This Space'} <ArrowRight size={16} />
      </PrimaryBtn>
    </div>
  )
}

