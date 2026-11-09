import React, { useRef } from 'react'
import { PwLogo } from './UIComponents'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908C16.658 12.083 17.64 9.775 17.64 9.2z"
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
  )
}

// Shared auth left panel
export function AuthPanel({
  gradient,
  title,
  subtitle,
  stats,
}: {
  gradient: string
  title: React.ReactNode
  subtitle: string
  stats?: [string, string][]
}) {
  return (
    <div
      className={`hidden lg:flex w-[46%] ${gradient} flex-col justify-between p-12 relative overflow-hidden shrink-0`}
    >
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-2xl border border-white/10"
            style={{
              width: 50 + (i % 5) * 35,
              height: 50 + (i % 4) * 25,
              top: `${(i * 13) % 92}%`,
              left: `${(i * 19) % 88}%`,
              transform: `rotate(${i * 7}deg)`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>
      <PwLogo size="md" dark />
      <div className="relative">
        <div className="text-white/90 font-['Outfit'] text-3xl font-black leading-tight mb-3">
          {title}
        </div>
        <p className="text-white/55 font-['Inter'] text-sm leading-relaxed">{subtitle}</p>
        {stats && (
          <div className="flex gap-7 mt-8">
            {stats.map(([n, l]) => (
              <div key={l}>
                <div className="text-white font-['Outfit'] font-black text-xl">{n}</div>
                <div className="text-white/45 font-['JetBrains_Mono'] text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="text-white/25 font-['JetBrains_Mono'] text-xs relative">
        © 2026 PixelWorld · All rights reserved
      </div>
    </div>
  )
}

// Shared auth input
export function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  rightEl,
  error,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rightEl?: React.ReactNode
  error?: string
}) {
  return (
    <div>
      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#EDF0F8] border rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:bg-white transition-colors ${error ? 'border-red-300 bg-red-50/50 focus:border-red-400' : 'border-black/8 focus:border-[#6C5FE6]/50'} ${rightEl ? 'pr-12' : ''}`}
        />
        {rightEl && <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightEl}</div>}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-['Inter'] flex items-center gap-1">
          <AlertTriangle size={10} />
          {error}
        </p>
      )}
    </div>
  )
}

// ── OTP Input component ───────────────────────────────────────────────────────
export function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]
  const handle = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return
    const next = [...value]
    next[i] = v.slice(-1)
    onChange(next)
    if (v && i < 5) refs[i + 1].current?.focus()
  }
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs[i - 1].current?.focus()
  }
  const handlePaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    if (digits.length) {
      onChange([...digits, ...Array(6 - digits.length).fill('')])
      refs[Math.min(digits.length, 5)].current?.focus()
    }
    e.preventDefault()
  }
  return (
    <div className="flex gap-3 justify-center">
      {refs.map((ref, i) => (
        <input
          key={i}
          ref={ref}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handle(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          className={`w-12 h-14 text-center text-xl font-['JetBrains_Mono'] font-bold rounded-xl border-2 bg-[#EDF0F8] focus:outline-none transition-all ${value[i] ? 'border-[#6C5FE6] bg-[#6C5FE6]/8 text-[#6C5FE6]' : 'border-black/10 focus:border-[#6C5FE6]/50 focus:bg-white'}`}
        />
      ))}
    </div>
  )
}

// ── Login screen — full flow: login → forgot → OTP → reset ────────────────────
type LoginView = 'login' | 'forgot' | 'otp' | 'reset' | 'reset-success'

