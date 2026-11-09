import React, { useState } from 'react'
import { AlertTriangle, BarChart2, Bell, Clock, Eye, FileImage, Grid3X3, LayoutDashboard, LogOut, Megaphone, MousePointer, Settings, Target, UserCircle, Wallet } from 'lucide-react'
import type { Screen, StoredCampaign } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { CreativeImage } from '@/components/common/CreativeImage'
import { DASH_CAMPAIGNS } from '@/data/mock-data'

export function DashboardScreen({
  onNavigate,
  campaigns,
  onOpenCampaign,
}: {
  onNavigate: (s: Screen) => void
  campaigns: StoredCampaign[]
  onOpenCampaign: (campaign: StoredCampaign) => void
}) {
  const [activePage, setActivePage] = useState('overview')

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'campaigns', icon: Megaphone, label: 'Campaigns' },
    { id: 'spaces', icon: Grid3X3, label: 'My Ad Spaces' },
    { id: 'creatives', icon: FileImage, label: 'Creatives' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'payments', icon: Wallet, label: 'Payments' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: '3' },
    { id: 'profile', icon: UserCircle, label: 'Business Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-black/6 flex flex-col fixed top-0 bottom-0 left-0 z-40">
        <div className="p-6 border-b border-black/6">
          <PwLogo size="sm" />
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {sidebarItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-0.5 text-sm font-['Outfit'] font-medium transition-all ${activePage === id ? 'bg-[#6C5FE6]/15 text-[#6C5FE6]' : 'text-muted-foreground hover:text-foreground hover:bg-black/4'}`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="text-xs bg-[#6C5FE6] text-white px-1.5 py-0.5 rounded-full font-['JetBrains_Mono']">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-black/6">
          <button
            onClick={() => onNavigate('landing')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-['Outfit'] text-muted-foreground hover:text-foreground hover:bg-black/4 transition-all"
          >
            <LogOut size={16} /> Back to Canvas
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-black/6 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl">
          <div>
            <h1 className="font-['Outfit'] font-black text-2xl text-foreground">Overview</h1>
            <p className="text-sm text-muted-foreground font-['Inter']">
              Welcome back, Arjun — here&#39;s what&#39;s happening.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6C5FE6]" />
            </button>
            <PrimaryBtn small onClick={() => onNavigate('canvas')}>
              + New Campaign
            </PrimaryBtn>
          </div>
        </header>

        <div className="p-8">
          {campaigns.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="font-['Outfit'] text-xl font-black text-foreground">
                    Saved Payload Drafts
                  </h2>
                  <p className="font-['Inter'] text-sm text-muted-foreground">
                    These campaigns and creatives persist across devices and sessions.
                  </p>
                </div>
                <Badge color="purple">{campaigns.length} drafts</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => onOpenCampaign(campaign)}
                    className="overflow-hidden rounded-2xl border border-black/6 bg-card text-left transition-all hover:border-[#6C5FE6]/30 hover:shadow-lg"
                  >
                    <div className="relative aspect-video bg-[#EDF0F8]">
                      <CreativeImage campaign={campaign} sizes="(max-width: 1200px) 33vw, 360px" />
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase text-[#6C5FE6] backdrop-blur">
                        {campaign.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="font-['Outfit'] text-sm font-bold text-foreground">
                        {campaign.name}
                      </div>
                      <div className="mt-1 font-['Inter'] text-xs text-muted-foreground">
                        {campaign.brandName} · {campaign.width} × {campaign.height}px
                      </div>
                      <div className="mt-3 font-['Outfit'] text-xs font-semibold text-[#6C5FE6]">
                        Open campaign →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Active Campaigns', value: '3', icon: Megaphone, accent: true },
              { label: 'Pending Approval', value: '1', icon: Clock },
              { label: 'Expiring Soon', value: '1', icon: AlertTriangle },
              { label: 'Total Impressions', value: '170.6K', icon: Eye },
              { label: 'Ad Interactions', value: '13.1K', icon: MousePointer },
              { label: 'CTA Clicks', value: '4,820', icon: Target },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border p-4 ${s.accent ? 'border-[#6C5FE6]/20 bg-[#6C5FE6]/8' : 'border-black/6 bg-card'}`}
              >
                <s.icon
                  size={16}
                  className={`mb-2 ${s.accent ? 'text-[#6C5FE6]' : 'text-muted-foreground'}`}
                />
                <div
                  className={`text-2xl font-['Outfit'] font-black ${s.accent ? 'text-[#6C5FE6]' : 'text-foreground'}`}
                >
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="rounded-2xl border border-black/6 bg-card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-['Outfit'] font-bold text-lg text-foreground">
                  Impressions Over Time
                </h3>
                <p className="text-sm text-muted-foreground font-['Inter']">
                  Last 30 days across all campaigns
                </p>
              </div>
              <div className="flex gap-2">
                {['7D', '30D', '90D'].map((t) => (
                  <button
                    key={t}
                    className={`px-3 py-1 rounded-lg text-xs font-['Outfit'] font-semibold ${t === '30D' ? 'bg-[#6C5FE6] text-white' : 'bg-black/5 text-muted-foreground hover:text-foreground'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Simple bar chart */}
            <div className="flex items-end gap-1.5 h-32">
              {[
                42, 68, 55, 82, 94, 76, 88, 102, 115, 98, 124, 108, 132, 95, 110, 128, 140, 118,
                145, 132, 155, 148, 162, 138, 175, 168, 182, 158, 170, 185,
              ].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-[#6C5FE6]/40 hover:bg-[#6C5FE6]/70 transition-colors"
                  style={{ height: `${(v / 185) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Campaigns table */}
          <div className="rounded-2xl border border-black/6 bg-card overflow-hidden mb-8">
            <div className="flex items-center justify-between p-6 border-b border-black/6">
              <h3 className="font-['Outfit'] font-bold text-lg text-foreground">My Campaigns</h3>
              <PrimaryBtn small onClick={() => onNavigate('canvas')}>
                + New Campaign
              </PrimaryBtn>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5">
                    {[
                      'Campaign',
                      'City / Canvas',
                      'Status',
                      'Dates',
                      'Impressions',
                      'Interactions',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-xs font-['JetBrains_Mono'] text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DASH_CAMPAIGNS.map((c) => (
                    <tr
                      key={c.name}
                      className="border-b border-black/4 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                            style={{ background: `${c.color}20` }}
                          >
                            {c.emoji}
                          </div>
                          <span className="font-['Outfit'] font-semibold text-sm text-foreground">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground font-['Outfit']">{c.city}</div>
                        <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                          {c.canvas}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          color={
                            c.status === 'active'
                              ? 'teal'
                              : c.status === 'pending'
                                ? 'purple'
                                : 'amber'
                          }
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                          {c.start} → {c.expiry}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: c.days <= 5 ? '#F59E0B' : '#6B7491' }}
                        >
                          {c.days} days left
                        </div>
                      </td>
                      <td className="px-6 py-4 font-['Outfit'] font-semibold text-sm text-foreground">
                        {c.impressions}
                      </td>
                      <td className="px-6 py-4 font-['Outfit'] font-semibold text-sm text-foreground">
                        {c.interactions}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/6 text-xs font-['Outfit'] text-muted-foreground hover:text-foreground transition-all">
                            Analytics
                          </button>
                          {c.status === 'expiring' && (
                            <button
                              onClick={() => onNavigate('expiring')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-xs font-['Outfit'] text-amber-400 transition-all"
                            >
                              Renew
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ad Space thumbnails */}
          <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-4">My Ad Spaces</h3>
          <div className="grid grid-cols-3 gap-4">
            {DASH_CAMPAIGNS.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl border border-black/6 bg-card overflow-hidden"
              >
                <div
                  className="aspect-video flex items-center justify-center text-4xl"
                  style={{ background: `${c.color}18` }}
                >
                  {c.emoji}
                </div>
                <div className="p-4">
                  <div className="font-['Outfit'] font-semibold text-sm text-foreground">
                    {c.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                    {c.city} · Expires {c.expiry}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Badge
                      color={
                        c.status === 'active' ? 'teal' : c.status === 'pending' ? 'purple' : 'amber'
                      }
                    >
                      {c.status}
                    </Badge>
                    {c.status === 'expiring' && (
                      <button
                        onClick={() => onNavigate('expiring')}
                        className="text-xs text-amber-400 font-['Outfit'] font-semibold hover:text-amber-300"
                      >
                        Renew →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

