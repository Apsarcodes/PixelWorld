import React, { useEffect, useState } from 'react'
import { ArrowLeft, Filter, Layers, X, Loader2, MapPin } from 'lucide-react'
import type { Screen, CanvasTile } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'

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

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    fetch(`/api/inventory/slots?city=${selectedCity}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.tiles) {
          setTiles(data.tiles)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [selectedCity])

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
  const reservedTiles = tiles.filter((t) => (t as any).type === 'reserved')

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
        <div className="w-px h-5 bg-black/10" />
        <h1 className="font-['Outfit'] font-bold text-lg text-foreground flex items-center gap-2">
          Canvas Management — {currentCityName}
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

      <div className="flex h-[calc(100vh-65px)]">
        {/* Canvas mini view */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats bar - fully dynamic */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total Grid Inventory', value: totalSlots.toString(), color: '#6B7491' },
              { label: 'Available Slots', value: availTiles.length.toString(), color: '#5B6890' },
              { label: 'Occupied Ads', value: adTiles.length.toString(), color: '#00A882' },
              { label: 'Canvas Occupancy', value: `${occupancyRate}%`, color: '#6C5FE6' },
              { label: 'Est. Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: '#00A882' },
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

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            {[
              ['active', '#00A882'],
              ['available', '#DDE2F2'],
              ['reserved', '#6C5FE6'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: v,
                    border: k === 'available' ? '1px dashed rgba(0,0,0,0.15)' : 'none',
                  }}
                />
                <span className="text-xs text-muted-foreground font-['JetBrains_Mono'] capitalize">
                  {k}
                </span>
              </div>
            ))}
          </div>

          {/* Visual canvas grid */}
          <div
            className="rounded-2xl border border-black/8 overflow-hidden bg-[#ECF0FA] relative"
            style={{ height: 480 }}
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
              style={{ transform: 'scale(0.25)', transformOrigin: '0 0' }}
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
                    border: tile.type === 'available' ? '2px dashed rgba(0,0,0,0.1)' : 'none',
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
                <div className="font-['Outfit'] font-bold text-foreground">Space Details</div>
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
                  ['Status', selectedTile.type === 'ad' ? 'Active' : 'Available'],
                  ['Position', `(${selectedTile.x}, ${selectedTile.y})`],
                  ['Dimensions', `${selectedTile.w} × ${selectedTile.h} px`],
                  ...(selectedTile.type === 'ad'
                    ? [
                        ['Advertiser', selectedTile.brand ?? '—'],
                        ['Campaign', selectedTile.adTitle ?? '—'],
                        ['Impressions', selectedTile.views ? selectedTile.views.toString() : '0'],
                        ['Interactions', selectedTile.clicks ? selectedTile.clicks.toString() : '0'],
                      ]
                    : [['Base Price', `₹${selectedTile.price || 50}/day`]]),
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
                    className="w-full py-2 rounded-lg bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-semibold hover:bg-[#5b4fd6] transition-all cursor-pointer"
                  >
                    Review Campaign in Moderation
                  </button>
                ) : (
                  <button
                    onClick={() => onNavigate('create-ad')}
                    className="w-full py-2 rounded-lg bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-semibold hover:bg-[#5b4fd6] transition-all cursor-pointer"
                  >
                    Book Space
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <Layers size={32} className="text-muted-foreground/30" />
              <div className="text-sm text-muted-foreground font-['Outfit']">
                Click any slot on the canvas to inspect its status
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
