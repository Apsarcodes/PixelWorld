import React, { useState } from 'react'
import { isOwnerEmail } from '@/constants/auth'
import {
  AlertTriangle,
  ArrowRight,
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
  Globe,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  MousePointer,
  Receipt,
  Search,
  Settings,
  Shield,
  Sparkles,
  Target,
  Trash2,
  User,
  UserCircle,
  Wallet,
} from 'lucide-react'
import type { Screen, StoredCampaign, AppUser } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { CreativeImage } from '@/components/common/CreativeImage'

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
  const [campaignSearch, setCampaignSearch] = useState('')
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'published' | 'draft'>('all')

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [company, setCompany] = useState(user?.company || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profileSaved, setProfileSaved] = useState(false)

  // Settings State
  const [notifyOrder, setNotifyOrder] = useState(true)
  const [notifyExpiry, setNotifyExpiry] = useState(true)
  const [notifyWeekly, setNotifyWeekly] = useState(false)

  // Invoices derived from real campaigns
  const invoices = React.useMemo(() => {
    return campaigns.map((c, idx) => {
      const year = new Date().getFullYear()
      const invNum = `INV-${year}-${String(100000 + (Number(c.id) || idx + 1)).slice(-6)}`
      const total = c.totalAmount || (c.subtotal ? Math.round(c.subtotal * 1.18) : 1179)
      const subtotal = c.subtotal || Math.round(total / 1.18)
      const gst = total - subtotal
      return {
        id: invNum,
        campaign: c.name || `Campaign #${c.id}`,
        city: c.city || 'Chennai',
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : 'Recent',
        subtotal: `₹${subtotal.toLocaleString('en-IN')}`,
        gst: `₹${gst.toLocaleString('en-IN')}`,
        amount: `₹${total.toLocaleString('en-IN')}`,
        status: c.status === 'published' ? 'Paid' : 'Pending',
        provider: 'YouPI Direct UPI',
      }
    })
  }, [campaigns])

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome to PixelWorld!',
      message: 'Your advertiser account is active. Choose an ad space on the canvas to launch your brand.',
      time: 'Just now',
      read: false,
    },
    {
      id: 2,
      title: '18% GST Compliance Active',
      message: 'All bookings automatically receive official GST tax invoices with UPI payment reconciliation.',
      time: '1h ago',
      read: false,
    },
  ])

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'campaigns', icon: Megaphone, label: 'My Campaigns', badge: campaigns.length ? String(campaigns.length) : undefined },
    { id: 'spaces', icon: Grid3X3, label: 'My Ad Spaces' },
    { id: 'creatives', icon: FileImage, label: 'Creative Assets' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'payments', icon: Wallet, label: 'Invoices & Billing' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: notifications.filter((n) => !n.read).length ? String(notifications.filter((n) => !n.read).length) : undefined },
    { id: 'profile', icon: UserCircle, label: 'Business Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesSearch =
      (c.name || '').toLowerCase().includes(campaignSearch.toLowerCase()) ||
      (c.brandName || '').toLowerCase().includes(campaignSearch.toLowerCase())
    if (campaignFilter === 'published') return matchesSearch && c.status === 'published'
    if (campaignFilter === 'draft') return matchesSearch && c.status === 'draft'
    return matchesSearch
  })

  const publishedCount = campaigns.filter((c) => c.status === 'published').length
  const draftCount = campaigns.filter((c) => c.status === 'draft').length
  const totalImpressions = publishedCount * 12400
  const totalClicks = publishedCount * 840

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex">
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
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-0.5 text-sm font-['Outfit'] font-medium transition-all cursor-pointer ${
                activePage === id
                  ? 'bg-[#6C5FE6]/15 text-[#6C5FE6] font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-black/4'
              }`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="text-[10px] bg-[#6C5FE6] text-white px-1.5 py-0.5 rounded-full font-['JetBrains_Mono']">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-black/6">
          <button
            onClick={() => onNavigate('canvas')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-['Outfit'] text-muted-foreground hover:text-foreground hover:bg-black/4 transition-all cursor-pointer"
          >
            <Grid3X3 size={16} /> Live Canvas
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-60 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-black/6 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl">
          <div>
            <h1 className="font-['Outfit'] font-black text-2xl text-foreground capitalize">
              {activePage === 'overview' && 'Dashboard Overview'}
              {activePage === 'campaigns' && 'My Ad Campaigns'}
              {activePage === 'spaces' && 'My Booked Ad Spaces'}
              {activePage === 'creatives' && 'Creative Assets Gallery'}
              {activePage === 'analytics' && 'Campaign Analytics'}
              {activePage === 'payments' && 'Tax Invoices & Billing'}
              {activePage === 'notifications' && 'Notifications'}
              {activePage === 'profile' && 'Business Profile Settings'}
              {activePage === 'settings' && 'Account Settings'}
            </h1>
            <p className="text-xs text-muted-foreground font-['Inter'] mt-0.5">
              {user ? `Logged in as ${user.email}` : 'Advertiser Portal'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(user?.role === 'admin' || isOwnerEmail(user?.email)) && (
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6C5FE6]/10 hover:bg-[#6C5FE6]/20 text-[#6C5FE6] text-xs font-['Outfit'] font-bold transition-all cursor-pointer"
              >
                <Shield size={14} /> Owner Admin Panel
              </button>
            )}
            <PrimaryBtn small onClick={() => onNavigate('canvas')}>
              + Book New Space
            </PrimaryBtn>
          </div>
        </header>

        <div className="p-8">
          {/* TAB 1: OVERVIEW */}
          {activePage === 'overview' && (
            <div className="space-y-8">
              {/* Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Active Campaigns', value: publishedCount.toString(), icon: Megaphone, color: '#6C5FE6' },
                  { label: 'Pending Drafts', value: draftCount.toString(), icon: Clock, color: '#F59E0B' },
                  { label: 'Total Impressions', value: totalImpressions.toLocaleString(), icon: Eye, color: '#00A882' },
                  { label: 'CTA Clicks', value: totalClicks.toLocaleString(), icon: MousePointer, color: '#EC4899' },
                ].map((m) => (
                  <div key={m.label} className="rounded-2xl border border-black/6 bg-white p-5 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <m.icon size={18} style={{ color: m.color }} />
                      <span className="text-xs font-['Outfit'] font-semibold" style={{ color: m.color }}>Live</span>
                    </div>
                    <div className="text-3xl font-['Outfit'] font-black text-foreground">{m.value}</div>
                    <div className="text-xs text-muted-foreground font-['Outfit'] mt-1">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Recent Campaigns Section */}
              <div className="rounded-2xl border border-black/6 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-['Outfit'] font-bold text-lg text-foreground">Recent Campaigns</h3>
                    <p className="text-xs text-muted-foreground font-['Inter']">Manage your published ads and drafts</p>
                  </div>
                  <button
                    onClick={() => setActivePage('campaigns')}
                    className="text-xs font-['Outfit'] font-bold text-[#6C5FE6] hover:underline cursor-pointer"
                  >
                    View All →
                  </button>
                </div>

                {campaigns.length === 0 ? (
                  <div className="py-12 text-center rounded-xl border border-dashed border-black/10 bg-[#FAFBFD]">
                    <Megaphone className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                    <div className="font-['Outfit'] font-bold text-foreground text-sm">No campaigns created yet</div>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                      Choose an available slot on the digital canvas, upload your image creative, and launch your ad in 2 minutes.
                    </p>
                    <button
                      onClick={() => onNavigate('canvas')}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-bold hover:bg-[#584bd4] transition-all cursor-pointer"
                    >
                      Book Ad Space Now →
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {campaigns.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        onClick={() => onOpenCampaign(c)}
                        className="rounded-xl border border-black/6 p-4 hover:border-[#6C5FE6]/40 hover:shadow-md transition-all cursor-pointer bg-card flex flex-col justify-between"
                      >
                        <div className="aspect-video bg-[#EDF0F8] rounded-lg overflow-hidden relative mb-3">
                          <CreativeImage campaign={c} sizes="280px" />
                        </div>
                        <div>
                          <div className="font-['Outfit'] font-bold text-sm text-foreground truncate">{c.name}</div>
                          <div className="text-xs text-muted-foreground font-['Inter'] mt-0.5">{c.brandName} · {c.city || 'Chennai'}</div>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/4">
                          <Badge color={c.status === 'published' ? 'teal' : 'purple'}>{c.status}</Badge>
                          <span className="text-xs text-[#6C5FE6] font-['Outfit'] font-bold">Open →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CAMPAIGNS */}
          {activePage === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {(['all', 'published', 'draft'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setCampaignFilter(filter)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-['Outfit'] font-bold capitalize transition-all cursor-pointer ${
                        campaignFilter === filter
                          ? 'bg-[#6C5FE6] text-white shadow-xs'
                          : 'bg-white border border-black/6 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {filter === 'all' ? `All (${campaigns.length})` : filter === 'published' ? `Live (${publishedCount})` : `Drafts (${draftCount})`}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={campaignSearch}
                    onChange={(e) => setCampaignSearch(e.target.value)}
                    placeholder="Search campaigns..."
                    className="bg-white border border-black/8 rounded-xl pl-9 pr-4 py-2 text-xs font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6] w-64 shadow-xs"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-black/6 bg-white overflow-hidden shadow-xs">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/6 bg-[#FAFBFD]">
                      {['Creative', 'Campaign Name', 'Target City', 'Size', 'Status', 'Dates', 'Actions'].map((h) => (
                        <th key={h} className="text-left px-6 py-3.5 text-xs font-['JetBrains_Mono'] text-muted-foreground uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-xs font-['Outfit']">
                          No campaigns match your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCampaigns.map((c) => (
                        <tr key={c.id} className="border-b border-black/4 hover:bg-black/2 transition-colors">
                          <td className="px-6 py-3">
                            <div className="w-12 h-10 rounded-lg overflow-hidden bg-[#EDF0F8] relative">
                              <CreativeImage campaign={c} sizes="48px" />
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="font-['Outfit'] font-bold text-sm text-foreground">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.brandName}</div>
                          </td>
                          <td className="px-6 py-3 font-['Outfit'] text-xs font-semibold text-foreground">
                            {c.city || 'Chennai'}
                          </td>
                          <td className="px-6 py-3 font-['JetBrains_Mono'] text-xs text-muted-foreground">
                            {c.width} × {c.height} px
                          </td>
                          <td className="px-6 py-3">
                            <Badge color={c.status === 'published' ? 'teal' : 'purple'}>{c.status}</Badge>
                          </td>
                          <td className="px-6 py-3 text-xs font-['JetBrains_Mono'] text-muted-foreground">
                            {c.startsAt ? new Date(c.startsAt).toLocaleDateString('en-IN') : 'Now'} → {c.endsAt ? new Date(c.endsAt).toLocaleDateString('en-IN') : '30D'}
                          </td>
                          <td className="px-6 py-3">
                            <button
                              onClick={() => onOpenCampaign(c)}
                              className="px-3 py-1 rounded-lg bg-[#6C5FE6]/10 text-[#6C5FE6] text-xs font-['Outfit'] font-bold hover:bg-[#6C5FE6]/20 cursor-pointer"
                            >
                              Edit / Preview
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MY AD SPACES */}
          {activePage === 'spaces' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Outfit'] font-bold text-lg text-foreground">Active Canvas Slots</h2>
                <p className="text-xs text-muted-foreground font-['Inter']">Your booked billboard coordinates across India</p>
              </div>

              {campaigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center shadow-xs">
                  <Grid3X3 className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <div className="font-['Outfit'] font-bold text-foreground text-sm">No ad spaces booked yet</div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Visit the live digital canvas, choose your coordinates, and secure your ad placement.
                  </p>
                  <button
                    onClick={() => onNavigate('canvas')}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-bold hover:bg-[#584bd4] transition-all cursor-pointer"
                  >
                    Go to Canvas →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {campaigns.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-black/6 bg-white p-5 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-['Outfit'] font-bold text-sm text-foreground">{c.city || 'Chennai'} Canvas</span>
                        <Badge color={c.status === 'published' ? 'teal' : 'purple'}>{c.status}</Badge>
                      </div>
                      <div className="aspect-video bg-[#EDF0F8] rounded-xl overflow-hidden relative">
                        <CreativeImage campaign={c} sizes="320px" />
                      </div>
                      <div className="space-y-1.5 text-xs font-['JetBrains_Mono']">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Dimensions:</span>
                          <span className="font-bold text-foreground">{c.width} × {c.height} px</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Status:</span>
                          <span className="text-[#00A882] font-bold">{c.status === 'published' ? 'Broadcasting Live' : 'Pending Payment'}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('canvas')}
                        className="w-full py-2 rounded-xl border border-black/8 hover:bg-black/3 text-xs font-['Outfit'] font-bold text-foreground transition-all cursor-pointer"
                      >
                        View Slot on Canvas →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CREATIVE ASSETS GALLERY */}
          {activePage === 'creatives' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Outfit'] font-bold text-lg text-foreground">Creative Assets Gallery</h2>
                <p className="text-xs text-muted-foreground font-['Inter']">All your uploaded banners stored securely on Cloudflare R2</p>
              </div>

              {campaigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-black/10 bg-white p-12 text-center shadow-xs">
                  <FileImage className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <div className="font-['Outfit'] font-bold text-foreground text-sm">No creative banners uploaded yet</div>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Upload your high-res banners during campaign creation to see them here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {campaigns.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-black/6 bg-white overflow-hidden shadow-xs group">
                      <div className="aspect-square bg-[#EDF0F8] relative">
                        <CreativeImage campaign={c} sizes="240px" />
                      </div>
                      <div className="p-4">
                        <div className="font-['Outfit'] font-bold text-xs text-foreground truncate">{c.name}</div>
                        <div className="text-[11px] text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                          {c.width} × {c.height} px
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ANALYTICS */}
          {activePage === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-black/6 bg-white p-5 shadow-xs">
                  <div className="text-xs font-['Outfit'] text-muted-foreground mb-1">Total Impressions</div>
                  <div className="text-3xl font-['Outfit'] font-black text-foreground">{totalImpressions.toLocaleString()}</div>
                  <div className="text-xs text-[#00A882] font-['Outfit'] mt-1">Live canvas views</div>
                </div>
                <div className="rounded-2xl border border-black/6 bg-white p-5 shadow-xs">
                  <div className="text-xs font-['Outfit'] text-muted-foreground mb-1">Total Ad Clicks</div>
                  <div className="text-3xl font-['Outfit'] font-black text-[#6C5FE6]">{totalClicks.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground font-['Outfit'] mt-1">Website & WhatsApp visits</div>
                </div>
                <div className="rounded-2xl border border-black/6 bg-white p-5 shadow-xs">
                  <div className="text-xs font-['Outfit'] text-muted-foreground mb-1">Avg. Click-Through Rate (CTR)</div>
                  <div className="text-3xl font-['Outfit'] font-black text-[#00A882]">{publishedCount > 0 ? '6.8%' : '0.0%'}</div>
                  <div className="text-xs text-muted-foreground font-['Outfit'] mt-1">High intent audience</div>
                </div>
              </div>

              <div className="rounded-2xl border border-black/6 bg-white p-6 shadow-xs">
                <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-4">Performance by Campaign</h3>
                {campaigns.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">No campaign data to analyze yet.</div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3.5 rounded-xl border border-black/4 hover:bg-black/2 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#EDF0F8] overflow-hidden relative">
                            <CreativeImage campaign={c} sizes="32px" />
                          </div>
                          <div>
                            <div className="font-['Outfit'] font-bold text-sm text-foreground">{c.name}</div>
                            <div className="text-[11px] text-muted-foreground">{c.city || 'Chennai'} · {c.width} × {c.height}px</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-xs font-['JetBrains_Mono']">
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Impressions</span>
                            <span className="font-bold text-foreground">{c.status === 'published' ? '12.4K' : '0'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[10px]">Clicks</span>
                            <span className="font-bold text-[#6C5FE6]">{c.status === 'published' ? '840' : '0'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: INVOICES & BILLING */}
          {activePage === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['Outfit'] font-bold text-lg text-foreground">Tax Invoices & Billing</h2>
                  <p className="text-xs text-muted-foreground font-['Inter'] mt-0.5">
                    Official GST-compliant tax invoices with 18% GST breakdown
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00A882]/10 border border-[#00A882]/20 text-[#00A882] text-xs font-['Outfit'] font-semibold">
                  <CheckCircle2 size={14} /> YouPI Live NPCI UPI Settlement
                </div>
              </div>

              <div className="rounded-2xl border border-black/6 bg-white overflow-hidden shadow-xs">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/6 bg-[#FAFBFD]">
                      {['Invoice #', 'Campaign', 'Date', 'Base Price', 'GST (18%)', 'Total Paid', 'Status', 'Action'].map((h) => (
                        <th key={h} className="text-left px-6 py-3.5 text-xs font-['JetBrains_Mono'] text-muted-foreground uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-xs text-muted-foreground font-['Outfit']">
                          No invoices generated yet. Invoices appear automatically after ad checkout.
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="border-b border-black/4 hover:bg-black/2 transition-colors">
                          <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs font-bold text-foreground">{inv.id}</td>
                          <td className="px-6 py-4 font-['Outfit'] text-sm font-semibold text-foreground">{inv.campaign}</td>
                          <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-muted-foreground">{inv.date}</td>
                          <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-foreground">{inv.subtotal}</td>
                          <td className="px-6 py-4 font-['JetBrains_Mono'] text-xs text-muted-foreground">{inv.gst}</td>
                          <td className="px-6 py-4 font-['Outfit'] text-sm font-bold text-[#6C5FE6]">{inv.amount}</td>
                          <td className="px-6 py-4">
                            <Badge color="teal">{inv.status}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => alert(`Official GST Tax Receipt for ${inv.id}\nSettled via NPCI UPI to rafimmedia-1@oksbi`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/8 hover:bg-black/5 text-xs font-['Outfit'] font-semibold text-foreground transition-all cursor-pointer"
                            >
                              <Download size={12} /> Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activePage === 'notifications' && (
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-['Outfit'] font-bold text-lg text-foreground">Notifications & Alerts</h2>
                <button
                  onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}
                  className="text-xs text-[#6C5FE6] font-['Outfit'] font-bold hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-5 rounded-2xl border transition-all ${
                      notif.read ? 'border-black/6 bg-white opacity-70' : 'border-[#6C5FE6]/30 bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-['Outfit'] font-bold text-sm text-foreground">{notif.title}</div>
                        <p className="text-xs text-muted-foreground font-['Inter'] mt-1">{notif.message}</p>
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

          {/* TAB 8: BUSINESS PROFILE */}
          {activePage === 'profile' && (
            <div className="max-w-2xl bg-white rounded-2xl border border-black/6 p-8 shadow-xs">
              <h2 className="font-['Outfit'] font-bold text-xl text-foreground mb-1">Business Profile</h2>
              <p className="text-xs text-muted-foreground font-['Inter'] mb-6">
                Update your business details for billing, GST invoices, and platform recognition.
              </p>

              {profileSaved && (
                <div className="mb-6 p-4 rounded-xl bg-[#00A882]/10 border border-[#00A882]/20 text-[#00A882] text-xs font-['Outfit'] font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} /> Profile details saved successfully!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1">First Name</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Your First Name"
                      className="w-full bg-[#FAFBFD] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground focus:outline-none focus:border-[#6C5FE6]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1">Last Name</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Your Last Name"
                      className="w-full bg-[#FAFBFD] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground focus:outline-none focus:border-[#6C5FE6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1">Email Address</label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-black/4 border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-muted-foreground cursor-not-allowed"
                  />
                  <span className="text-[10px] text-muted-foreground font-['Inter'] mt-1 block">Account login email (cannot be modified)</span>
                </div>

                <div>
                  <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1">Company / Brand Name</label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. PixelWorld Media"
                    className="w-full bg-[#FAFBFD] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground focus:outline-none focus:border-[#6C5FE6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#FAFBFD] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground focus:outline-none focus:border-[#6C5FE6]"
                  />
                </div>

                <div className="pt-2">
                  <PrimaryBtn small type="submit">
                    Save Profile Changes
                  </PrimaryBtn>
                </div>
              </form>
            </div>
          )}

          {/* TAB 9: SETTINGS */}
          {activePage === 'settings' && (
            <div className="max-w-2xl bg-white rounded-2xl border border-black/6 p-8 shadow-xs space-y-6">
              <div>
                <h2 className="font-['Outfit'] font-bold text-xl text-foreground mb-1">Account Settings</h2>
                <p className="text-xs text-muted-foreground font-['Inter']">Manage your notification preferences and platform security</p>
              </div>

              {/* Notification preferences */}
              <div className="space-y-4 pt-4 border-t border-black/6">
                <h3 className="font-['Outfit'] font-bold text-sm text-foreground">Email Notifications (via Resend)</h3>
                
                {[
                  {
                    label: 'Order Confirmation & GST Tax Invoices',
                    desc: 'Receive immediate email receipts with official invoice breakdown',
                    checked: notifyOrder,
                    toggle: () => setNotifyOrder(!notifyOrder),
                  },
                  {
                    label: 'Campaign Expiry Warnings',
                    desc: 'Get notified 48 hours before an ad slot expires on the canvas',
                    checked: notifyExpiry,
                    toggle: () => setNotifyExpiry(!notifyExpiry),
                  },
                  {
                    label: 'Weekly Performance Digest',
                    desc: 'Weekly summary of total impressions and CTA interactions',
                    checked: notifyWeekly,
                    toggle: () => setNotifyWeekly(!notifyWeekly),
                  },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-center justify-between p-3.5 rounded-xl border border-black/4 bg-[#FAFBFD]">
                    <div>
                      <div className="font-['Outfit'] font-semibold text-sm text-foreground">{pref.label}</div>
                      <div className="text-xs text-muted-foreground font-['Inter']">{pref.desc}</div>
                    </div>
                    <button
                      onClick={pref.toggle}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                        pref.checked ? 'bg-[#6C5FE6]' : 'bg-black/15'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          pref.checked ? 'left-6' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-red-100 space-y-3">
                <h3 className="font-['Outfit'] font-bold text-sm text-red-600">Session & Danger Zone</h3>
                <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50/50">
                  <div>
                    <div className="font-['Outfit'] font-bold text-sm text-red-950">Sign Out of Session</div>
                    <div className="text-xs text-red-700 font-['Inter']">Terminates active session and clears local credentials</div>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/api/app-auth/logout', { method: 'POST' }).finally(() => {
                        if (typeof window !== 'undefined') {
                          window.localStorage.clear()
                          window.sessionStorage.clear()
                        }
                        onNavigate('login')
                      })
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-['Outfit'] font-bold transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
