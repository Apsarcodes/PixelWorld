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
  id: number
  brand: string
  location: string
  status: string
  dates: string
  spend: string
  views: string
  clicks: string
  ctr: string
  color: string
}

export interface UamRole {
  role: string
  badge: string
  badgeColor: string
  desc: string
  perms: string[]
}

export interface TeamMember {
  name: string
  email: string
  role: string
  roleBadgeColor: string
  status: string
  joined: string
}
