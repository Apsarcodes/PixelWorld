import React, { useState } from 'react'
import {
  Globe,
  Search,
  ChevronRight,
  Zap,
  TrendingUp,
  MapPin,
  Eye,
  MousePointer,
  ArrowRight,
  Sparkles,
  Shield,
  Layers,
  Activity,
  Star,
  Users,
  Megaphone,
} from 'lucide-react'
import type { Screen } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge, StatCard } from '@/components/common/UIComponents'
import { WorldMap } from '@/components/common/WorldMap'

export function LandingScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #6C5FE6 0%, #00A882 50%, #EC4899 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[rgba(245,247,252,0.85)] backdrop-blur-xl border-b border-black/5">
        <PwLogo />
        <nav className="hidden md:flex items-center gap-7">
          <button
            onClick={() => onNavigate('canvas')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-['Outfit'] font-medium"
          >
            Live Canvas
          </button>
          <button
            onClick={() => onNavigate('country')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-['Outfit'] font-medium"
          >
            Indian Metros
          </button>
          <button
            onClick={() => {
              const el = document.getElementById('pricing-section')
              if (el) el.scrollIntoView({ behavior: 'smooth' })
            }}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-['Outfit'] font-medium"
          >
            Pricing
          </button>
        </nav>
        <div className="flex items-center gap-3">
          <GhostBtn small onClick={() => onNavigate('login')}>
            Sign In
          </GhostBtn>
          <PrimaryBtn small onClick={() => onNavigate('signup')}>
            Sign Up
          </PrimaryBtn>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-8 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#6C5FE6]/12 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-[#00A882]/10 blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-[#EC4899]/8 blur-[100px]" />
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-[#6C5FE6]/30 bg-[#6C5FE6]/10">
          <Sparkles size={14} className="text-[#6C5FE6]" />
          <span className="text-xs font-['Outfit'] font-semibold text-[#6C5FE6]">
            8 Metros across India · Real-time Canvas Billboards · Instant UPI Booking
          </span>
        </div>

        <h1 className="text-center font-['Outfit'] font-black text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight max-w-4xl mb-6">
          <span className="text-foreground">Own Your Space.</span>
          <br />
          <span className="gradient-text">Get Discovered.</span>
        </h1>

        <p className="text-center text-lg text-muted-foreground max-w-xl mb-10 font-['Inter'] leading-relaxed">
          Rent interactive digital advertising space and put your brand on India&#39;s premier visual
          canvas. Location-based. Interactive. Unforgettable.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <PrimaryBtn onClick={() => onNavigate('country')} className="text-base px-8 py-4">
            <Globe size={18} />
            Explore Indian Metros
          </PrimaryBtn>
          <GhostBtn onClick={() => onNavigate('create-ad')} className="text-base px-8 py-4">
            <Megaphone size={18} />
            Post Your Ad
          </GhostBtn>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-8 mt-12 py-5 px-8 rounded-2xl bg-card border border-black/6 flex-wrap justify-center">
          {[
            { v: '8 Metros', l: 'Across India' },
            { v: '100% Real-time', l: 'Dynamic Canvas' },
            { v: 'Direct UPI', l: 'Instant Booking' },
            { v: '99.9%', l: 'Canvas Uptime' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl font-['Outfit'] font-black text-[#6C5FE6]">{s.v}</div>
              <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* World Map section */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-['Outfit'] font-bold text-4xl text-foreground mb-3">
            Active Canvases Across India
          </h2>
          <p className="text-muted-foreground font-['Inter']">
            Click any metro city to explore its interactive advertising canvas
          </p>
        </div>

        <div className="rounded-3xl border border-black/6 bg-card p-6 shadow-2xl">
          <WorldMap onCountryClick={() => onNavigate('country')} />
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { city: '🏛️ Chennai', state: 'Tamil Nadu', trend: 'Live Canvas', color: '#6C5FE6' },
            { city: '🌊 Mumbai', state: 'Maharashtra', trend: 'Live Canvas', color: '#EC4899' },
            { city: '🌳 Bangalore', state: 'Karnataka', trend: 'Live Canvas', color: '#00A882' },
            { city: '🕌 Delhi NCR', state: 'Capital Region', trend: 'Live Canvas', color: '#F59E0B' },
          ].map((c) => (
            <div
              key={c.city}
              className="rounded-2xl border border-black/6 bg-card p-5 hover:border-black/10 transition-all cursor-pointer group"
              onClick={() => onNavigate('country')}
            >
              <div className="text-xl mb-2 font-['Outfit'] font-bold">{c.city}</div>
              <div className="text-sm font-['Outfit'] font-semibold text-muted-foreground mb-1">
                {c.state}
              </div>
              <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground">
                100 Canvas Slots
              </div>
              <div className="text-xs text-[#00A882] mt-2 font-['Outfit'] font-semibold">
                {c.trend} →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: MapPin,
              title: 'Location-Based Precision',
              desc: 'Target audiences exactly where they are. Place ads in specific cities, neighborhoods, and canvases that matter to your business.',
              color: '#6C5FE6',
            },
            {
              icon: Zap,
              title: 'Interactive Ads',
              desc: 'Not just images — your ads can have call buttons, WhatsApp links, website redirects, maps, and more built right in.',
              color: '#00A882',
            },
            {
              icon: TrendingUp,
              title: 'Real-Time Analytics',
              desc: 'Track views, interactions, CTA clicks, and engagement rate with a live dashboard updated every minute.',
              color: '#EC4899',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-black/6 bg-card p-8 hover:border-black/8 transition-all group"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${f.color}18` }}
              >
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 className="font-['Outfit'] font-bold text-xl text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground font-['Inter'] leading-relaxed text-sm">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#6C5FE6]/10 via-[#8B7FFA]/8 to-[#00A882]/10 border border-[#6C5FE6]/15 p-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 50%, #6C5FE6 0%, transparent 50%), radial-gradient(circle at 70% 50%, #00A882 0%, transparent 50%)',
            }}
          />
          <div className="relative">
            <h2 className="font-['Outfit'] font-black text-4xl text-foreground mb-4">
              Ready to stake your claim?
            </h2>
            <p className="text-muted-foreground mb-8 font-['Inter']">
              Join 42,000+ advertisers who have made PixelWord their digital home.
            </p>
            <PrimaryBtn
              onClick={() => onNavigate('canvas')}
              className="text-base px-10 py-4 mx-auto"
            >
              Start for Free <ArrowRight size={18} />
            </PrimaryBtn>
          </div>
        </div>
      </section>
    </div>
  )
}

