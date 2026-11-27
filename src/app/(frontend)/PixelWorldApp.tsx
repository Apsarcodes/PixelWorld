'use client'

import React, { useState, useEffect } from 'react'
import type { AppUser, StoredCampaign, Screen } from '@/types/pixelworld'
import { previewAuthorizationHeaders, clearPreviewSession } from '@/lib/session'
import { LandingScreen } from '@/components/screens/LandingScreen'
import { CountryScreen } from '@/components/screens/CountryScreen'
import { CanvasScreen } from '@/components/screens/CanvasScreen'
import { CreateAdScreen } from '@/components/screens/CreateAdScreen'
import { CheckoutScreen } from '@/components/screens/CheckoutScreen'
import { DashboardScreen } from '@/components/screens/DashboardScreen'
import { ExpiringAdScreen } from '@/components/screens/ExpiringAdScreen'
import { AdminDashboard } from '@/components/screens/AdminDashboard'
import { AdminModeration } from '@/components/screens/AdminModeration'
import { AdminCanvasScreen } from '@/components/screens/AdminCanvasScreen'
import { LoginScreen } from '@/components/screens/LoginScreen'
import { SignupScreen } from '@/components/screens/SignupScreen'
import { UserProfileScreen } from '@/components/screens/UserProfileScreen'
import { isOwnerEmail } from '@/constants/auth'

export default function PixelWorldApp({ initialUser }: { initialUser: AppUser | null }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pixelworld_signed_out') === 'true') {
      return null
    }
    return initialUser
  })

  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('pixelworld_signed_out') === 'true') {
        return 'landing'
      }

      const urlParams = new URLSearchParams(window.location.search)
      const urlScreen = urlParams.get('screen') as Screen
      if (urlScreen) return urlScreen

      const saved = localStorage.getItem('pixelworld_active_screen') as Screen
      if (saved && saved !== 'login' && saved !== 'signup') {
        return saved
      }
    }
    return initialUser
      ? (initialUser.role === 'admin' || isOwnerEmail(initialUser.email) ? 'admin' : 'canvas')
      : 'landing'
  })

  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pixelworld_selected_city') || 'mumbai'
    }
    return 'mumbai'
  })
  const [campaigns, setCampaigns] = useState<StoredCampaign[]>([])
  const [activeCampaign, setActiveCampaign] = useState<StoredCampaign | null>(null)

  const [history, setHistory] = useState<Screen[]>([])

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1]
      setHistory((h) => h.slice(0, -1))
      if (typeof window !== 'undefined') {
        localStorage.setItem('pixelworld_active_screen', prev)
      }
      setScreen(prev)
    } else {
      // Sensible fallback based on current screen
      if (screen === 'checkout') setScreen(activeCampaign ? 'create-ad' : 'canvas')
      else if (screen === 'create-ad') setScreen('canvas')
      else if (screen === 'admin-mod' || screen === 'admin-canvas') setScreen('admin')
      else if (screen === 'admin') setScreen('canvas')
      else if (screen === 'dashboard') setScreen('canvas')
      else if (screen === 'country' || screen === 'login' || screen === 'signup' || screen === 'profile') setScreen('landing')
      else setScreen('landing')
    }
  }

  const handleSelectCity = (city: string) => {
    const normalized = (city || 'mumbai').toLowerCase().trim()
    setSelectedCity(normalized)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pixelworld_selected_city', normalized)
    }
  }

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const targetScreen = e.state?.screen || (new URLSearchParams(window.location.search).get('screen') as Screen)
      if (targetScreen) {
        setScreen(targetScreen)
      } else {
        setScreen('landing')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    document.documentElement.classList.remove('dark')

    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search)
      const authError = searchParams.get('auth_error')
      if (authError) {
        if (authError === 'google_oauth_credentials_missing') {
          alert(
            'Google OAuth credentials (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) need to be configured in .env.local to enable real Google Sign-In.',
          )
        } else {
          alert(`Google Sign-In notice: ${decodeURIComponent(authError)}`)
        }
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    // If user explicitly signed out, do NOT auto-login on refresh
    if (typeof window !== 'undefined' && localStorage.getItem('pixelworld_signed_out') === 'true') {
      setCurrentUser(null)
      return
    }

    // Sync current user state with session
    fetch('/api/app-auth/me', {
      credentials: 'include',
      cache: 'no-store',
      headers: previewAuthorizationHeaders(),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (typeof window !== 'undefined' && localStorage.getItem('pixelworld_signed_out') === 'true') {
          setCurrentUser(null)
          return
        }
        if (result?.user) {
          setCurrentUser(result.user)
          // Restore saved screen or stay on current
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pixelworld_active_screen') as Screen
            if (saved && saved !== 'login' && saved !== 'signup' && saved !== 'landing') {
              setScreen(saved)
            }
          }
        } else {
          setCurrentUser(null)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('pixelworld_active_screen')
          }
        }
      })
      .catch(() => {
        if (!initialUser) {
          setCurrentUser(null)
        }
      })
  }, [initialUser])

  useEffect(() => {
    if (!currentUser) {
      setCampaigns([])
      setActiveCampaign(null)
      return
    }
    fetch('/api/campaigns', {
      credentials: 'include',
      cache: 'no-store',
      headers: previewAuthorizationHeaders(),
    })
      .then((response) => (response.ok ? response.json() : { campaigns: [] }))
      .then((result) => setCampaigns(result.campaigns ?? []))
      .catch(() => setCampaigns([]))
  }, [currentUser])

  const nav = (nextScreen: Screen) => {
    if (nextScreen !== screen) {
      setHistory((prev) => [...prev, screen])
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('pixelworld_active_screen', nextScreen)
      try {
        window.history.pushState({ screen: nextScreen }, '', `?screen=${nextScreen}`)
      } catch {
        // Fallback
      }
    }

    if (!currentUser) {
      // Public visitors can freely view landing, country, canvas
      if (
        nextScreen === 'landing' ||
        nextScreen === 'country' ||
        nextScreen === 'canvas' ||
        nextScreen === 'login' ||
        nextScreen === 'signup'
      ) {
        setScreen(nextScreen)
        return
      }
      setScreen('login')
      return
    }

    const isAdmin = currentUser.role === 'admin' || isOwnerEmail(currentUser.email)

    // Admin role separation: Admins cannot make payments or book spaces; they manage inventory & view revenue
    if (isAdmin) {
      if (nextScreen === 'create-ad' || nextScreen === 'checkout') {
        setScreen('admin-canvas')
        return
      }
    } else {
      if (
        nextScreen === 'admin' ||
        nextScreen === 'admin-mod' ||
        nextScreen === 'admin-canvas'
      ) {
        setScreen('dashboard')
        return
      }
    }

    setScreen(nextScreen)
  }

  const logout = async () => {
    try {
      await fetch('/api/app-auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: previewAuthorizationHeaders(),
      })
    } catch {
      // Ignore network errors on logout
    }
    clearPreviewSession()
    if (typeof window !== 'undefined') {
      localStorage.setItem('pixelworld_signed_out', 'true')
      localStorage.removeItem('pixelworld_active_screen')
      sessionStorage.clear()
    }
    setCurrentUser(null)
    setScreen('landing')
  }

  const handleCampaignSaved = (campaign: StoredCampaign) => {
    setActiveCampaign(campaign)
    setCampaigns((current) => [campaign, ...current.filter((item) => item.id !== campaign.id)])
  }

  const openCampaign = (campaign: StoredCampaign) => {
    setActiveCampaign(campaign)
    setScreen('create-ad')
  }

  return (
    <div key={screen} className="w-full">
      {screen === 'landing' && <LandingScreen onNavigate={nav} />}
      {screen === 'country' && (
        <CountryScreen
          onNavigate={nav}
          onSelectCity={(city) => {
            handleSelectCity(city)
            nav('canvas')
          }}
        />
      )}
      {screen === 'canvas' && (
        <CanvasScreen
          onNavigate={nav}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          campaigns={campaigns}
          onCampaignSaved={handleCampaignSaved}
          user={currentUser}
        />
      )}
      {screen === 'create-ad' && (
        <CreateAdScreen
          onBack={goBack}
          onNavigate={nav}
          onCampaignSaved={handleCampaignSaved}
          initialCampaign={activeCampaign}
        />
      )}
      {screen === 'checkout' && (
        <CheckoutScreen
          onNavigate={nav}
          onBack={goBack}
          campaign={activeCampaign}
        />
      )}
      {screen === 'dashboard' && (
        <DashboardScreen
          onNavigate={nav}
          campaigns={campaigns}
          onOpenCampaign={openCampaign}
          user={currentUser}
        />
      )}
      {screen === 'expiring' && <ExpiringAdScreen onNavigate={nav} campaigns={campaigns} />}
      {screen === 'admin' && <AdminDashboard onNavigate={nav} />}
      {screen === 'admin-mod' && <AdminModeration onNavigate={nav} />}
      {screen === 'admin-canvas' && <AdminCanvasScreen onNavigate={nav} />}
      {screen === 'login' && (
        <LoginScreen
          onNavigate={nav}
          onAuthenticated={(user) => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('pixelworld_signed_out')
            }
            setCurrentUser(user)
            const isAdmin = user.role === 'admin' || isOwnerEmail(user.email)
            nav(isAdmin ? 'admin' : 'canvas')
          }}
        />
      )}
      {screen === 'signup' && (
        <SignupScreen
          onNavigate={nav}
          onAuthenticated={(user) => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('pixelworld_signed_out')
            }
            setCurrentUser(user)
            const isAdmin = user.role === 'admin' || isOwnerEmail(user.email)
            nav(isAdmin ? 'admin' : 'canvas')
          }}
        />
      )}
      {screen === 'profile' && currentUser && (
        <UserProfileScreen onNavigate={nav} user={currentUser} onLogout={logout} />
      )}
    </div>
  )
}
