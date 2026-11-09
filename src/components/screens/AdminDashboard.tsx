import React, { useState } from 'react'
import { Activity, AlertTriangle, Bell, BookOpen, Building2, ChevronRight, Clock, CreditCard, DollarSign, FileImage, Grid3X3, Layers, LayoutDashboard, LogOut, MapPin, Megaphone, MoreHorizontal, Settings, Shield, Users } from 'lucide-react'
import type { Screen } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'

export function AdminDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activePage, setActivePage] = useState('overview')

  const adminNav = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'advertisers', icon: Building2, label: 'Advertisers' },
    { id: 'ads', icon: FileImage, label: 'Ads & Creatives' },
    { id: 'campaigns', icon: Megaphone, label: 'Campaigns' },
    {
      id: 'canvas',
      icon: Layers,
      label: 'Canvas Management',
      action: () => onNavigate('admin-canvas'),
    },
    { id: 'locations', icon: MapPin, label: 'Locations' },
    {
      id: 'moderation',
      icon: Shield,
      label: 'Moderation',
      action: () => onNavigate('admin-mod'),
      badge: '23',
    },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'pricing', icon: DollarSign, label: 'Pricing' },
    { id: 'analytics', icon: Activity, label: 'Analytics' },
    { id: 'audit', icon: BookOpen, label: 'Audit Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const metrics = [
    {
      label: 'Total Users',
      value: '248,120',
      change: '+1,240 today',
      icon: Users,
      color: '#6C5FE6',
    },
    {
      label: 'Active Advertisers',
      value: '42,830',
      change: '+380 this week',
      icon: Building2,
      color: '#00A882',
    },
    {
      label: 'Active Campaigns',
      value: '128,440',
      change: '+920 today',
      icon: Megaphone,
      color: '#EC4899',
    },
    {
      label: 'Pending Ad Reviews',
      value: '23',
      change: 'Action required',
      icon: Clock,
      color: '#F59E0B',
    },
    {
      label: 'Expiring This Week',
      value: '45',
      change: 'Need attention',
      icon: AlertTriangle,
      color: '#E03E4D',
    },
    {
      label: 'Canvas Occupancy',
      value: '68%',
      change: 'Across all cities',
      icon: Grid3X3,
      color: '#6C5FE6',
    },
    {
      label: 'Monthly Revenue',
      value: '₹8.4M',
      change: '+22% vs last month',
      icon: DollarSign,
      color: '#00A882',
    },
    {
      label: 'Failed Payments',
      value: '12',
      change: 'Retry pending',
      icon: AlertTriangle,
      color: '#E03E4D',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex">
      {/* Admin sidebar — slightly different tint */}
      <aside className="w-60 bg-[#FAFBFF] border-r border-black/5 flex flex-col fixed top-0 bottom-0 left-0 z-40">
        <div className="p-5 border-b border-black/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E03E4D]/20 flex items-center justify-center">
              <Shield size={14} className="text-[#E03E4D]" />
            </div>
            <div>
              <div className="font-['Outfit'] font-black text-sm text-foreground">PixelWorld</div>
              <div className="font-['JetBrains_Mono'] text-xs text-[#E03E4D]">Admin Console</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {adminNav.map(({ id, icon: Icon, label, badge, action }) => (
            <button
              key={id}
              onClick={action || (() => setActivePage(id))}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-['Outfit'] font-medium transition-all ${activePage === id ? 'bg-[#E03E4D]/12 text-[#E03E4D]' : 'text-muted-foreground hover:text-foreground hover:bg-black/3'}`}
            >
              <Icon size={15} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="text-xs bg-[#E03E4D] text-white px-1.5 py-0.5 rounded-full font-['JetBrains_Mono']">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-black/5">
          <button
            onClick={() => onNavigate('landing')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-black/3 transition-all font-['Outfit']"
          >
            <LogOut size={15} /> Exit Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl">
          <div>
            <h1 className="font-['Outfit'] font-black text-2xl text-foreground">
              Admin Control Center
            </h1>
            <p className="text-sm text-muted-foreground font-['JetBrains_Mono']">
              21 Jul 2025 · 09:42 IST
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-muted-foreground hover:text-foreground">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#E03E4D]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#E03E4D]/20 flex items-center justify-center text-xs font-bold text-[#E03E4D] font-['Outfit']">
              SA
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Metrics grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-black/5 bg-[#F0F2F9] p-5">
                <div className="flex items-center justify-between mb-3">
                  <m.icon size={16} style={{ color: m.color }} />
                  <MoreHorizontal size={14} className="text-muted-foreground" />
                </div>
                <div className="text-2xl font-['Outfit'] font-black text-foreground">{m.value}</div>
                <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                  {m.label}
                </div>
                <div className="text-xs mt-1.5" style={{ color: m.color }}>
                  {m.change}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Geographic overview */}
            <div className="col-span-2 rounded-2xl border border-black/5 bg-[#F0F2F9] p-6">
              <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
                Performance by City
              </h3>
              {[
                { city: 'Mumbai', ads: 3420, rev: '₹2.1M', occ: 82 },
                { city: 'Delhi', ads: 2890, rev: '₹1.8M', occ: 79 },
                { city: 'Bangalore', ads: 2180, rev: '₹1.4M', occ: 76 },
                { city: 'Chennai', ads: 1245, rev: '₹0.8M', occ: 62 },
                { city: 'Hyderabad', ads: 1560, rev: '₹1.0M', occ: 59 },
              ].map((c) => (
                <div
                  key={c.city}
                  className="flex items-center gap-4 py-2.5 border-b border-black/4 last:border-0"
                >
                  <div className="w-24 font-['Outfit'] font-semibold text-sm text-foreground">
                    {c.city}
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6C5FE6] to-[#00A882]"
                      style={{ width: `${c.occ}%` }}
                    />
                  </div>
                  <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground w-8">
                    {c.occ}%
                  </div>
                  <div className="text-xs font-['JetBrains_Mono'] text-[#00A882] w-16 text-right">
                    {c.rev}
                  </div>
                </div>
              ))}
            </div>

            {/* Action required */}
            <div className="rounded-2xl border border-black/5 bg-[#F0F2F9] p-6">
              <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
                Action Required
              </h3>
              {[
                {
                  label: 'Ads Pending Review',
                  count: 23,
                  color: '#F59E0B',
                  action: 'admin-mod' as Screen,
                },
                {
                  label: 'Failed Payments',
                  count: 12,
                  color: '#E03E4D',
                  action: 'admin' as Screen,
                },
                {
                  label: 'Ads Expiring Today',
                  count: 45,
                  color: '#EC4899',
                  action: 'admin' as Screen,
                },
                {
                  label: 'User Reports',
                  count: 3,
                  color: '#E03E4D',
                  action: 'admin-mod' as Screen,
                },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => onNavigate(a.action)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/4 transition-all mb-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                    <span className="text-sm font-['Outfit'] text-foreground">{a.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-['Outfit'] font-black text-sm" style={{ color: a.color }}>
                      {a.count}
                    </span>
                    <ChevronRight size={12} className="text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

