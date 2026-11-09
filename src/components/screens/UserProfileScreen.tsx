import React, { useState } from 'react'
import { AlertTriangle, ArrowLeft, Check, ChevronDown, Edit2, Laptop, Layers, LayoutDashboard, LogOut, Phone, Plus, Settings, Shield, Smartphone, Upload, UserCircle, Users } from 'lucide-react'
import type { Screen, AppUser } from '@/types/pixelworld'
import { PwLogo, PrimaryBtn, GhostBtn, Badge } from '@/components/common/UIComponents'
import { UAM_ROLES, TEAM_MEMBERS } from '@/data/mock-data'

export function UserProfileScreen({
  onNavigate,
  user,
  onLogout,
}: {
  onNavigate: (s: Screen) => void
  user: AppUser
  onLogout: () => void
}) {
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'team' | 'permissions' | 'sessions'
  >('profile')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('manager')
  const [members, setMembers] = useState(TEAM_MEMBERS)
  const [editingMember, setEditingMember] = useState<number | null>(null)
  const [profileName, setProfileName] = useState(`${user.firstName} ${user.lastName ?? ''}`.trim())
  const [profileEmail, setProfileEmail] = useState(user.email)
  const [profilePhone, setProfilePhone] = useState(user.phone ?? '')
  const [profileCompany, setProfileCompany] = useState(user.company ?? '')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleInvite = () => {
    if (!inviteEmail) return
    setMembers([
      ...members,
      {
        id: Date.now(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        avatar: inviteEmail.slice(0, 2).toUpperCase(),
        status: 'invited',
        joined: '—',
        lastActive: 'Pending',
      },
    ])
    setInviteEmail('')
  }

  const removeMember = (id: number) => setMembers(members.filter((m) => m.id !== id))

  const updateRole = (id: number, role: string) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, role } : m)))
    setEditingMember(null)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserCircle },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'permissions', label: 'Permissions', icon: Layers },
    { id: 'sessions', label: 'Sessions', icon: Laptop },
  ] as const

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] transition-colors"
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
          <span className="text-black/15">·</span>
          <span className="font-['Outfit'] font-bold text-foreground">Account & Access</span>
        </div>
        <PwLogo size="sm" />
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-[#00A882] font-['JetBrains_Mono'] flex items-center gap-1">
              <Check size={12} /> Saved
            </span>
          )}
          <GhostBtn small onClick={onLogout}>
            <LogOut size={14} /> Sign out
          </GhostBtn>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-8 py-10 flex gap-8">
        {/* Sidebar */}
        <aside className="w-56 shrink-0">
          {/* Avatar card */}
          <div className="rounded-2xl border border-black/8 bg-card p-5 mb-4 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C5FE6] to-[#4C3FBF] flex items-center justify-center text-white font-['Outfit'] font-black text-xl">
              AS
            </div>
            <div className="text-center">
              <div className="font-['Outfit'] font-bold text-sm text-foreground">{profileName}</div>
              <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                {profileCompany}
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#6C5FE6]/12 text-[#6C5FE6] text-xs font-['Outfit'] font-bold">
              Owner
            </span>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-['Outfit'] font-semibold transition-all ${activeTab === id ? 'bg-[#6C5FE6] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-[#EDF0F8]'}`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </nav>

          <div className="mt-4 pt-4 border-t border-black/6 space-y-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-['Outfit'] font-semibold text-muted-foreground hover:text-foreground hover:bg-[#EDF0F8] transition-all"
            >
              <LayoutDashboard size={15} /> Dashboard
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-['Outfit'] font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* ── Profile tab ── */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Outfit'] font-black text-2xl text-foreground mb-1">
                  Profile Settings
                </h2>
                <p className="text-sm text-muted-foreground font-['Inter']">
                  Manage your personal information and account details.
                </p>
              </div>

              <div className="rounded-2xl border border-black/8 bg-card p-7">
                <div className="flex items-center gap-5 mb-8 pb-7 border-b border-black/6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C5FE6] to-[#4C3FBF] flex items-center justify-center text-white font-['Outfit'] font-black text-2xl">
                    AS
                  </div>
                  <div>
                    <div className="font-['Outfit'] font-bold text-foreground mb-1">
                      {profileName}
                    </div>
                    <div className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                      {profileEmail}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <GhostBtn small>
                        <Upload size={13} /> Upload photo
                      </GhostBtn>
                      <GhostBtn small>Remove</GhostBtn>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: 'Full Name', value: profileName, set: setProfileName, type: 'text' },
                    {
                      label: 'Email Address',
                      value: profileEmail,
                      set: setProfileEmail,
                      type: 'email',
                    },
                    {
                      label: 'Phone Number',
                      value: profilePhone,
                      set: setProfilePhone,
                      type: 'tel',
                    },
                    {
                      label: 'Company Name',
                      value: profileCompany,
                      set: setProfileCompany,
                      type: 'text',
                    },
                  ].map(({ label, value, set, type }) => (
                    <div key={label}>
                      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                        {label}
                      </label>
                      <input
                        type={type}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-2.5 text-sm font-['Outfit'] text-foreground focus:outline-none focus:border-[#6C5FE6]/50 focus:bg-white transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                      Account Type
                    </label>
                    <div className="relative">
                      <select className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-2.5 text-sm font-['Outfit'] text-foreground focus:outline-none appearance-none cursor-pointer">
                        {['Business', 'Individual', 'Agency'].map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                      <ChevronDown
                        size={13}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                      Time Zone
                    </label>
                    <div className="relative">
                      <select className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-2.5 text-sm font-['Outfit'] text-foreground focus:outline-none appearance-none cursor-pointer">
                        {['IST (UTC+5:30)', 'UTC', 'PST (UTC-8)', 'EST (UTC-5)'].map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </select>
                      <ChevronDown
                        size={13}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-5 border-t border-black/6">
                  <PrimaryBtn onClick={handleSave}>
                    <Check size={14} /> Save changes
                  </PrimaryBtn>
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
                <div className="font-['Outfit'] font-bold text-sm text-red-600 mb-1">
                  Danger Zone
                </div>
                <div className="text-xs text-red-500 font-['Inter'] mb-4">
                  These actions are irreversible. Proceed with caution.
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-xl border border-red-200 bg-white text-red-500 text-sm font-['Outfit'] font-semibold hover:bg-red-50 transition-all">
                    Deactivate Account
                  </button>
                  <button className="px-4 py-2 rounded-xl border border-red-300 bg-red-500 text-white text-sm font-['Outfit'] font-semibold hover:bg-red-600 transition-all">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Security tab ── */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Outfit'] font-black text-2xl text-foreground mb-1">
                  Security
                </h2>
                <p className="text-sm text-muted-foreground font-['Inter']">
                  Manage your password and two-factor authentication.
                </p>
              </div>

              <div className="rounded-2xl border border-black/8 bg-card p-7 space-y-6">
                <div>
                  <h3 className="font-['Outfit'] font-bold text-base text-foreground mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4 max-w-md">
                    {['Current password', 'New password', 'Confirm new password'].map((lbl) => (
                      <div key={lbl}>
                        <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                          {lbl}
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-2.5 text-sm font-['Outfit'] text-foreground focus:outline-none focus:border-[#6C5FE6]/50 focus:bg-white transition-colors"
                        />
                      </div>
                    ))}
                    <PrimaryBtn small>
                      <Check size={13} /> Update password
                    </PrimaryBtn>
                  </div>
                </div>

                <div className="border-t border-black/6 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-['Outfit'] font-bold text-base text-foreground">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-xs text-muted-foreground font-['Inter'] mt-0.5">
                        Add an extra layer of security with an authenticator app or SMS.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200">
                      <AlertTriangle size={13} className="text-amber-500" />
                      <span className="text-xs text-amber-700 font-['Outfit'] font-semibold">
                        Not enabled
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <GhostBtn small>
                      <Smartphone size={13} /> Enable via SMS
                    </GhostBtn>
                    <GhostBtn small>
                      <Shield size={13} /> Use authenticator app
                    </GhostBtn>
                  </div>
                </div>

                <div className="border-t border-black/6 pt-6">
                  <h3 className="font-['Outfit'] font-bold text-base text-foreground mb-3">
                    Connected Accounts
                  </h3>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-black/8 bg-[#F5F7FC]">
                    <div className="flex items-center gap-3">
                      <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                          fill="#4285F4"
                        />
                        <path
                          d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                          fill="#34A853"
                        />
                        <path
                          d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
                          fill="#EA4335"
                        />
                      </svg>
                      <div>
                        <div className="text-sm font-['Outfit'] font-semibold text-foreground">
                          Google
                        </div>
                        <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                          arjun@gmail.com · Connected
                        </div>
                      </div>
                    </div>
                    <button className="text-xs text-red-500 font-['Outfit'] font-semibold hover:underline">
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Team tab ── */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-['Outfit'] font-black text-2xl text-foreground mb-1">
                    Team Members
                  </h2>
                  <p className="text-sm text-muted-foreground font-['Inter']">
                    Invite and manage who has access to your PixelWorld account.
                  </p>
                </div>
                <Badge color="purple">{members.length} members</Badge>
              </div>

              {/* Invite form */}
              <div className="rounded-2xl border border-[#6C5FE6]/20 bg-[#6C5FE6]/4 p-5">
                <div className="text-sm font-['Outfit'] font-bold text-foreground mb-4 flex items-center gap-2">
                  <Plus size={15} className="text-[#6C5FE6]" /> Invite a team member
                </div>
                <div className="flex gap-3">
                  <input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    type="email"
                    className="flex-1 bg-white border border-black/8 rounded-xl px-4 py-2.5 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50 transition-colors"
                  />
                  <div className="relative">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="bg-white border border-black/8 rounded-xl px-4 py-2.5 pr-9 text-sm font-['Outfit'] text-foreground focus:outline-none appearance-none cursor-pointer"
                    >
                      {UAM_ROLES.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={13}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                  </div>
                  <PrimaryBtn small onClick={handleInvite}>
                    <Plus size={13} /> Send invite
                  </PrimaryBtn>
                </div>
              </div>

              {/* Members table */}
              <div className="rounded-2xl border border-black/8 bg-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/6 bg-[#F5F7FC]">
                      {['Member', 'Role', 'Status', 'Joined', 'Last active', ''].map((h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-xs font-['Outfit'] font-bold text-muted-foreground"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((m) => {
                      const roleObj = UAM_ROLES.find((r) => r.id === m.role)
                      return (
                        <tr
                          key={m.id}
                          className="border-b border-black/4 last:border-0 hover:bg-[#F5F7FC]/60 transition-colors"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C5FE6]/20 to-[#6C5FE6]/40 flex items-center justify-center text-[#6C5FE6] font-['Outfit'] font-bold text-xs shrink-0">
                                {m.avatar}
                              </div>
                              <div>
                                <div className="text-sm font-['Outfit'] font-semibold text-foreground">
                                  {m.name}
                                </div>
                                <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                                  {m.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {editingMember === m.id ? (
                              <select
                                defaultValue={m.role}
                                onChange={(e) => updateRole(m.id, e.target.value)}
                                autoFocus
                                className="bg-[#EDF0F8] border border-[#6C5FE6]/30 rounded-lg px-2 py-1 text-xs font-['Outfit'] font-semibold text-[#6C5FE6] focus:outline-none cursor-pointer"
                              >
                                {UAM_ROLES.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.label}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span
                                className={`px-2.5 py-1 rounded-lg text-xs font-['Outfit'] font-bold ${roleObj?.color}`}
                              >
                                {roleObj?.label}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`flex items-center gap-1.5 text-xs font-['JetBrains_Mono'] font-medium ${m.status === 'active' ? 'text-[#00A882]' : 'text-amber-500'}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${m.status === 'active' ? 'bg-[#00A882]' : 'bg-amber-400'}`}
                              />
                              {m.status === 'active' ? 'Active' : 'Invited'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground font-['JetBrains_Mono']">
                            {m.joined}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground font-['JetBrains_Mono']">
                            {m.lastActive}
                          </td>
                          <td className="px-5 py-3.5">
                            {m.id !== 1 && (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setEditingMember(m.id === editingMember ? null : m.id)
                                  }
                                  className="p-1.5 rounded-lg hover:bg-[#EDF0F8] text-muted-foreground hover:text-[#6C5FE6] transition-colors"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => removeMember(m.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Permissions tab ── */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Outfit'] font-black text-2xl text-foreground mb-1">
                  Role Permissions
                </h2>
                <p className="text-sm text-muted-foreground font-['Inter']">
                  Overview of what each role can access and manage.
                </p>
              </div>

              {/* Role cards */}
              <div className="grid grid-cols-2 gap-4">
                {UAM_ROLES.map((role) => (
                  <div key={role.id} className="rounded-2xl border border-black/8 bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-['Outfit'] font-bold ${role.color}`}
                      >
                        {role.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-['Inter'] mb-4">{role.desc}</p>
                    <div className="space-y-2">
                      {[
                        ['View campaigns', ['owner', 'manager', 'analyst', 'billing']],
                        ['Create / edit ads', ['owner', 'manager']],
                        ['Approve campaigns', ['owner']],
                        ['View analytics', ['owner', 'manager', 'analyst']],
                        ['Manage billing', ['owner', 'billing']],
                        ['Invite team members', ['owner']],
                        ['Delete account', ['owner']],
                      ].map(([perm, allowed]) => {
                        const has = (allowed as string[]).includes(role.id)
                        return (
                          <div key={perm as string} className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground font-['Inter']">
                              {perm as string}
                            </span>
                            <span
                              className={`text-xs font-['JetBrains_Mono'] font-semibold ${has ? 'text-[#00A882]' : 'text-black/20'}`}
                            >
                              {has ? '✓' : '✗'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Sessions tab ── */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-['Outfit'] font-black text-2xl text-foreground mb-1">
                  Active Sessions
                </h2>
                <p className="text-sm text-muted-foreground font-['Inter']">
                  Manage all devices currently signed in to your account.
                </p>
              </div>

              <div className="rounded-2xl border border-black/8 bg-card divide-y divide-black/5 overflow-hidden">
                {[
                  {
                    device: 'Chrome on macOS',
                    location: 'Chennai, India',
                    ip: '103.28.xx.xx',
                    time: 'Active now',
                    icon: Laptop,
                    current: true,
                  },
                  {
                    device: 'Safari on iPhone 15',
                    location: 'Chennai, India',
                    ip: '103.28.xx.xx',
                    time: '2 hours ago',
                    icon: Smartphone,
                    current: false,
                  },
                  {
                    device: 'Chrome on Windows',
                    location: 'Mumbai, India',
                    ip: '49.44.xx.xx',
                    time: '3 days ago',
                    icon: Laptop,
                    current: false,
                  },
                  {
                    device: 'Firefox on Ubuntu',
                    location: 'Bangalore, India',
                    ip: '122.167.xx.xx',
                    time: '7 days ago',
                    icon: Laptop,
                    current: false,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#F5F7FC] transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.current ? 'bg-[#6C5FE6]/12' : 'bg-[#EDF0F8]'}`}
                    >
                      <s.icon
                        size={18}
                        className={s.current ? 'text-[#6C5FE6]' : 'text-muted-foreground'}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-['Outfit'] font-semibold text-foreground">
                          {s.device}
                        </span>
                        {s.current && (
                          <span className="px-2 py-0.5 rounded-full bg-[#00A882]/12 text-[#00A882] text-[10px] font-['Outfit'] font-bold">
                            This device
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                        {s.location} · {s.ip} · {s.time}
                      </div>
                    </div>
                    {!s.current && (
                      <button className="text-xs text-red-500 font-['Outfit'] font-semibold hover:underline shrink-0">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button className="px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-['Outfit'] font-semibold hover:bg-red-50 transition-all">
                  Sign out all other devices
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

