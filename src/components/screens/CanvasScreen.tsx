import React, { useCallback, useEffect, useState, useRef } from 'react'
import { ChevronRight, ExternalLink, Map, MapPin, Maximize2, MessageCircle, Minus, Navigation, Phone, Play, Plus, RotateCcw, Search, Share2, ShoppingBag, X } from 'lucide-react'
import type { Screen, CanvasTile, StoredCampaign } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { CreativeImage } from '@/components/common/CreativeImage'
import { SelectSpacePanel } from '@/components/screens/SelectSpacePanel'
import { CreateAdScreen } from '@/components/screens/CreateAdScreen'
import { CELL, CANVAS_W, CANVAS_H, TILES, FILTER_CATEGORIES, normalizeCategory } from '@/data/mock-data'

export function CanvasScreen({
  onNavigate,
  campaigns,
  onCampaignSaved,
}: {
  onNavigate: (s: Screen) => void
  campaigns: StoredCampaign[]
  onCampaignSaved: (campaign: StoredCampaign) => void
}) {
  const [zoom, setZoom] = useState(0.7)
  const [pan, setPan] = useState({ x: -120, y: -80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [hoveredTile, setHoveredTile] = useState<CanvasTile | null>(null)
  const [selectedAd, setSelectedAd] = useState<CanvasTile | null>(null)
  const [selectedSpace, setSelectedSpace] = useState<CanvasTile | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const persistedCampaign = campaigns[0] ?? null

  const adTilesByCategory = React.useMemo(() => {
    const counts: Record<string, number> = { All: 0 }
    TILES.forEach((t) => {
      if (t.type !== 'ad') return
      counts.All = (counts.All ?? 0) + 1
      const norm = normalizeCategory(t.category)
      counts[norm] = (counts[norm] ?? 0) + 1
    })
    return counts
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.tile-btn')) return
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setPanStart({ ...pan })
    },
    [pan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      setPan({
        x: panStart.x + (e.clientX - dragStart.x),
        y: panStart.y + (e.clientY - dragStart.y),
      })
    },
    [isDragging, dragStart, panStart],
  )

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    setZoom((z) => Math.max(0.25, Math.min(2.5, z + delta)))
  }, [])

  const resetView = () => {
    setZoom(0.7)
    setPan({ x: -120, y: -80 })
  }

  const miniScale = 160 / CANVAS_W
  const container = containerRef.current?.getBoundingClientRect()
  const vpW = (container?.width ?? 1200) / zoom
  const vpH = (container?.height ?? 700) / zoom
  const vpX = -pan.x / zoom
  const vpY = -pan.y / zoom

  if (showCreate)
    return (
      <CreateAdScreen
        onBack={() => setShowCreate(false)}
        onNavigate={onNavigate}
        onCampaignSaved={onCampaignSaved}
      />
    )

  return (
    <div className="h-screen bg-[#ECF0FA] flex flex-col overflow-hidden">
      <style>{`
        .canvas-grid { background-image: linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px); background-size: 80px 80px; }
        .tile-hover { transition: filter 0.15s, transform 0.15s, opacity 0.2s; }
        .tile-hover:hover { filter: brightness(1.12); transform: scale(1.02); z-index: 20; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        .filter-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-black/6 bg-[rgba(245,247,252,0.98)] backdrop-blur-xl z-40 shrink-0 shadow-sm">
        <PwLogo size="sm" />
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-['Outfit']">
          <button onClick={() => onNavigate('landing')} className="hover:text-foreground">
            World
          </button>
          <ChevronRight size={12} />
          <button onClick={() => onNavigate('country')} className="hover:text-foreground">
            India
          </button>
          <ChevronRight size={12} />
          <button className="hover:text-foreground">Tamil Nadu</button>
          <ChevronRight size={12} />
          <span className="text-foreground font-semibold">Chennai</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              placeholder="Search ads or businesses..."
              className="bg-[#EDF0F8] border border-black/8 rounded-lg pl-9 pr-4 py-2 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/40 w-60"
            />
          </div>
          <GhostBtn small onClick={() => onNavigate('dashboard')}>
            My Ads
          </GhostBtn>
          <PrimaryBtn small onClick={() => setShowCreate(true)}>
            + Post Your Ad
          </PrimaryBtn>
          <button className="w-8 h-8 rounded-full bg-[#6C5FE6] flex items-center justify-center text-white text-xs font-bold font-['Outfit']">
            A
          </button>
        </div>
      </header>

      {/* Category filter bar */}
      <div className="shrink-0 bg-white border-b border-black/6 shadow-sm z-30">
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto filter-scroll">
          {FILTER_CATEGORIES.map((cat) => {
            const count = adTilesByCategory[cat.id] ?? 0
            if (cat.id !== 'All' && count === 0) return null
            const isActive = activeFilter === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-['Outfit'] font-semibold transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-[#6C5FE6] text-white shadow-md shadow-[#6C5FE6]/30'
                    : 'bg-[#F0F2F8] text-muted-foreground hover:bg-[#E4E7F5] hover:text-foreground border border-black/5'
                }`}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-['JetBrains_Mono'] font-medium ${
                    isActive ? 'bg-white/20 text-white' : 'bg-black/8 text-muted-foreground'
                  }`}
                >
                  {cat.id === 'All' ? adTilesByCategory.All : count}
                </span>
              </button>
            )
          })}
          {activeFilter !== 'All' && (
            <button
              onClick={() => setActiveFilter('All')}
              className="flex items-center gap-1 ml-1 px-3 py-1.5 rounded-full text-xs font-['Outfit'] font-semibold text-muted-foreground hover:text-foreground border border-black/8 hover:border-black/15 transition-all shrink-0"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Active filter summary strip */}
        {activeFilter !== 'All' && (
          <div className="flex items-center gap-3 px-4 pb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-['JetBrains_Mono']">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C5FE6] inline-block" />
              Showing{' '}
              <strong className="text-foreground">
                {adTilesByCategory[activeFilter] ?? 0} ads
              </strong>{' '}
              in
              <strong className="text-[#6C5FE6]">
                {FILTER_CATEGORIES.find((c) => c.id === activeFilter)?.emoji} {activeFilter}
              </strong>
              — other categories are dimmed
            </div>
          </div>
        )}
      </div>

      {/* Canvas area */}
      <div
        className="relative flex-1 overflow-hidden"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          ref={canvasRef}
          className="absolute canvas-grid"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {TILES.map((tile) => {
            const tileNorm = normalizeCategory(tile.category)
            const isFiltered = activeFilter !== 'All'
            const matchesFilter = tile.type === 'available' || tileNorm === activeFilter
            const dimmed = isFiltered && !matchesFilter
            return (
              <div
                key={tile.id}
                className={`absolute tile-hover rounded-lg overflow-hidden ${tile.type === 'available' ? 'border-2 border-dashed border-black/12 bg-[#F0F2F9]' : 'shadow-lg'}`}
                style={{
                  left: tile.x,
                  top: tile.y,
                  width: tile.w,
                  height: tile.h,
                  background: tile.type === 'ad' ? tile.color : undefined,
                  zIndex: hoveredTile?.id === tile.id ? 10 : matchesFilter ? 2 : 1,
                  opacity: dimmed ? 0.18 : 1,
                  filter: dimmed ? 'saturate(0)' : 'none',
                  transition: 'opacity 0.25s ease, filter 0.25s ease',
                }}
                onMouseEnter={() => setHoveredTile(tile)}
                onMouseLeave={() => setHoveredTile(null)}
                onClick={(e) => {
                  e.stopPropagation()
                  if (tile.type === 'ad') {
                    setSelectedAd(tile)
                    setSelectedSpace(null)
                  } else {
                    setSelectedSpace(tile)
                    setSelectedAd(null)
                  }
                }}
              >
                {tile.type === 'ad' ? (
                  <div
                    className="relative w-full h-full p-3 flex flex-col justify-between"
                    style={{ color: tile.textColor }}
                  >
                    {/* Subtle inner gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 pointer-events-none" />
                    <div className="relative">
                      <div className="text-xl mb-1">{tile.emoji}</div>
                      <div className="font-['Outfit'] font-black text-xs leading-tight opacity-90">
                        {tile.brand}
                      </div>
                    </div>
                    {tile.w >= 200 && (
                      <div className="relative">
                        <div className="font-['Inter'] text-xs leading-snug opacity-75 line-clamp-2">
                          {tile.tagline}
                        </div>
                      </div>
                    )}
                    {/* Hover overlay */}
                    {hoveredTile?.id === tile.id && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                        <div className="font-['Outfit'] font-bold text-white text-sm text-center px-2">
                          {tile.brand}
                        </div>
                        <div className="font-['Inter'] text-white/75 text-xs text-center px-2 line-clamp-2">
                          {tile.adTitle}
                        </div>
                        <button className="tile-btn mt-1 px-3 py-1.5 bg-white text-black text-xs font-['Outfit'] font-bold rounded-lg hover:bg-white/90 transition-colors">
                          View Ad
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2">
                    {hoveredTile?.id === tile.id ? (
                      <>
                        <div className="font-['Outfit'] font-bold text-[#6C5FE6] text-xs text-center">
                          Rent This Space
                        </div>
                        <div className="font-['JetBrains_Mono'] text-muted-foreground text-xs">
                          From ₹{tile.price}
                        </div>
                        <button className="tile-btn mt-1 px-3 py-1 bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-bold rounded-lg hover:bg-[#6B5EE6] transition-colors">
                          Reserve
                        </button>
                      </>
                    ) : (
                      <>
                        <Plus size={14} className="text-black/25" />
                        <div className="font-['JetBrains_Mono'] text-black/25 text-xs">
                          Available
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {persistedCampaign?.creative.url && (
            <button
              className="absolute tile-btn overflow-hidden rounded-lg shadow-xl ring-2 ring-[#6C5FE6] bg-white"
              style={{
                left: 1360,
                top: 1680,
                width: Math.max(160, Math.min(400, persistedCampaign.width)),
                height: Math.max(160, Math.min(400, persistedCampaign.height)),
                zIndex: 5,
              }}
              onClick={(event) => {
                event.stopPropagation()
                onNavigate('dashboard')
              }}
              aria-label={`Open ${persistedCampaign.name}`}
            >
              <CreativeImage campaign={persistedCampaign} sizes="400px" />
              <span className="absolute right-2 top-2 rounded-md bg-[#6C5FE6] px-2 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-white">
                YOUR DRAFT
              </span>
            </button>
          )}
        </div>

        {/* Canvas controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-30">
          {[
            { icon: Plus, action: () => setZoom((z) => Math.min(2.5, z + 0.15)), tip: 'Zoom In' },
            {
              icon: Minus,
              action: () => setZoom((z) => Math.max(0.25, z - 0.15)),
              tip: 'Zoom Out',
            },
            { icon: RotateCcw, action: resetView, tip: 'Reset View' },
            { icon: Maximize2, action: () => {}, tip: 'Fullscreen' },
          ].map(({ icon: Icon, action, tip }) => (
            <button
              key={tip}
              title={tip}
              onClick={action}
              className="w-9 h-9 rounded-xl bg-card border border-black/8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-black/12 transition-all shadow-lg"
            >
              <Icon size={15} />
            </button>
          ))}
          {/* Zoom indicator */}
          <div className="mt-1 px-2 py-1 rounded-lg bg-card border border-black/8 text-center">
            <span className="text-xs font-['JetBrains_Mono'] text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Mini-map */}
        <div className="absolute bottom-4 right-4 z-30 rounded-xl border border-black/8 bg-[#F5F7FC]/90 backdrop-blur-sm p-2 shadow-xl">
          <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground mb-1.5 px-1">
            Mini Map
          </div>
          <div
            className="relative overflow-hidden rounded-lg bg-[#F0F2F9]"
            style={{ width: 160, height: Math.round((160 * CANVAS_H) / CANVAS_W) }}
          >
            {TILES.filter((t) => t.type === 'ad').map((t) => {
              const matched =
                activeFilter === 'All' || normalizeCategory(t.category) === activeFilter
              return (
                <div
                  key={t.id}
                  className="absolute rounded-sm transition-opacity duration-200"
                  style={{
                    left: t.x * miniScale,
                    top: t.y * miniScale,
                    width: Math.max(3, t.w * miniScale),
                    height: Math.max(3, t.h * miniScale),
                    background: matched ? t.color : '#C8CDD8',
                    opacity: matched ? 0.9 : 0.3,
                  }}
                />
              )
            })}
            {/* Viewport rect */}
            <div
              className="absolute border-2 border-[#6C5FE6] rounded-sm pointer-events-none"
              style={{
                left: Math.max(0, vpX * miniScale),
                top: Math.max(0, vpY * miniScale),
                width: Math.min(160, vpW * miniScale),
                height: Math.min(120, vpH * miniScale),
                background: 'rgba(124,111,247,0.1)',
              }}
            />
          </div>
        </div>

        {/* Canvas info bar */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F7FC]/90 backdrop-blur-sm border border-black/8">
            <div className="w-2 h-2 rounded-full bg-[#00A882] animate-pulse" />
            <span className="text-xs font-['JetBrains_Mono'] text-foreground">
              Chennai Main Canvas
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#F5F7FC]/90 backdrop-blur-sm border border-black/8">
            {[
              { color: '#6C5FE6', label: 'Active' },
              { color: '#DDE1F0', label: 'Available', border: true },
              { color: '#F59E0B', label: 'Expiring' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{
                    background: l.color,
                    border: l.border ? '1px dashed rgba(0,0,0,0.25)' : 'none',
                  }}
                />
                <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad detail panel */}
      {selectedAd && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-black/8 z-50 overflow-y-auto shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: selectedAd.color }}
                >
                  {selectedAd.emoji}
                </div>
                <div>
                  <div className="font-['Outfit'] font-bold text-foreground">
                    {selectedAd.brand}
                  </div>
                  <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                    {selectedAd.category}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAd(null)}
                className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Ad preview */}
            <div
              className="rounded-2xl overflow-hidden mb-6 aspect-video flex items-center justify-center relative"
              style={{ background: selectedAd.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/30" />
              <div className="relative text-center" style={{ color: selectedAd.textColor }}>
                <div className="text-5xl mb-2">{selectedAd.emoji}</div>
                <div className="font-['Outfit'] font-black text-2xl">{selectedAd.brand}</div>
                <div className="font-['Inter'] text-sm opacity-80 mt-1 px-4">
                  {selectedAd.tagline}
                </div>
              </div>
              <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play size={14} className="text-white ml-0.5" />
              </button>
            </div>

            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-2">
              {selectedAd.adTitle}
            </h3>
            <p className="text-sm text-muted-foreground font-['Inter'] mb-4 leading-relaxed">
              {selectedAd.tagline} — Click through to explore our latest offers and deals, only
              available for a limited time.
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <MapPin size={12} className="text-[#00A882]" />
              <span className="font-['JetBrains_Mono']">{selectedAd.location}</span>
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { icon: ExternalLink, label: 'Visit Website', color: 'bg-[#6C5FE6] text-white' },
                {
                  icon: Phone,
                  label: 'Call Now',
                  color: 'bg-[#00A882]/15 text-[#00A882] border border-[#00A882]/20',
                },
                {
                  icon: MessageCircle,
                  label: 'WhatsApp',
                  color: 'bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20',
                },
                {
                  icon: Navigation,
                  label: 'Directions',
                  color: 'bg-black/5 text-foreground border border-black/8',
                },
                {
                  icon: ShoppingBag,
                  label: 'Shop Now',
                  color: 'bg-black/5 text-foreground border border-black/8',
                },
                {
                  icon: Share2,
                  label: 'Share Ad',
                  color: 'bg-black/5 text-muted-foreground border border-black/8',
                },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-['Outfit'] font-medium transition-all hover:opacity-80 ${color}`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-black/6 bg-card p-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-['Outfit'] font-black text-[#6C5FE6]">
                  {selectedAd.views}
                </div>
                <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                  Total Views
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-['Outfit'] font-black text-[#00A882]">
                  {selectedAd.clicks}
                </div>
                <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                  Interactions
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select space panel */}
      {selectedSpace && !selectedAd && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-black/8 z-50 overflow-y-auto shadow-2xl">
          <SelectSpacePanel
            space={selectedSpace}
            onClose={() => setSelectedSpace(null)}
            onContinue={() => {
              setSelectedSpace(null)
              setShowCreate(true)
            }}
          />
        </div>
      )}
    </div>
  )
}

