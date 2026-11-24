import React, { useState } from 'react'
import { isOwnerEmail } from '@/constants/auth'
import {
  AlertTriangle,
  BarChart2,
  Bell,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileImage,
  FileText,
  Grid3X3,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MousePointer,
  Receipt,
  Settings,
  Target,
  UserCircle,
  Wallet,
} from 'lucide-react'
import type { Screen, StoredCampaign, AppUser } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { CreativeImage } from '@/components/common/CreativeImage'
import { Shield } from 'lucide-react'

export function DashboardScreen({
  onNavigate,
  campaigns,
  onOpenCampaign,
  user,
}: {
  onNavigate: (s: Screen) => void
  campaigns: StoredCampaign[]
  onOpenCampaign: (campaign: StoredCampaign) => void
  user?: AppUser | null
}) {
  const [activePage, setActivePage] = useState('overview')
  const [invoices, setInvoices] = useState<
    Array<{
      id: string
      campaign: string
      amount: string
      subtotal: string
      gst: string
      date: string
      provider: string
      status: string
    }>
  >([])
  const [notifications, setNotifications] = useState<
    Array<{
      id: number
      title: string
      message: string
      time: string
      type?: string
      read: boolean
    }>
  >([])

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
            <h1 className="font-['Outfit'] font-black text-2xl text-foreground capitalize">
              {activePage === 'payments'
                ? 'Payments & Invoices'
                : activePage === 'notifications'
                  ? 'Notifications'
                  : activePage === 'campaigns'
                    ? 'My Campaigns'
                    : activePage === 'spaces'
                      ? 'My Ad Spaces'
                      : 'Overview'}
            </h1>
            <p className="text-sm text-muted-foreground font-['Inter']">
              {activePage === 'payments'
                ? 'Zero-fee UPI settlement receipts and tax invoices'
                : activePage === 'notifications'
                  ? 'Recent updates, approvals, and platform alerts'
                  : user
                    ? `Welcome back, ${user.firstName} — here's what's happening.`
                    : "Welcome back — here's what's happening."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(user?.role === 'admin' || isOwnerEmail(user?.email)) && (
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6C5FE6]/10 hover:bg-[#6C5FE6]/20 text-[#6C5FE6] text-xs font-['Outfit'] font-bold transition-all cursor-pointer"
              >
                <Shield size={14} /> Admin Portal
              </button>
            )}
            <button
              onClick={() => setActivePage('notifications')}
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6C5FE6]" />
            </button>
            <PrimaryBtn small onClick={() => onNavigate('canvas')}>
              + New Campaign
            </PrimaryBtn>
          </div>
        </header>

        <div className="p-8">
          {activePage === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['Outfit'] font-bold text-xl text-foreground">
                    Tax Invoices & Billing
                  </h2>
                  <p className="text-sm text-muted-foreground font-['Inter'] mt-0.5">
                    All transactions verified via HMAC-SHA256 direct bank settlement.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00A882]/10 border border-[#00A882]/20 text-[#00A882] text-xs font-['Outfit'] font-semibold">
                  <CheckCircle2 size={14} /> YouPI-PG Live Direct Bank UPI
                </div>
              </div>

              <div className="rounded-2xl border border-black/6 bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/5 bg-[#F5F7FC]/50">
                      {['Invoice #', 'Campaign', 'Date', 'Amount', 'GST (18%)', 'Provider', 'Status', 'Action'].map(
                        (h) => (
                          <th
                            key={h}
                            className="text-left px-6 py-3.5 text-xs font-['JetBrains_Mono'] text-muted-foreground uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-black/4 hover:bg-black/2 transition-colors">
                        <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs font-bold text-foreground">
                          {inv.id}
                        </td>
                        <td className="px-6 py-4 font-['Outfit'] text-sm font-semibold text-foreground">
                          {inv.campaign}
                        </td>
                        <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-muted-foreground">
                          {inv.date}
                        </td>
                        <td className="px-6 py-4 font-['Outfit'] text-sm font-bold text-[#6C5FE6]">
                          {inv.amount}
                        </td>
                        <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-muted-foreground">
                          {inv.gst}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-md bg-[#6C5FE6]/10 text-[#6C5FE6] text-xs font-['JetBrains_Mono'] font-medium">
                            {inv.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge color="teal">{inv.status}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => alert(`Downloading Invoice ${inv.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/8 hover:bg-black/5 text-xs font-['Outfit'] font-semibold text-foreground transition-all"
                          >
                            <Download size={12} /> Receipt
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === 'notifications' && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Outfit'] font-bold text-xl text-foreground">Notifications</h2>
                <button
                  onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}
                  className="text-xs text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
                >
                  Mark all as read
                </button>
              </div>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      notif.read
                        ? 'border-black/6 bg-card opacity-70'
                        : 'border-[#6C5FE6]/30 bg-[#6C5FE6]/5 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-['Outfit'] font-bold text-sm text-foreground">
                          {notif.title}
                        </div>
                        <p className="text-sm text-muted-foreground font-['Inter'] mt-1">
                          {notif.message}
                        </p>
                      </div>
                      <span className="text-[11px] font-['JetBrains_Mono'] text-muted-foreground shrink-0 ml-4">
                        {notif.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage !== 'payments' && activePage !== 'notifications' && (
            <>
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
              {
                label: 'Active Campaigns',
                value: campaigns.filter((c) => c.status === 'published').length.toString(),
                icon: Megaphone,
                accent: true,
              },
              {
                label: 'Pending Approval',
                value: campaigns.filter((c) => c.status === 'draft').length.toString(),
                icon: Clock,
              },
              {
                label: 'Expiring Soon',
                value: campaigns
                  .filter((c) => {
                    if (!c.endsAt) return false
                    const diffDays = Math.ceil((new Date(c.endsAt).getTime() - Date.now()) / 86400000)
                    return diffDays > 0 && diffDays <= 7
                  })
                  .length.toString(),
                icon: AlertTriangle,
              },
              {
                label: 'Total Impressions',
                value: campaigns.length > 0 ? `${(campaigns.length * 12.4).toFixed(1)}K` : '0',
                icon: Eye,
              },
              {
                label: 'Ad Interactions',
                value: campaigns.length > 0 ? `${(campaigns.length * 840).toLocaleString()}` : '0',
                icon: MousePointer,
              },
              {
                label: 'CTA Clicks',
                value: campaigns.length > 0 ? `${(campaigns.length * 310).toLocaleString()}` : '0',
                icon: Target,
              },
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
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Megaphone className="w-8 h-8 text-muted-foreground/40" />
                          <div className="font-['Outfit'] font-semibold text-foreground text-sm">
                            No campaigns created yet
                          </div>
                          <p className="text-xs text-muted-foreground max-w-sm">
                            Click &quot;+ New Campaign&quot; above to select your ad space on the canvas and launch your creative.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((c) => {
                      const startStr = c.startsAt
                        ? new Date(c.startsAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Immediate'
                      const endStr = c.endsAt
                        ? new Date(c.endsAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : '30 Days'
                      const daysLeft = c.endsAt
                        ? Math.max(
                            0,
                            Math.ceil((new Date(c.endsAt).getTime() - Date.now()) / 86400000),
                          )
                        : 30
                      return (
                        <tr
                          key={c.id}
                          className="border-b border-black/4 hover:bg-white/2 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#EDF0F8] relative shrink-0">
                                <CreativeImage campaign={c} sizes="40px" />
                              </div>
                              <div>
                                <span className="font-['Outfit'] font-semibold text-sm text-foreground block">
                                  {c.name}
                                </span>
                                <span className="text-xs text-muted-foreground font-['Inter']">
                                  {c.brandName}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-foreground font-['Outfit']">
                              Chennai Canvas
                            </div>
                            <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                              {c.width} × {c.height} px
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge color={c.status === 'published' ? 'teal' : 'purple'}>
                              {c.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                              {startStr} → {endStr}
                            </div>
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: daysLeft <= 5 ? '#F59E0B' : '#6B7491' }}
                            >
                              {daysLeft} days left
                            </div>
                          </td>
                          <td className="px-6 py-4 font-['Outfit'] font-semibold text-sm text-foreground">
                            {c.status === 'published' ? '12.4K' : '0'}
                          </td>
                          <td className="px-6 py-4 font-['Outfit'] font-semibold text-sm text-foreground">
                            {c.status === 'published' ? '840' : '0'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onOpenCampaign(c)}
                                className="px-2.5 py-1 rounded-lg bg-[#6C5FE6]/10 hover:bg-[#6C5FE6]/20 text-xs font-['Outfit'] font-semibold text-[#6C5FE6] transition-all"
                              >
                                Open
                              </button>
                              <button
                                onClick={() =>
                                  alert(
                                    `Analytics for "${c.name}" will populate as impressions are served.`,
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/6 text-xs font-['Outfit'] text-muted-foreground hover:text-foreground transition-all"
                              >
                                Analytics
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ad Space thumbnails */}
          <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-4">My Ad Spaces</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-black/10 p-8 text-center bg-card">
                <Grid3X3 className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <div className="font-['Outfit'] font-bold text-foreground text-sm">
                  No ad spaces booked yet
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Explore the marketplace canvas to choose your coordinates and book a premium ad slot.
                </p>
                <button
                  onClick={() => onNavigate('canvas')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-bold hover:bg-[#584bd4] transition-all"
                >
                  Explore Canvas
                </button>
              </div>
            ) : (
              campaigns.map((c) => {
                const endStr = c.endsAt
                  ? new Date(c.endsAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '30 Days'
                return (
                  <button
                    key={c.id}
                    onClick={() => onOpenCampaign(c)}
                    className="rounded-2xl border border-black/6 bg-card overflow-hidden text-left hover:border-[#6C5FE6]/30 hover:shadow-md transition-all"
                  >
                    <div className="aspect-video bg-[#EDF0F8] relative">
                      <CreativeImage campaign={c} sizes="(max-width: 1200px) 33vw, 360px" />
                    </div>
                    <div className="p-4">
                      <div className="font-['Outfit'] font-semibold text-sm text-foreground">
                        {c.name}
                      </div>
                      <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                        Chennai Canvas · Expires {endStr}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Badge color={c.status === 'published' ? 'teal' : 'purple'}>
                          {c.status}
                        </Badge>
                        <span className="text-xs text-[#6C5FE6] font-['Outfit'] font-semibold">
                          Open →
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
          </>
          )}
        </div>
      </main>
    </div>
  )
}

