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

export default function PixelWorldApp({ initialUser }: { initialUser: AppUser | null }) {
  const [screen, setScreen] = useState<Screen>('login')
  const [currentUser, setCurrentUser] = useState<AppUser | null>(initialUser)
  const [campaigns, setCampaigns] = useState<StoredCampaign[]>([])
  const [activeCampaign, setActiveCampaign] = useState<StoredCampaign | null>(null)

  useEffect(() => {
    document.documentElement.classList.remove('dark')
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
    if ((nextScreen === 'dashboard' || nextScreen === 'profile') && !currentUser) {
      setScreen('login')
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
      {screen === 'country' && <CountryScreen onNavigate={nav} />}
      {screen === 'canvas' && (
        <CanvasScreen
          onNavigate={nav}
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
        <DashboardScreen onNavigate={nav} campaigns={campaigns} onOpenCampaign={openCampaign} />
      )}
      {screen === 'expiring' && <ExpiringAdScreen onNavigate={nav} />}
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
