import React, { useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileImage,
  Grid3X3,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  MoreHorizontal,
  Settings,
  Shield,
  Users,
  Loader2,
} from 'lucide-react'
import type { Screen } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { previewAuthorizationHeaders } from '@/lib/session'

export function AdminDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activePage, setActivePage] = useState('overview')
  const [stats, setStats] = useState<{
    totalUsers: number
    activeAdvertisers: number
    totalCampaigns: number
    activeCampaigns: number
    pendingReviews: number
    expiringThisWeek: number
    occupancyRate: string
    monthlyRevenue: string
    failedPayments: number
    cityPerformance: Array<{ city: string; ads: number; rev: string; occ: number }>
  }>({
    totalUsers: 1,
    activeAdvertisers: 1,
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingReviews: 0,
    expiringThisWeek: 0,
    occupancyRate: '0%',
    monthlyRevenue: '₹0',
    failedPayments: 0,
    cityPerformance: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats', {
      credentials: 'include',
      headers: previewAuthorizationHeaders(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stats) {
          setStats(data.stats)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
      badge: stats.pendingReviews > 0 ? stats.pendingReviews.toString() : undefined,
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
      value: stats.totalUsers.toLocaleString(),
      change: 'Real active accounts',
      icon: Users,
      color: '#6C5FE6',
    },
    {
      label: 'Active Advertisers',
      value: stats.activeAdvertisers.toLocaleString(),
      change: 'Registered advertisers',
      icon: Building2,
      color: '#00A882',
    },
    {
      label: 'Active Campaigns',
      value: stats.activeCampaigns.toLocaleString(),
      change: 'Serving live impressions',
      icon: Megaphone,
      color: '#EC4899',
    },
    {
      label: 'Pending Ad Reviews',
      value: stats.pendingReviews.toLocaleString(),
      change: stats.pendingReviews > 0 ? 'Action required' : 'All clear',
      icon: Clock,
      color: stats.pendingReviews > 0 ? '#F59E0B' : '#00A882',
    },
    {
      label: 'Expiring This Week',
      value: stats.expiringThisWeek.toLocaleString(),
      change: 'Needs renewal check',
      icon: AlertTriangle,
      color: '#E03E4D',
    },
    {
      label: 'Canvas Occupancy',
      value: stats.occupancyRate,
      change: 'Across active canvas',
      icon: Grid3X3,
      color: '#6C5FE6',
    },
    {
      label: 'Total Revenue',
      value: stats.monthlyRevenue,
      change: 'Settled via UPI',
      icon: DollarSign,
      color: '#00A882',
    },
    {
      label: 'Failed Payments',
      value: stats.failedPayments.toLocaleString(),
      change: stats.failedPayments === 0 ? 'Zero failures' : 'Review needed',
      icon: AlertTriangle,
      color: stats.failedPayments === 0 ? '#00A882' : '#E03E4D',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex">
      {/* Admin sidebar */}
      <aside className="w-60 bg-[#FAFBFF] border-r border-black/5 flex flex-col fixed top-0 bottom-0 left-0 z-40">
        <div className="p-5 border-b border-black/5">
          <div className="flex items-center gap-2">
            <PwLogo size="sm" />
            <Badge color="purple">Admin Portal</Badge>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {adminNav.map(({ id, icon: Icon, label, action, badge }) => (
            <button
              key={id}
              onClick={() => (action ? action() : setActivePage(id))}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-0.5 text-sm font-['Outfit'] font-medium transition-all cursor-pointer ${
                activePage === id
                  ? 'bg-[#E03E4D]/15 text-[#E03E4D]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/4'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="text-xs bg-[#F59E0B] text-white px-1.5 py-0.5 rounded-full font-['JetBrains_Mono']">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-black/5">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-['Outfit'] text-muted-foreground hover:text-foreground hover:bg-black/4 transition-all cursor-pointer"
          >
            <LogOut size={16} /> Exit to Advertiser App
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl">
          <div>
            <h1 className="font-['Outfit'] font-black text-2xl text-foreground">
              Admin Control Panel
            </h1>
            <p className="text-sm text-muted-foreground font-['Inter']">
              Live operational metrics connected directly to Supabase PostgreSQL.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin-mod')}
              className="px-3.5 py-1.5 rounded-xl bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-amber-700 text-xs font-['Outfit'] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Shield size={14} /> Moderation Queue ({stats.pendingReviews})
            </button>
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-3.5 py-1.5 rounded-xl bg-black/5 hover:bg-black/8 text-foreground text-xs font-['Outfit'] font-semibold cursor-pointer"
            >
              Advertiser View →
            </button>
          </div>
        </header>

        <div className="p-8">
          {loading ? (
            <div className="flex items-center justify-center py-24 text-muted-foreground gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span className="text-sm font-['Outfit']">Loading real-time stats...</span>
            </div>
          ) : (
            <>
              {/* Metrics grid */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {metrics.map((m) => (
                  <div key={m.label} className="rounded-2xl border border-black/5 bg-[#F0F2F9] p-5">
                    <div className="flex items-center justify-between mb-3">
                      <m.icon size={16} style={{ color: m.color }} />
                      <MoreHorizontal size={14} className="text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-['Outfit'] font-black text-foreground">
                      {m.value}
                    </div>
                    <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                      {m.label}
                    </div>
                    <div className="text-xs mt-1.5 font-['Inter']" style={{ color: m.color }}>
                      {m.change}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Geographic overview */}
                <div className="col-span-2 rounded-2xl border border-black/5 bg-[#F0F2F9] p-6">
                  <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
                    Live Performance by City
                  </h3>
                  {stats.cityPerformance.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      No city bookings recorded yet.
                    </div>
                  ) : (
                    stats.cityPerformance.map((c) => (
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
                            style={{ width: `${Math.max(5, c.occ)}%` }}
                          />
                        </div>
                        <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground w-12">
                          {c.occ}% occ
                        </div>
                        <div className="text-xs font-['JetBrains_Mono'] text-[#00A882] w-20 text-right">
                          {c.rev}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Action required */}
                <div className="rounded-2xl border border-black/5 bg-[#F0F2F9] p-6">
                  <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
                    Action Required
                  </h3>
                  {[
                    {
                      label: 'Ads Pending Review',
                      count: stats.pendingReviews,
                      color: stats.pendingReviews > 0 ? '#F59E0B' : '#00A882',
                      action: 'admin-mod' as Screen,
                    },
                    {
                      label: 'Failed Payments',
                      count: stats.failedPayments,
                      color: stats.failedPayments === 0 ? '#00A882' : '#E03E4D',
                      action: 'admin' as Screen,
                    },
                    {
                      label: 'Expiring This Week',
                      count: stats.expiringThisWeek,
                      color: stats.expiringThisWeek === 0 ? '#00A882' : '#EC4899',
                      action: 'admin' as Screen,
                    },
                  ].map((a) => (
                    <button
                      key={a.label}
                      onClick={() => onNavigate(a.action)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/4 transition-all mb-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                        <span className="text-sm font-['Outfit'] text-foreground">{a.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-['Outfit'] font-black text-sm"
                          style={{ color: a.color }}
                        >
                          {a.count}
                        </span>
                        <ChevronRight size={12} className="text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
