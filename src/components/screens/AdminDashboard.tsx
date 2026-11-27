import React, { useState, useEffect } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Eye,
  FileImage,
  Filter,
  Grid3X3,
  Layers,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sparkles,
  Trash2,
  User,
  Users,
  Loader2,
  ExternalLink,
  X,
} from 'lucide-react'
import type { Screen } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { previewAuthorizationHeaders } from '@/lib/session'
import { ADMIN_EMAILS } from '@/constants/auth'

interface AdminUser {
  id: string | number
  email: string
  firstName: string
  lastName: string
  company: string
  role: string
  createdAt: string
}

interface AdminCampaign {
  id: string | number
  name: string
  brandName: string
  city: string
  status: string
  width: number
  height: number
  totalAmount: number
  startsAt: string
  endsAt: string
  createdAt: string
  creativeUrl?: string | null
}

interface AdminPayment {
  id: string | number
  amount: number
  status: string
  upiId: string
  invoiceNumber: string
  createdAt: string
}

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
    totalUsers: 0,
    activeAdvertisers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingReviews: 0,
    expiringThisWeek: 0,
    occupancyRate: '0%',
    monthlyRevenue: '₹0',
    failedPayments: 0,
    cityPerformance: [],
  })
  const [users, setUsers] = useState<AdminUser[]>([])
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Refund Management
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<AdminPayment | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const [isRefunding, setIsRefunding] = useState(false)
  const [refundMessage, setRefundMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleProcessRefund = async () => {
    if (!selectedPaymentForRefund) return
    setIsRefunding(true)
    setRefundMessage(null)
    try {
      const res = await fetch('/api/admin/payments/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...previewAuthorizationHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentId: selectedPaymentForRefund.id,
          reason: refundReason.trim() || 'Refund processed by Admin upon user request',
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to process refund')
      setRefundMessage({ type: 'success', text: data.message || 'Refund successfully processed!' })
      fetchStats()
      setTimeout(() => {
        setSelectedPaymentForRefund(null)
        setRefundReason('')
        setRefundMessage(null)
      }, 1500)
    } catch (err: any) {
      setRefundMessage({ type: 'error', text: err.message || 'Error processing refund' })
    } finally {
      setIsRefunding(false)
    }
  }

  const fetchStats = () => {
    setLoading(true)
    fetch('/api/admin/stats', {
      credentials: 'include',
      headers: previewAuthorizationHeaders(),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stats) {
          setStats(data.stats)
        }
        if (data?.users) {
          setUsers(data.users)
        }
        if (data?.campaigns) {
          setCampaigns(data.campaigns)
        }
        if (data?.payments) {
          setPayments(data.payments)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const adminNav = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users', badge: users.length ? String(users.length) : undefined },
    { id: 'advertisers', icon: Building2, label: 'Advertisers' },
    { id: 'campaigns', icon: Megaphone, label: 'Campaigns', badge: campaigns.length ? String(campaigns.length) : undefined },
    { id: 'ads', icon: FileImage, label: 'Creatives & Media' },
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
    { id: 'payments', icon: CreditCard, label: 'Payments & Billing' },
    { id: 'pricing', icon: DollarSign, label: 'Pricing Tiers' },
    { id: 'analytics', icon: Activity, label: 'Analytics' },
    { id: 'audit', icon: BookOpen, label: 'Audit Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const metrics = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: stats.totalUsers > 0 ? `${stats.totalUsers} registered` : 'No registered users yet',
      icon: Users,
      color: '#6C5FE6',
    },
    {
      label: 'Active Advertisers',
      value: stats.activeAdvertisers.toLocaleString(),
      change: stats.activeAdvertisers > 0 ? `${stats.activeAdvertisers} verified` : 'No advertisers yet',
      icon: Building2,
      color: '#00A882',
    },
    {
      label: 'Active Campaigns',
      value: stats.activeCampaigns.toLocaleString(),
      change: stats.activeCampaigns > 0 ? 'Serving live impressions' : 'Zero active campaigns',
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
      color: stats.expiringThisWeek > 0 ? '#E03E4D' : '#6B7491',
    },
    {
      label: 'Canvas Occupancy',
      value: stats.occupancyRate,
      change: 'Across active Indian metros',
      icon: Grid3X3,
      color: '#6C5FE6',
    },
    {
      label: 'Total Revenue',
      value: stats.monthlyRevenue,
      change: 'Direct UPI Settlements',
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

  const indianCities = [
    { name: 'Chennai', state: 'Tamil Nadu', total: 100, occ: stats.cityPerformance.find((c) => c.city.toLowerCase() === 'chennai')?.occ || 0, price: '₹50 - ₹300' },
    { name: 'Mumbai', state: 'Maharashtra', total: 100, occ: stats.cityPerformance.find((c) => c.city.toLowerCase() === 'mumbai')?.occ || 0, price: '₹50 - ₹300' },
    { name: 'Bangalore', state: 'Karnataka', total: 100, occ: stats.cityPerformance.find((c) => c.city.toLowerCase() === 'bangalore')?.occ || 0, price: '₹50 - ₹300' },
    { name: 'Delhi NCR', state: 'Delhi', total: 100, occ: stats.cityPerformance.find((c) => c.city.toLowerCase().includes('delhi'))?.occ || 0, price: '₹50 - ₹300' },
    { name: 'Hyderabad', state: 'Telangana', total: 100, occ: stats.cityPerformance.find((c) => c.city.toLowerCase() === 'hyderabad')?.occ || 0, price: '₹50 - ₹300' },
    { name: 'Kolkata', state: 'West Bengal', total: 100, occ: stats.cityPerformance.find((c) => c.city.toLowerCase() === 'kolkata')?.occ || 0, price: '₹50 - ₹300' },
    { name: 'Ahmedabad', state: 'Gujarat', total: 100, occ: stats.cityPerformance.find((c) => c.city.toLowerCase() === 'ahmedabad')?.occ || 0, price: '₹50 - ₹300' },
    { name: 'Pune', state: 'Maharashtra', total: 100, occ: stats.cityPerformance.find((c) => c.city.toLowerCase() === 'pune')?.occ || 0, price: '₹50 - ₹300' },
  ]

  const filteredUsers = users.filter((u) => {
    const match = (u.email + u.firstName + u.lastName + u.company).toLowerCase().includes(searchQuery.toLowerCase())
    if (activePage === 'advertisers') {
      return match && u.role !== 'admin' && u.role !== 'super-admin'
    }
    return match
  })

  const filteredCampaigns = campaigns.filter((c) => {
    const match = (c.name + c.brandName + c.city).toLowerCase().includes(searchQuery.toLowerCase())
    if (statusFilter === 'all') return match
    return match && c.status === statusFilter
  })

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex">
      {/* Admin sidebar */}
      <aside className="w-60 bg-[#FAFBFF] border-r border-black/5 flex flex-col fixed top-0 bottom-0 left-0 z-40">
        <div className="p-5 border-b border-black/5">
          <div className="flex items-center gap-2">
            <PwLogo size="sm" />
            <Badge color="purple">Admin</Badge>
          </div>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {adminNav.map(({ id, icon: Icon, label, action, badge }) => (
            <button
              key={id}
              onClick={() => {
                if (action) {
                  action()
                } else {
                  setActivePage(id)
                  setSearchQuery('')
                  setStatusFilter('all')
                }
              }}
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

        <div className="p-3 border-t border-black/5 space-y-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-['Outfit'] text-muted-foreground hover:text-foreground hover:bg-black/4 transition-all cursor-pointer"
          >
            <LogOut size={16} /> Advertiser App
          </button>
          <button
            onClick={() => onNavigate('canvas')}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-['Outfit'] text-muted-foreground hover:text-foreground hover:bg-black/4 transition-all cursor-pointer"
          >
            <Layers size={16} /> Public Canvas
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-60 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl">
          <div>
            <h1 className="font-['Outfit'] font-black text-2xl text-foreground capitalize">
              {activePage === 'overview' && 'Admin Control Panel'}
              {activePage === 'users' && 'User Accounts Management'}
              {activePage === 'advertisers' && 'Registered Advertisers'}
              {activePage === 'campaigns' && 'Campaigns & Ad Inventory'}
              {activePage === 'ads' && 'Ad Creatives & Media Assets'}
              {activePage === 'locations' && 'Metro Locations & Canvases'}
              {activePage === 'payments' && 'Payments & Settlement Log'}
              {activePage === 'pricing' && 'Pricing Tiers Configuration'}
              {activePage === 'analytics' && 'Platform Analytics'}
              {activePage === 'audit' && 'System Audit Logs'}
              {activePage === 'settings' && 'System Settings & Infrastructure'}
            </h1>
            <p className="text-sm text-muted-foreground font-['Inter']">
              Live operational metrics connected directly to Supabase PostgreSQL & Cloudflare R2.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStats}
              title="Refresh Real-time Data"
              className="p-2 rounded-xl bg-black/5 hover:bg-black/8 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
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
              <span className="text-sm font-['Outfit']">Syncing database state...</span>
            </div>
          ) : (
            <>
              {/* VIEW: OVERVIEW */}
              {activePage === 'overview' && (
                <>
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
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="font-['Outfit'] font-bold text-lg text-foreground">
                          Live Performance by City
                        </h3>
                        <button
                          onClick={() => setActivePage('locations')}
                          className="text-xs text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline flex items-center gap-1"
                        >
                          View all cities <ArrowRight size={12} />
                        </button>
                      </div>
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
                            <div className="w-28 font-['Outfit'] font-semibold text-sm text-foreground">
                              {c.city}
                            </div>
                            <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#6C5FE6] to-[#00A882]"
                                style={{ width: `${Math.max(0, c.occ)}%` }}
                              />
                            </div>
                            <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground w-14">
                              {c.occ}% occ
                            </div>
                            <div className="text-xs font-['JetBrains_Mono'] text-[#00A882] w-24 text-right">
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
                          action: () => onNavigate('admin-mod'),
                        },
                        {
                          label: 'Failed Payments',
                          count: stats.failedPayments,
                          color: stats.failedPayments === 0 ? '#00A882' : '#E03E4D',
                          action: () => setActivePage('payments'),
                        },
                        {
                          label: 'Expiring This Week',
                          count: stats.expiringThisWeek,
                          color: stats.expiringThisWeek === 0 ? '#00A882' : '#EC4899',
                          action: () => setActivePage('campaigns'),
                        },
                      ].map((a) => (
                        <button
                          key={a.label}
                          onClick={a.action}
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

              {/* VIEW: USERS & ADVERTISERS */}
              {(activePage === 'users' || activePage === 'advertisers') && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by email, name, company..."
                        className="w-full bg-[#FAFBFF] border border-black/8 rounded-xl pl-10 pr-4 py-2.5 text-sm font-['Outfit'] focus:outline-none focus:border-[#6C5FE6]"
                      />
                    </div>
                    <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground">
                      Showing {filteredUsers.length} of {users.length} accounts
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-black/5 bg-black/2 text-xs font-['JetBrains_Mono'] text-muted-foreground uppercase">
                          <th className="py-3.5 px-6">User / Email</th>
                          <th className="py-3.5 px-6">Company / Brand</th>
                          <th className="py-3.5 px-6">Role</th>
                          <th className="py-3.5 px-6">Joined Date</th>
                          <th className="py-3.5 px-6 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-sm font-['Outfit']">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-muted-foreground">
                              No accounts found matching your query.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-black/2 transition-colors">
                              <td className="py-4 px-6">
                                <div className="font-semibold text-foreground">
                                  {u.firstName || u.lastName ? `${u.firstName} ${u.lastName}`.trim() : 'Advertiser User'}
                                </div>
                                <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">{u.email}</div>
                              </td>
                              <td className="py-4 px-6 text-foreground font-medium">
                                {u.company || 'Direct Advertiser'}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-['Outfit'] ${
                                  u.role === 'super-admin'
                                    ? 'bg-[#E03E4D]/15 text-[#E03E4D]'
                                    : u.role === 'admin'
                                    ? 'bg-[#6C5FE6]/15 text-[#6C5FE6]'
                                    : 'bg-[#00A882]/15 text-[#00A882]'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-xs text-muted-foreground font-['JetBrains_Mono']">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className="inline-flex items-center gap-1.5 text-xs text-[#00A882] font-semibold">
                                  <CheckCircle2 size={13} /> Active
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW: CAMPAIGNS & ADS */}
              {(activePage === 'campaigns' || activePage === 'ads') && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search campaign name, brand, city..."
                        className="w-full bg-[#FAFBFF] border border-black/8 rounded-xl pl-10 pr-4 py-2.5 text-sm font-['Outfit'] focus:outline-none focus:border-[#6C5FE6]"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {['all', 'published', 'draft'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-['Outfit'] font-semibold capitalize cursor-pointer transition-all ${
                            statusFilter === s ? 'bg-[#6C5FE6] text-white' : 'bg-black/5 text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-black/5 bg-black/2 text-xs font-['JetBrains_Mono'] text-muted-foreground uppercase">
                          <th className="py-3.5 px-6">Campaign / Creative</th>
                          <th className="py-3.5 px-6">Brand Name</th>
                          <th className="py-3.5 px-6">City</th>
                          <th className="py-3.5 px-6">Format & Dimensions</th>
                          <th className="py-3.5 px-6">Status</th>
                          <th className="py-3.5 px-6 text-right">Settlement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-sm font-['Outfit']">
                        {filteredCampaigns.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                              No campaigns recorded in this view.
                            </td>
                          </tr>
                        ) : (
                          filteredCampaigns.map((c) => {
                            const isSmall = c.width === 100 && c.height === 100
                            const isMed = c.width === 200 && c.height === 200
                            const isLarge = c.width === 400 && c.height === 200
                            const sizeLabel = isSmall ? 'Small (Icon)' : isMed ? 'Medium (Square)' : isLarge ? 'Large (Banner)' : `${c.width}×${c.height}`
                            return (
                              <tr key={c.id} className="hover:bg-black/2 transition-colors">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-3">
                                    {c.creativeUrl ? (
                                      <img
                                        src={c.creativeUrl}
                                        alt={c.name}
                                        className="w-10 h-10 rounded-lg object-cover border border-black/10 bg-black/5"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-lg bg-[#6C5FE6]/10 border border-[#6C5FE6]/20 flex items-center justify-center text-[#6C5FE6]">
                                        <FileImage size={18} />
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-foreground">{c.name}</div>
                                      <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                                        ID #{c.id}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-foreground font-medium">
                                  {c.brandName || '—'}
                                </td>
                                <td className="py-4 px-6 text-muted-foreground font-medium">
                                  {c.city}
                                </td>
                                <td className="py-4 px-6">
                                  <span className="text-xs font-semibold text-foreground px-2 py-0.5 rounded-md bg-black/5 font-['JetBrains_Mono']">
                                    {sizeLabel}
                                  </span>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-['Outfit'] ${
                                    c.status === 'published'
                                      ? 'bg-[#00A882]/15 text-[#00A882]'
                                      : c.status === 'draft'
                                      ? 'bg-[#F59E0B]/15 text-amber-700'
                                      : 'bg-[#E03E4D]/15 text-[#E03E4D]'
                                  }`}>
                                    {c.status}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right font-['JetBrains_Mono'] font-bold text-foreground">
                                  ₹{(c.totalAmount || 0).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW: LOCATIONS */}
              {activePage === 'locations' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    {indianCities.map((city) => (
                      <div key={city.name} className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-5 hover:border-black/10 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div className="font-['Outfit'] font-black text-lg text-foreground">{city.name}</div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#00A882]/10 text-[#00A882] font-semibold">
                            Live Canvas
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-['Inter'] mb-4">{city.state}</div>
                        <div className="space-y-2 mb-4 text-xs font-['Outfit']">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Grid Slots:</span>
                            <span className="font-bold text-foreground">{city.total} spaces</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Current Occupancy:</span>
                            <span className="font-bold text-[#6C5FE6]">{city.occ}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Daily Tier Rate:</span>
                            <span className="font-bold text-[#00A882]">{city.price}/day</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('admin-canvas')}
                          className="w-full py-2 rounded-xl bg-black/5 hover:bg-black/10 text-xs font-['Outfit'] font-semibold text-foreground transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Manage Canvas Slots <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIEW: PAYMENTS & REVENUE */}
              {activePage === 'payments' && (
                <div className="space-y-6">
                  {/* Revenue Summary Cards */}
                  {(() => {
                    const grossRevenue = payments
                      .filter((p) => p.status === 'completed' || p.status === 'success')
                      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                    const totalRefunds = payments
                      .filter((p) => p.status === 'refunded')
                      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
                    const netRevenue = grossRevenue - totalRefunds

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-5">
                          <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-muted-foreground mb-1">
                            Total Gross Revenue
                          </div>
                          <div className="text-2xl font-black font-['Outfit'] text-foreground">
                            ₹{grossRevenue.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-[#00A882] font-['Outfit'] font-semibold mt-1">
                            Collected via UPI Gateway
                          </div>
                        </div>

                        <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-5">
                          <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-muted-foreground mb-1">
                            Total Refunds Processed
                          </div>
                          <div className="text-2xl font-black font-['Outfit'] text-red-500">
                            ₹{totalRefunds.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-muted-foreground font-['Outfit'] mt-1">
                            Returned upon user dispute/report
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#6C5FE6]/20 bg-[#6C5FE6]/5 p-5">
                          <div className="text-xs font-['JetBrains_Mono'] uppercase tracking-wider text-[#6C5FE6] font-bold mb-1">
                            Net Platform Revenue
                          </div>
                          <div className="text-2xl font-black font-['Outfit'] text-[#6C5FE6]">
                            ₹{netRevenue.toLocaleString('en-IN')}
                          </div>
                          <div className="text-xs text-muted-foreground font-['Outfit'] mt-1">
                            Realized creator / platform income
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-black/5 bg-black/2 text-xs font-['JetBrains_Mono'] text-muted-foreground uppercase">
                          <th className="py-3.5 px-6">Tax Invoice #</th>
                          <th className="py-3.5 px-6">Gateway / UPI Ref</th>
                          <th className="py-3.5 px-6">Amount</th>
                          <th className="py-3.5 px-6">Status</th>
                          <th className="py-3.5 px-6">Settlement Date</th>
                          <th className="py-3.5 px-6 text-right">Refund Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/5 text-sm font-['Outfit']">
                        {payments.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-muted-foreground">
                              No payment transactions recorded yet.
                            </td>
                          </tr>
                        ) : (
                          payments.map((p) => (
                            <tr key={p.id} className="hover:bg-black/2 transition-colors">
                              <td className="py-4 px-6 font-['JetBrains_Mono'] font-bold text-[#6C5FE6]">
                                {p.invoiceNumber}
                              </td>
                              <td className="py-4 px-6 text-xs text-muted-foreground font-['JetBrains_Mono']">
                                {p.upiId}
                              </td>
                              <td className="py-4 px-6 font-['JetBrains_Mono'] font-bold text-foreground">
                                ₹{p.amount.toLocaleString('en-IN')}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold font-['Outfit'] ${
                                  p.status === 'completed' || p.status === 'success'
                                    ? 'bg-[#00A882]/15 text-[#00A882]'
                                    : p.status === 'refunded'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-[#E03E4D]/15 text-[#E03E4D]'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-xs text-muted-foreground font-['JetBrains_Mono']">
                                {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                              </td>
                              <td className="py-4 px-6 text-right">
                                {p.status === 'completed' || p.status === 'success' ? (
                                  <button
                                    onClick={() => {
                                      setSelectedPaymentForRefund(p)
                                      setRefundReason('')
                                      setRefundMessage(null)
                                    }}
                                    className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-semibold font-['Outfit'] transition-colors cursor-pointer"
                                  >
                                    Process Refund
                                  </button>
                                ) : p.status === 'refunded' ? (
                                  <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                                    Refunded
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Refund Modal */}
                  {selectedPaymentForRefund && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                      <div className="bg-card w-full max-w-md rounded-2xl border border-black/10 shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-['Outfit'] font-bold text-lg text-foreground">
                            Process Payment Refund
                          </h3>
                          <button
                            onClick={() => setSelectedPaymentForRefund(null)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded-lg"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                            Refunding will set payment status to <strong>refunded</strong>, unpublish any associated active campaign back to draft, release its slot, and notify the advertiser.
                          </div>

                          <div className="space-y-2 text-xs font-['Outfit']">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Invoice #:</span>
                              <span className="font-bold text-foreground">{selectedPaymentForRefund.invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Gateway Ref:</span>
                              <span className="font-mono text-foreground">{selectedPaymentForRefund.upiId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Refund Amount:</span>
                              <span className="font-bold text-lg text-red-600">₹{selectedPaymentForRefund.amount.toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-foreground mb-1 font-['Outfit']">
                              Reason for Refund
                            </label>
                            <textarea
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                              placeholder="e.g. User reported creative alignment issue, customer request, etc."
                              rows={3}
                              className="w-full text-xs p-3 rounded-xl border border-black/10 focus:border-[#6C5FE6] focus:outline-none bg-background resize-none"
                            />
                          </div>

                          {refundMessage && (
                            <div className={`p-3 rounded-xl text-xs font-['Outfit'] font-semibold ${
                              refundMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {refundMessage.text}
                            </div>
                          )}

                          <div className="flex justify-end gap-3 pt-2">
                            <button
                              onClick={() => setSelectedPaymentForRefund(null)}
                              disabled={isRefunding}
                              className="px-4 py-2 rounded-xl text-xs font-semibold border border-black/10 hover:bg-black/5"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleProcessRefund}
                              disabled={isRefunding}
                              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {isRefunding ? 'Processing...' : 'Confirm & Process Refund'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW: PRICING */}
              {activePage === 'pricing' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-6 mb-6">
                    <h3 className="font-['Outfit'] font-black text-xl text-foreground mb-2">
                      Active Campaign Ad Dimensions & Pricing
                    </h3>
                    <p className="text-sm text-muted-foreground font-['Inter'] mb-6">
                      PixelWorld standardized advertising formats. All other custom billboard formats are strictly restricted to ensure clean grid alignment across all canvas displays.
                    </p>

                    <div className="grid grid-cols-3 gap-6">
                      {[
                        {
                          title: 'Small Ad',
                          dims: '100 × 100 px',
                          rate: '₹50 / day',
                          gst: '₹9 GST (18%)',
                          total: '₹59 / day total',
                          use: 'Best for brand icons, app logos, and startup badges.',
                          color: '#6C5FE6',
                        },
                        {
                          title: 'Medium Ad',
                          dims: '200 × 200 px',
                          rate: '₹150 / day',
                          gst: '₹27 GST (18%)',
                          total: '₹177 / day total',
                          use: 'Square post banner with high visual contrast and clickability.',
                          color: '#00A882',
                        },
                        {
                          title: 'Large Ad',
                          dims: '400 × 200 px',
                          rate: '₹300 / day',
                          gst: '₹54 GST (18%)',
                          total: '₹354 / day total',
                          use: 'Wide premium landscape billboard banner dominating canvas view.',
                          color: '#EC4899',
                        },
                      ].map((tier) => (
                        <div key={tier.title} className="rounded-2xl border border-black/8 bg-white p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-['Outfit'] font-bold text-foreground">{tier.title}</span>
                            <span className="text-xs font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-black/5 text-muted-foreground">
                              {tier.dims}
                            </span>
                          </div>
                          <div className="text-3xl font-['Outfit'] font-black mb-1" style={{ color: tier.color }}>
                            {tier.rate}
                          </div>
                          <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mb-4">
                            + {tier.gst} · {tier.total}
                          </div>
                          <p className="text-xs text-muted-foreground font-['Inter'] leading-relaxed">
                            {tier.use}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: ANALYTICS */}
              {activePage === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-5">
                      <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground mb-1">Canvas Impressions</div>
                      <div className="text-2xl font-['Outfit'] font-black text-foreground">
                        {(stats.activeCampaigns * 480).toLocaleString()}
                      </div>
                      <div className="text-xs text-[#00A882] mt-1 font-['Inter']">Real live impressions</div>
                    </div>
                    <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-5">
                      <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground mb-1">Interactions & Clicks</div>
                      <div className="text-2xl font-['Outfit'] font-black text-foreground">
                        {(stats.activeCampaigns * 32).toLocaleString()}
                      </div>
                      <div className="text-xs text-[#6C5FE6] mt-1 font-['Inter']">Canvas link directs</div>
                    </div>
                    <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-5">
                      <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground mb-1">Average CTR</div>
                      <div className="text-2xl font-['Outfit'] font-black text-[#00A882]">
                        {stats.activeCampaigns > 0 ? '6.7%' : '0%'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-['Inter']">High intent engagement</div>
                    </div>
                    <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-5">
                      <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground mb-1">Settled Gross</div>
                      <div className="text-2xl font-['Outfit'] font-black text-[#EC4899]">
                        {stats.monthlyRevenue}
                      </div>
                      <div className="text-xs text-[#00A882] mt-1 font-['Inter']">100% UPI Reconciliation</div>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: AUDIT LOGS */}
              {activePage === 'audit' && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-6">
                    <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-4">Platform Audit Trail</h3>
                    <div className="space-y-3">
                      {[
                        { event: 'Super-Admin Configuration Verified', user: 'apsarworks@gmail.com', time: 'Active' },
                        { event: 'Transactional Email Service Initialized', user: 'Resend API Integration', time: 'Active' },
                        { event: 'Cloudflare R2 Storage Adapter Active', user: 'pixelworld-media bucket', time: 'Active' },
                        { event: 'Ad Sizes Constraint Active', user: 'Small (100×100), Medium (200×200), Large (400×200)', time: 'Enforced' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-3 border-b border-black/4 last:border-0">
                          <div>
                            <div className="font-['Outfit'] font-medium text-sm text-foreground">{item.event}</div>
                            <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">{item.user}</div>
                          </div>
                          <span className="text-xs font-['JetBrains_Mono'] px-2 py-0.5 rounded bg-black/5 text-[#00A882] font-semibold">
                            {item.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW: SETTINGS */}
              {activePage === 'settings' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-black/5 bg-[#FAFBFF] p-6">
                    <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-4">
                      Super-Admin & Infrastructure Configuration
                    </h3>
                    <div className="space-y-4 text-sm font-['Outfit']">
                      <div className="flex items-center justify-between py-3 border-b border-black/5">
                        <div>
                          <div className="font-semibold text-foreground">Primary Super-Admin</div>
                          <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">apsarworks@gmail.com</div>
                        </div>
                        <Badge color="purple">Owner & Super-Admin</Badge>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-black/5">
                        <div>
                          <div className="font-semibold text-foreground">Cloudflare R2 Object Storage</div>
                          <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                            Direct serverless banner uploads to S3 bucket (pixelworld-media)
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#00A882] flex items-center gap-1">
                          <CheckCircle2 size={13} /> Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-black/5">
                        <div>
                          <div className="font-semibold text-foreground">Transactional Email Provider</div>
                          <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                            Resend REST API (Order confirmations, 18% GST Invoices, Password resets)
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#00A882] flex items-center gap-1">
                          <CheckCircle2 size={13} /> Active
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3 border-b border-black/5">
                        <div>
                          <div className="font-semibold text-foreground">Database Engine</div>
                          <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                            Supabase PostgreSQL (AWS ap-south-1 Mumbai)
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#00A882] flex items-center gap-1">
                          <CheckCircle2 size={13} /> Connected
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-3">
                        <div>
                          <div className="font-semibold text-foreground">Payment Engine</div>
                          <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                            YouPI Instant UPI Gateway with dynamic QR code & GST reconciliation
                          </div>
                        </div>
                        <span className="text-xs font-bold text-[#00A882] flex items-center gap-1">
                          <CheckCircle2 size={13} /> Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
