import React, { useEffect, useState } from 'react'
import {
  ArrowLeft,
  Filter,
  Layers,
  X,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import type { Screen, CanvasTile } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { previewAuthorizationHeaders } from '@/lib/session'

const CITIES = [
  { slug: 'chennai', name: 'Chennai' },
  { slug: 'mumbai', name: 'Mumbai' },
  { slug: 'bangalore', name: 'Bangalore' },
  { slug: 'delhi', name: 'Delhi NCR' },
  { slug: 'hyderabad', name: 'Hyderabad' },
  { slug: 'kolkata', name: 'Kolkata' },
  { slug: 'ahmedabad', name: 'Ahmedabad' },
  { slug: 'pune', name: 'Pune' },
]

export function AdminCanvasScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [selectedCity, setSelectedCity] = useState('chennai')
  const [tiles, setTiles] = useState<CanvasTile[]>([])
  const [selectedTile, setSelectedTile] = useState<CanvasTile | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Add Space Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [addSize, setAddSize] = useState<'small' | 'medium' | 'large'>('medium')
  const [addX, setAddX] = useState(100)
  const [addY, setAddY] = useState(100)
  const [addPrice, setAddPrice] = useState(150)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const fetchTiles = () => {
    setIsLoading(true)
    fetch(`/api/inventory/slots?city=${selectedCity}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.tiles) {
          setTiles(data.tiles)
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    fetchTiles()
  }, [selectedCity])

  const handleAddSpace = async () => {
    setIsSubmitting(true)
    setStatusMessage(null)
    try {
      const res = await fetch('/api/admin/inventory/slots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...previewAuthorizationHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          city: selectedCity,
          sizeCategory: addSize,
          x: addX,
          y: addY,
          basePriceDaily: addPrice,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add canvas space.')

      setStatusMessage({ text: 'New space added to canvas!', type: 'success' })
      setShowAddModal(false)
      fetchTiles()
    } catch (err) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Unable to create space.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveSpace = async (slotId: string | number) => {
    if (!confirm('Are you sure you want to remove this space from the canvas?')) return

    setIsSubmitting(true)
    setStatusMessage(null)
    try {
      const res = await fetch(`/api/admin/inventory/slots?id=${slotId}`, {
        method: 'DELETE',
        headers: previewAuthorizationHeaders(),
        credentials: 'include',
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to remove canvas space.')

      setSelectedTile(null)
      setStatusMessage({ text: 'Space removed from canvas.', type: 'success' })
      fetchTiles()
    } catch (err) {
      setStatusMessage({
        text: err instanceof Error ? err.message : 'Unable to remove space.',
        type: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const statusColors: Record<string, string> = {
    active: '#00A882',
    available: '#DDE2F2',
    reserved: '#6C5FE6',
    expiring: '#F59E0B',
    suspended: '#E03E4D',
    premium: '#EC4899',
  }

  const adTiles = tiles.filter((t) => t.type === 'ad')
  const availTiles = tiles.filter((t) => t.type === 'available')
  const totalSlots = tiles.length || 0
  const occupancyRate = totalSlots > 0 ? Math.round((adTiles.length / totalSlots) * 100) : 0
  const totalRevenue = adTiles.length * 150

  const filteredTiles = tiles.filter((t) => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'active') return t.type === 'ad'
    if (filterStatus === 'available') return t.type === 'available'
    return true
  })

  const currentCityName = CITIES.find((c) => c.slug === selectedCity)?.name || 'Chennai'

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <header className="flex items-center gap-4 px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] cursor-pointer"
        >
          <ArrowLeft size={16} /> Admin Portal
        </button>
        <button
          onClick={() => onNavigate('canvas')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-xs font-['Outfit'] cursor-pointer bg-black/5 hover:bg-black/10 px-2.5 py-1 rounded-lg"
        >
          <Layers size={13} /> View Live Canvas
        </button>
        <div className="w-px h-5 bg-black/10" />
        <h1 className="font-['Outfit'] font-bold text-lg text-foreground flex items-center gap-2">
          Canvas Space Control — {currentCityName}
        </h1>

        {/* City Selector */}
        <div className="flex items-center gap-1.5 ml-2">
          <MapPin size={14} className="text-[#6C5FE6]" />
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value)
              setSelectedTile(null)
            }}
            className="bg-white border border-black/8 rounded-lg px-2.5 py-1 text-xs font-['Outfit'] font-semibold text-foreground focus:outline-none focus:border-[#6C5FE6] cursor-pointer"
          >
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => {
              setAddPrice(addSize === 'small' ? 50 : addSize === 'large' ? 300 : 150)
              setShowAddModal(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6C5FE6] hover:bg-[#5b4fd6] text-white text-xs font-['Outfit'] font-bold transition-all cursor-pointer shadow-sm shadow-[#6C5FE6]/25"
          >
            <Plus size={14} /> Add Space
          </button>

          <div className="flex gap-1">
            {['all', 'active', 'available'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Outfit'] font-semibold capitalize transition-all cursor-pointer ${
                  filterStatus === s
                    ? 'bg-[#6C5FE6] text-white'
                    : 'bg-black/5 text-muted-foreground hover:text-foreground'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Notifications */}
      {statusMessage && (
        <div
          className={`mx-8 mt-4 p-3 rounded-xl border text-xs font-['Inter'] flex items-center justify-between ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="cursor-pointer">
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex h-[calc(100vh-65px)]">
        {/* Canvas view */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Spaces Managed', value: totalSlots.toString(), color: '#6B7491' },
              { label: 'Available Inventory', value: availTiles.length.toString(), color: '#5B6890' },
              { label: 'Active Live Ads', value: adTiles.length.toString(), color: '#00A882' },
              { label: 'Canvas Occupancy', value: `${occupancyRate}%`, color: '#6C5FE6' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-black/5 bg-[#F0F2F9] p-4">
                <div className="text-lg font-['Outfit'] font-black" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Canvas container */}
          <div
            className="relative bg-white rounded-2xl border border-black/8 overflow-hidden shadow-sm"
            style={{ width: '100%', minHeight: '650px', height: '650px' }}
          >
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center">
                <Loader2 className="animate-spin text-[#6C5FE6]" size={28} />
              </div>
            )}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div
              className="absolute inset-0"
              style={{ transform: 'scale(0.35)', transformOrigin: '0 0' }}
            >
              {filteredTiles.map((tile) => (
                <div
                  key={tile.id}
                  className="absolute rounded cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    left: tile.x,
                    top: tile.y,
                    width: tile.w,
                    height: tile.h,
                    background: tile.type === 'ad' ? tile.color || '#00A882' : statusColors.available,
                    border: tile.type === 'available' ? '2px dashed rgba(0,0,0,0.15)' : 'none',
                    opacity: selectedTile?.id === tile.id ? 1 : 0.85,
                    outline: selectedTile?.id === tile.id ? '3px solid #6C5FE6' : 'none',
                  }}
                  onClick={() => setSelectedTile(tile)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Space detail panel */}
        <div className="w-80 border-l border-black/5 bg-white p-5 overflow-y-auto shrink-0">
          {selectedTile ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <div className="font-['Outfit'] font-bold text-foreground">Space Control</div>
                <button
                  onClick={() => setSelectedTile(null)}
                  className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="space-y-2 mb-5">
                {[
                  ['Space ID', `SP-${selectedTile.id.toString().padStart(4, '0')}`],
                  ['City Canvas', currentCityName],
                  ['Status', selectedTile.type === 'ad' ? 'Occupied / Active Ad' : 'Available for Rent'],
                  ['Position', `X: ${selectedTile.x}px, Y: ${selectedTile.y}px`],
                  ['Dimensions', `${selectedTile.w} × ${selectedTile.h} px`],
                  ['Standard Tier', selectedTile.w === 100 ? 'Small (100×100)' : selectedTile.w === 400 ? 'Large (400×200)' : 'Medium (200×200)'],
                  ...(selectedTile.type === 'ad'
                    ? [
                        ['Advertiser', selectedTile.brand ?? '—'],
                        ['Campaign', selectedTile.adTitle ?? '—'],
                        ['Impressions', selectedTile.views ? selectedTile.views.toString() : '0'],
                        ['Interactions', selectedTile.clicks ? selectedTile.clicks.toString() : '0'],
                      ]
                    : [['Base Price', `₹${selectedTile.price || 150}/day`]]),
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 border-b border-black/4 last:border-0"
                  >
                    <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                      {k}
                    </span>
                    <span className="text-xs text-foreground font-['Outfit'] font-medium">{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {selectedTile.type === 'ad' ? (
                  <button
                    onClick={() => onNavigate('admin-mod')}
                    className="w-full py-2.5 rounded-xl bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-semibold hover:bg-[#5b4fd6] transition-all cursor-pointer"
                  >
                    Inspect in Moderation
                  </button>
                ) : (
                  <button
                    onClick={() => handleRemoveSpace(selectedTile.id)}
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-['Outfit'] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 size={13} /> Remove Space from Canvas
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <Layers size={32} className="text-muted-foreground/30" />
              <div className="text-sm text-muted-foreground font-['Outfit']">
                Click any slot on the canvas to inspect or remove it, or click "+ Add Space" above to place new inventory.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Space Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-black/8 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-['Outfit'] font-bold text-lg text-foreground">
                Add Canvas Space — {currentCityName}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-muted-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-['Outfit'] font-bold text-muted-foreground mb-1.5">
                  Size Tier (Strict Standard Formats)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'small', label: 'Small', dims: '100 × 100', price: 50 },
                    { key: 'medium', label: 'Medium', dims: '200 × 200', price: 150 },
                    { key: 'large', label: 'Large', dims: '400 × 200', price: 300 },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => {
                        setAddSize(s.key as any)
                        setAddPrice(s.price)
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        addSize === s.key
                          ? 'border-[#6C5FE6] bg-[#6C5FE6]/5 shadow-sm'
                          : 'border-black/8 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-['Outfit'] font-bold text-foreground">{s.label}</div>
                      <div className="text-[10px] text-muted-foreground font-['JetBrains_Mono']">{s.dims}</div>
                      <div className="text-[11px] text-[#6C5FE6] font-bold mt-1">₹{s.price}/day</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-['Outfit'] font-bold text-muted-foreground mb-1">
                    X Position (px)
                  </label>
                  <input
                    type="number"
                    value={addX}
                    onChange={(e) => setAddX(Number(e.target.value) || 0)}
                    className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3 py-2 text-xs font-['JetBrains_Mono'] text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs font-['Outfit'] font-bold text-muted-foreground mb-1">
                    Y Position (px)
                  </label>
                  <input
                    type="number"
                    value={addY}
                    onChange={(e) => setAddY(Number(e.target.value) || 0)}
                    className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3 py-2 text-xs font-['JetBrains_Mono'] text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-['Outfit'] font-bold text-muted-foreground mb-1">
                  Base Rental Rate (₹/day)
                </label>
                <input
                  type="number"
                  value={addPrice}
                  onChange={(e) => setAddPrice(Number(e.target.value) || 50)}
                  className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3 py-2 text-xs font-['JetBrains_Mono'] text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-black/10 text-xs font-['Outfit'] font-semibold text-muted-foreground hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSpace}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#6C5FE6] hover:bg-[#5b4fd6] text-white text-xs font-['Outfit'] font-bold disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-[#6C5FE6]/25"
              >
                {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : 'Confirm Space'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
