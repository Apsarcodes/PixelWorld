import React from 'react'
import {  } from 'lucide-react'
import type { Screen } from '@/types/pixelworld'
import { PwLogo, Badge } from '@/components/common/UIComponents'

export function NavHub({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
      <PwLogo size="lg" />
      <p className="text-muted-foreground font-['Outfit'] text-center max-w-md">
        Interactive prototype — explore all 14 screens of the PixelWorld advertising platform
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-3xl w-full">
        {[
          { label: '🌐 Landing Page', screen: 'landing' as Screen, desc: 'World map & hero' },
          { label: '🇮🇳 Country View', screen: 'country' as Screen, desc: 'India city explorer' },
          { label: '🎨 City Canvas', screen: 'canvas' as Screen, desc: 'Interactive ad canvas' },
          {
            label: '📊 Advertiser Dashboard',
            screen: 'dashboard' as Screen,
            desc: 'Campaign management',
          },
          { label: '⚠️ Expiring Ad', screen: 'expiring' as Screen, desc: 'Renewal notification' },
          { label: '🛡️ Admin Dashboard', screen: 'admin' as Screen, desc: 'Control center' },
          {
            label: '✅ Admin Moderation',
            screen: 'admin-mod' as Screen,
            desc: 'Ad review interface',
          },
          { label: '🗺️ Admin Canvas', screen: 'admin-canvas' as Screen, desc: 'Space management' },
          { label: '🔐 Login', screen: 'login' as Screen, desc: 'Sign in with email or Google' },
          { label: '📝 Sign Up', screen: 'signup' as Screen, desc: 'Create a new account' },
          {
            label: '👤 User Profile & UAM',
            screen: 'profile' as Screen,
            desc: 'Profile, team & permissions',
          },
        ].map(({ label, screen, desc }) => (
          <button
            key={screen}
            onClick={() => onNavigate(screen)}
            className="text-left p-4 rounded-2xl border border-black/8 bg-card hover:border-[#6C5FE6]/30 hover:bg-[#6C5FE6]/5 transition-all group"
          >
            <div className="font-['Outfit'] font-bold text-sm text-foreground group-hover:text-[#6C5FE6] transition-colors">
              {label}
            </div>
            <div className="text-xs text-muted-foreground font-['Inter'] mt-1">{desc}</div>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-2">
        Click any screen → navigate back with breadcrumbs or back buttons
      </p>
    </div>
  )
}

