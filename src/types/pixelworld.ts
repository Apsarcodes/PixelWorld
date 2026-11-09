export type AppUser = {
  id: string | number
  email: string
  firstName: string
  lastName?: string | null
  phone?: string | null
  accountType: 'advertiser' | 'business' | 'agency'
  company?: string | null
  onboardingGoal?: string | null
}

export type StoredCampaign = {
  id: string | number
  name: string
  brandName: string
  headline: string
  description: string
  callToAction: string
  width: number
  height: number
  startsAt: string
  endsAt: string
  status: 'draft' | 'published'
  creative: {
    id: string | number
    url?: string | null
    alt?: string | null
    width?: number | null
    height?: number | null
  }
}

export type Screen =
  | 'landing'
  | 'country'
  | 'canvas'
  | 'create-ad'
  | 'checkout'
  | 'dashboard'
  | 'expiring'
  | 'admin'
  | 'admin-mod'
  | 'admin-canvas'
  | 'login'
  | 'signup'
  | 'profile'

export interface CanvasTile {
  id: number
  x: number
  y: number
  w: number
  h: number
  type: 'ad' | 'available'
  brand?: string
  tagline?: string
  color?: string
  textColor?: string
  emoji?: string
  views?: string
  clicks?: string
  category?: string
  price?: number
  size?: 'small' | 'medium' | 'large' | 'premium'
  adTitle?: string
  location?: string
  phone?: string
  website?: string
}

export interface CityCard {
  name: string
  ads: number
  available: number
  occupancy: number
  icon: string
}

export interface DashCampaign {
  name: string
  city: string
  canvas: string
  status: string
  start: string
  expiry: string
  days: number
  impressions: string
  interactions: string
  emoji: string
  color: string
}

export interface UamRole {
  id: string
  label: string
  color: string
  desc: string
}

export interface TeamMember {
  id: number
  name: string
  email: string
  role: string
  avatar: string
  status: string
  joined: string
  lastActive: string
}
