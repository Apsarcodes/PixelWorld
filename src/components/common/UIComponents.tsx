import React from 'react'

export function PwLogo({ size = 'md', dark = false }: { size?: 'sm' | 'md' | 'lg'; dark?: boolean }) {
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' }
  return (
    <span className={`font-['Outfit'] font-black tracking-tight ${sizes[size]}`}>
      <span className={dark ? 'text-white' : 'text-[#6C5FE6]'}>Pixel</span>
      <span className={dark ? 'text-white/70' : 'text-foreground'}>World</span>
    </span>
  )
}

export function PrimaryBtn({
  children,
  onClick,
  className = '',
  small = false,
  full = false,
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  small?: boolean
  full?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 bg-[#6C5FE6] hover:bg-[#5B4ED5] text-white font-['Outfit'] font-semibold rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(124,111,247,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none ${small ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} ${full ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export function GhostBtn({
  children,
  onClick,
  className = '',
  small = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  small?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 border border-black/8 hover:border-white/20 text-foreground/80 hover:text-foreground font-['Outfit'] font-medium rounded-xl transition-all duration-200 ${small ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'} ${className}`}
    >
      {children}
    </button>
  )
}

export function Badge({
  children,
  color = 'purple',
}: {
  children: React.ReactNode
  color?: 'purple' | 'teal' | 'amber' | 'red' | 'green'
}) {
  const colors = {
    purple: 'bg-[#6C5FE6]/15 text-[#6C5FE6]',
    teal: 'bg-[#00A882]/15 text-[#00A882]',
    amber: 'bg-amber-500/15 text-amber-400',
    red: 'bg-red-500/15 text-red-400',
    green: 'bg-emerald-500/15 text-emerald-400',
  }
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-['JetBrains_Mono'] font-medium ${colors[color]}`}
    >
      {children}
    </span>
  )
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string
  value: string
  sub?: string
  icon?: React.ElementType
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${accent ? 'bg-[#6C5FE6]/10 border-[#6C5FE6]/20' : 'bg-card border-black/6'}`}
    >
      {Icon && <Icon size={20} className="text-muted-foreground mb-3" />}
      <div
        className={`text-2xl font-['Outfit'] font-bold ${accent ? 'text-[#6C5FE6]' : 'text-foreground'}`}
      >
        {value}
      </div>
      <div className="text-sm text-muted-foreground mt-0.5">{label}</div>
      {sub && <div className="text-xs text-[#00A882] mt-1">{sub}</div>}
    </div>
  )
}

