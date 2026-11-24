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
  const [screen, setScreen] = useState<Screen>('login')
  const [currentUser, setCurrentUser] = useState<AppUser | null>(initialUser)
  const [selectedCity, setSelectedCity] = useState<string>('chennai')
  const [campaigns, setCampaigns] = useState<StoredCampaign[]>([])
  const [activeCampaign, setActiveCampaign] = useState<StoredCampaign | null>(null)

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

    if (!initialUser) {
      fetch('/api/app-auth/me', {
        credentials: 'include',
        cache: 'no-store',
        headers: previewAuthorizationHeaders(),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.user) {
            setCurrentUser(result.user)
            setScreen('dashboard')
          } else {
            setCurrentUser(null)
            setScreen('login')
          }
        })
        .catch(() => {
          setCurrentUser(null)
          setScreen('login')
        })
    } else {
      setScreen('dashboard')
    }
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
    if (!currentUser) {
      if (nextScreen !== 'login' && nextScreen !== 'signup') {
        setScreen('login')
        return
      }
      setScreen(nextScreen)
      return
    }

    const isAdmin = currentUser.role === 'admin' || isOwnerEmail(currentUser.email)

    if (
      (nextScreen === 'admin' ||
        nextScreen === 'admin-mod' ||
        nextScreen === 'admin-canvas') &&
      !isAdmin
    ) {
      setScreen('dashboard')
      return
    }

    setScreen(nextScreen)
  }

  const logout = async () => {
    await fetch('/api/app-auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: previewAuthorizationHeaders(),
    })
    clearPreviewSession()
    setCurrentUser(null)
    setScreen('login')
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
            setSelectedCity(city)
            nav('canvas')
          }}
        />
      )}
      {screen === 'canvas' && (
        <CanvasScreen
          onNavigate={nav}
          selectedCity={selectedCity}
          campaigns={campaigns}
          onCampaignSaved={handleCampaignSaved}
        />
      )}
      {screen === 'create-ad' && (
        <CreateAdScreen
          onBack={() => nav('canvas')}
          onNavigate={nav}
          onCampaignSaved={handleCampaignSaved}
          initialCampaign={activeCampaign}
        />
      )}
      {screen === 'checkout' && <CheckoutScreen onNavigate={nav} campaign={activeCampaign} />}
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
      {screen === 'login' && <LoginScreen onNavigate={nav} onAuthenticated={setCurrentUser} />}
      {screen === 'signup' && <SignupScreen onNavigate={nav} onAuthenticated={setCurrentUser} />}
      {screen === 'profile' && currentUser && (
        <UserProfileScreen onNavigate={nav} user={currentUser} onLogout={logout} />
      )}
    </div>
  )
}
