import React, { useState } from 'react'
import { ArrowLeft, Filter, Layers, X } from 'lucide-react'
import type { Screen, CanvasTile } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { TILES } from '@/data/mock-data'

export function AdminCanvasScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [selectedTile, setSelectedTile] = useState<CanvasTile | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const statusColors: Record<string, string> = {
    active: '#00A882',
    available: '#DDE2F2',
    reserved: '#6C5FE6',
    expiring: '#F59E0B',
    suspended: '#E03E4D',
    premium: '#EC4899',
  }

  const adTiles = TILES.filter((t) => t.type === 'ad')
  const availTiles = TILES.filter((t) => t.type === 'available')

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <header className="flex items-center gap-4 px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit']"
        >
          <ArrowLeft size={16} /> Admin
        </button>
        <div className="w-px h-5 bg-white/10" />
        <h1 className="font-['Outfit'] font-bold text-lg text-foreground">
          Canvas Management — Chennai Main Canvas
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex gap-1">
            {['all', 'active', 'available', 'expiring', 'suspended'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Outfit'] font-semibold capitalize transition-all ${filterStatus === s ? 'bg-[#6C5FE6] text-white' : 'bg-black/5 text-muted-foreground hover:text-foreground'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/8 text-xs font-['Outfit'] text-muted-foreground hover:text-foreground">
            <Filter size={12} /> Filters
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Canvas mini view */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats bar */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {[
              { label: 'Total Inventory', value: '1,200', color: '#6B7491' },
              { label: 'Available', value: availTiles.length.toString(), color: '#5B6890' },
              { label: 'Occupied', value: adTiles.length.toString(), color: '#00A882' },
              { label: 'Reserved', value: '8', color: '#6C5FE6' },
              { label: 'Occupancy Rate', value: '68%', color: '#6C5FE6' },
              { label: 'Revenue (MTD)', value: '₹8.4M', color: '#00A882' },
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
            {Object.entries(statusColors).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: v,
                    border: k === 'available' ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                  }}
                />
                <span className="text-xs text-muted-foreground font-['JetBrains_Mono'] capitalize">
                  {k}
                </span>
              </div>
            ))}
          </div>

          {/* Visual canvas grid (scaled down) */}
          <div
            className="rounded-2xl border border-black/8 overflow-hidden bg-[#ECF0FA] relative"
            style={{ height: 480 }}
          >
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
              style={{ transform: 'scale(0.2)', transformOrigin: '0 0' }}
            >
              {TILES.map((tile) => (
                <div
                  key={tile.id}
                  className="absolute rounded cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    left: tile.x,
                    top: tile.y,
                    width: tile.w,
                    height: tile.h,
                    background: tile.type === 'ad' ? tile.color : statusColors.available,
                    border: tile.type === 'available' ? '2px dashed rgba(255,255,255,0.1)' : 'none',
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
        <div className="w-72 border-l border-black/5 bg-white p-5 overflow-y-auto shrink-0">
          {selectedTile ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <div className="font-['Outfit'] font-bold text-foreground">Space Details</div>
                <button
                  onClick={() => setSelectedTile(null)}
                  className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="space-y-2 mb-5">
                {[
                  ['Space ID', `CHN-${selectedTile.id.toString().padStart(4, '0')}`],
                  ['Status', selectedTile.type === 'ad' ? 'Active' : 'Available'],
                  ['Position', `${selectedTile.x} × ${selectedTile.y}`],
                  ['Dimensions', `${selectedTile.w} × ${selectedTile.h}px`],
                  ...(selectedTile.type === 'ad'
                    ? [
                        ['Advertiser', selectedTile.brand ?? '—'],
                        ['Campaign', selectedTile.adTitle ?? '—'],
                        ['Impressions', selectedTile.views ?? '—'],
                        ['Interactions', selectedTile.clicks ?? '—'],
                      ]
                    : [['List Price', `₹${selectedTile.price}`]]),
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
                {selectedTile.type === 'ad' && (
                  <>
                    <button className="w-full py-2 rounded-lg border border-[#E03E4D]/30 text-[#E03E4D] text-xs font-['Outfit'] font-semibold hover:bg-[#E03E4D]/10 transition-all">
                      Suspend Space
                    </button>
                    <button className="w-full py-2 rounded-lg border border-black/8 text-muted-foreground text-xs font-['Outfit'] font-semibold hover:text-foreground transition-all">
                      View Campaign
                    </button>
                  </>
                )}
                {selectedTile.type === 'available' && (
                  <button className="w-full py-2 rounded-lg bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-semibold hover:bg-[#6B5EE6] transition-all">
                    Assign to Campaign
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <Layers size={32} className="text-muted-foreground/30" />
              <div className="text-sm text-muted-foreground font-['Outfit']">
                Click any space on the canvas to view its details
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

