import React, { useState } from 'react'
import {
  ArrowLeft,
  Search,
  MapPin,
  ChevronRight,
  TrendingUp,
  Shield,
  Users,
  Eye,
  Plus,
} from 'lucide-react'
import type { Screen } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { INDIA_CITIES } from '@/data/mock-data'

export function CountryScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <PwLogo />
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground font-['Outfit']">
          <button className="hover:text-foreground transition-colors">World</button>
          <ChevronRight size={14} />
          <span className="text-foreground font-semibold">India</span>
        </nav>
        <div className="flex items-center gap-3">
          <PrimaryBtn small onClick={() => onNavigate('canvas')}>
            Post Your Ad
          </PrimaryBtn>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm font-['Outfit']"
            >
              <ArrowLeft size={16} /> Back to World Map
            </button>
            <div className="flex items-center gap-4">
              <div className="text-5xl">🇮🇳</div>
              <div>
                <h1 className="font-['Outfit'] font-black text-5xl text-foreground leading-tight">
                  India
                </h1>
                <p className="text-muted-foreground font-['Inter'] mt-1">
                  Choose a city to explore its advertising canvas
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                placeholder="Search city, business or ad..."
                className="bg-card border border-black/8 rounded-xl pl-9 pr-4 py-2.5 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50 w-72"
              />
            </div>
          </div>
        </div>

        {/* Country stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Active Ads"
            value="12,450"
            sub="↑ 18% this week"
            icon={Megaphone}
            accent
          />
          <StatCard label="Available Spaces" value="4,820" icon={Grid3X3} />
          <StatCard label="Total Advertisers" value="8,234" icon={Users} />
          <StatCard
            label="Avg. Daily Impressions"
            value="2.4M"
            sub="across all canvases"
            icon={Eye}
          />
        </div>

        {/* City grid */}
        <h2 className="font-['Outfit'] font-bold text-2xl text-foreground mb-6">Top Cities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {INDIA_CITIES.map((city) => (
            <div
              key={city.name}
              className="rounded-2xl border border-black/6 bg-card hover:border-[#6C5FE6]/30 hover:bg-[#6C5FE6]/5 transition-all cursor-pointer group p-6"
              onClick={() => onNavigate('canvas')}
            >
              <div className="text-3xl mb-4">{city.icon}</div>
              <h3 className="font-['Outfit'] font-bold text-xl text-foreground mb-4">
                {city.name}
              </h3>
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                    Active Ads
                  </span>
                  <span className="text-sm font-['Outfit'] font-bold text-[#6C5FE6]">
                    {city.ads.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                    Space Available
                  </span>
                  <span className="text-sm font-['Outfit'] font-bold text-[#00A882]">
                    {city.available}%
                  </span>
                </div>
              </div>
              {/* Occupancy bar */}
              <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6C5FE6] to-[#00A882]"
                  style={{ width: `${city.occupancy}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{city.occupancy}% occupied</span>
                <button className="flex items-center gap-1 text-xs text-[#6C5FE6] font-['Outfit'] font-semibold group-hover:gap-2 transition-all">
                  Explore <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Premium banner */}
        <div className="mt-10 rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center">
              <Star size={18} className="text-[#F59E0B]" />
            </div>
            <div>
              <div className="font-['Outfit'] font-bold text-foreground">
                Premium Canvas Spaces Available in Mumbai & Delhi
              </div>
              <div className="text-sm text-muted-foreground">
                High-traffic zones with 2.8M+ monthly impressions
              </div>
            </div>
          </div>
          <PrimaryBtn small>View Premium Spaces</PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

