'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import {
  Globe,
  Search,
  ChevronRight,
  Zap,
  MapPin,
  TrendingUp,
  Share2,
  Phone,
  MessageCircle,
  Navigation,
  ShoppingBag,
  Eye,
  MousePointer,
  Plus,
  Minus,
  Maximize2,
  Map,
  Upload,
  Bell,
  Settings,
  BarChart2,
  Users,
  CreditCard,
  Check,
  X,
  AlertTriangle,
  Clock,
  Filter,
  RefreshCw,
  Shield,
  Edit2,
  ExternalLink,
  ArrowLeft,
  LayoutDashboard,
  FileImage,
  Wallet,
  UserCircle,
  Layers,
  Activity,
  DollarSign,
  Building2,
  Megaphone,
  ChevronLeft,
  ChevronDown,
  Play,
  RotateCcw,
  Package,
  Star,
  LogOut,
  Home,
  Target,
  Grid3X3,
  Flag,
  Calendar,
  Sparkles,
  ArrowRight,
  MoreHorizontal,
  Laptop,
  Smartphone,
  BookOpen,
  PieChart,
  HelpCircle,
  Inbox,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type AppUser = {
  id: string | number
  email: string
  firstName: string
  lastName?: string | null
  phone?: string | null
  accountType: 'advertiser' | 'business' | 'agency'
  company?: string | null
  onboardingGoal?: string | null
}

type StoredCampaign = {
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

const PREVIEW_SESSION_KEY = 'pixelworld-preview-session'

function previewAuthorizationHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = window.sessionStorage.getItem(PREVIEW_SESSION_KEY)
  return token ? { Authorization: `JWT ${token}` } : {}
}

function savePreviewSession(token: unknown) {
  if (typeof window === 'undefined' || typeof token !== 'string' || !token) return
  window.sessionStorage.setItem(PREVIEW_SESSION_KEY, token)
}

function clearPreviewSession() {
  if (typeof window !== 'undefined') window.sessionStorage.removeItem(PREVIEW_SESSION_KEY)
}

type Screen =
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

interface CanvasTile {
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

interface CityCard {
  name: string
  ads: number
  available: number
  occupancy: number
  icon: string
}

function CreativeImage({
  campaign,
  sizes,
  className = 'object-cover',
}: {
  campaign: StoredCampaign
  sizes: string
  className?: string
}) {
  if (!campaign.creative.url) return null
  return (
    <Image
      src={campaign.creative.url}
      alt={campaign.creative.alt || `${campaign.brandName} creative`}
      fill
      sizes={sizes}
      className={className}
    />
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CELL = 80
const CANVAS_W = 3200
const CANVAS_H = 2400

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TILES: CanvasTile[] = [
  // Row A (y=0)
  {
    id: 1,
    x: 0,
    y: 0,
    w: 320,
    h: 320,
    type: 'ad',
    brand: 'Swiggy',
    tagline: 'Delivering happiness, fast',
    color: '#FF6B35',
    textColor: '#fff',
    emoji: '🍕',
    views: '124K',
    clicks: '8.2K',
    category: 'Food Delivery',
    adTitle: 'Order food in 30 minutes',
    location: 'Chennai, TN',
    phone: '+91 9876543210',
    website: 'swiggy.com',
  },
  {
    id: 2,
    x: 320,
    y: 0,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Zomato',
    tagline: 'Discover great food near you',
    color: '#E23744',
    textColor: '#fff',
    emoji: '🍽️',
    views: '67K',
    clicks: '4.2K',
    category: 'Food Delivery',
    adTitle: 'Best restaurants nearby',
    location: 'Chennai, TN',
    phone: '+91 9876500001',
    website: 'zomato.com',
  },
  { id: 3, x: 320, y: 160, w: 160, h: 80, type: 'available', price: 599, size: 'small' },
  { id: 4, x: 480, y: 160, w: 80, h: 80, type: 'available', price: 299, size: 'small' },
  {
    id: 5,
    x: 560,
    y: 0,
    w: 160,
    h: 160,
    type: 'ad',
    brand: 'Nykaa',
    tagline: 'Beauty redefined',
    color: '#F43397',
    textColor: '#fff',
    emoji: '💄',
    views: '38K',
    clicks: '2.9K',
    category: 'Beauty',
    adTitle: 'New arrivals this season',
    location: 'Chennai, TN',
    phone: '+91 9800001234',
    website: 'nykaa.com',
  },
  { id: 6, x: 560, y: 160, w: 160, h: 80, type: 'available', price: 499, size: 'small' },
  {
    id: 7,
    x: 720,
    y: 0,
    w: 320,
    h: 320,
    type: 'ad',
    brand: 'Flipkart',
    tagline: 'India Ki Shopping Destination',
    color: '#2874F0',
    textColor: '#fff',
    emoji: '🛍️',
    views: '98K',
    clicks: '6.1K',
    category: 'E-Commerce',
    adTitle: 'Big Billion Days Sale',
    location: 'Chennai, TN',
    phone: '+91 1800202999',
    website: 'flipkart.com',
  },
  {
    id: 8,
    x: 1040,
    y: 0,
    w: 160,
    h: 160,
    type: 'ad',
    brand: 'Paytm',
    tagline: 'Karo Payments, Pao Cashback',
    color: '#00BAF2',
    textColor: '#fff',
    emoji: '💸',
    views: '52K',
    clicks: '3.4K',
    category: 'Fintech',
    adTitle: 'Pay & earn instantly',
    location: 'Chennai, TN',
    phone: '+91 9999999999',
    website: 'paytm.com',
  },
  { id: 9, x: 1040, y: 160, w: 80, h: 80, type: 'available', price: 299, size: 'small' },
  { id: 10, x: 1120, y: 160, w: 80, h: 80, type: 'available', price: 299, size: 'small' },
  {
    id: 11,
    x: 1200,
    y: 0,
    w: 240,
    h: 240,
    type: 'ad',
    brand: 'Meesho',
    tagline: "Shop India's widest selection",
    color: '#9C27B0',
    textColor: '#fff',
    emoji: '👗',
    views: '71K',
    clicks: '5.8K',
    category: 'Social Commerce',
    adTitle: 'Resell & earn from home',
    location: 'Chennai, TN',
    phone: '+91 8048498899',
    website: 'meesho.com',
  },
  {
    id: 12,
    x: 1440,
    y: 0,
    w: 320,
    h: 320,
    type: 'ad',
    brand: 'CRED',
    tagline: 'Rewards for the creditworthy',
    color: '#1A1A2E',
    textColor: '#FFD700',
    emoji: '💳',
    views: '87K',
    clicks: '5.4K',
    category: 'Fintech',
    adTitle: 'Pay credit card bills, earn CRED coins',
    location: 'Chennai, TN',
    phone: '+91 8068727272',
    website: 'cred.club',
  },
  {
    id: 13,
    x: 1760,
    y: 0,
    w: 160,
    h: 240,
    type: 'ad',
    brand: 'Urban Company',
    tagline: 'Home services at your doorstep',
    color: '#54B435',
    textColor: '#fff',
    emoji: '🔧',
    views: '29K',
    clicks: '1.8K',
    category: 'Services',
    adTitle: 'Book AC repair & more',
    location: 'Chennai, TN',
    phone: '+91 9599997777',
    website: 'urbancompany.com',
  },
  {
    id: 14,
    x: 1920,
    y: 0,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'PhonePe',
    tagline: 'Payments done right',
    color: '#5F259F',
    textColor: '#fff',
    emoji: '📱',
    views: '44K',
    clicks: '2.7K',
    category: 'Fintech',
    adTitle: 'UPI payments & bill pay',
    location: 'Chennai, TN',
    phone: '+91 9999999991',
    website: 'phonepe.com',
  },
  { id: 15, x: 1920, y: 160, w: 240, h: 80, type: 'available', price: 799, size: 'medium' },
  { id: 16, x: 2160, y: 0, w: 80, h: 240, type: 'available', price: 499, size: 'small' },
  {
    id: 17,
    x: 2240,
    y: 0,
    w: 320,
    h: 480,
    type: 'ad',
    brand: 'Dream11',
    tagline: 'Your Fantasy. Your Game.',
    color: '#2D1B69',
    textColor: '#00A882',
    emoji: '🏏',
    views: '156K',
    clicks: '12K',
    category: 'Gaming & Sports',
    adTitle: 'Create team. Win big. Play IPL Fantasy!',
    location: 'Chennai, TN',
    phone: '+91 9664994999',
    website: 'dream11.com',
  },
  {
    id: 18,
    x: 2560,
    y: 0,
    w: 240,
    h: 240,
    type: 'ad',
    brand: 'Byjus',
    tagline: 'The learning app',
    color: '#7C3AED',
    textColor: '#fff',
    emoji: '📚',
    views: '63K',
    clicks: '4.1K',
    category: 'EdTech',
    adTitle: 'Learn smarter, not harder',
    location: 'Chennai, TN',
    phone: '+91 9100101123',
    website: 'byjus.com',
  },
  {
    id: 19,
    x: 2800,
    y: 0,
    w: 160,
    h: 160,
    type: 'ad',
    brand: 'Ola',
    tagline: 'Chalo Freshly!',
    color: '#2C2C2C',
    textColor: '#FCD34D',
    emoji: '🚗',
    views: '48K',
    clicks: '3.1K',
    category: 'Transport',
    adTitle: 'Ride in style across Chennai',
    location: 'Chennai, TN',
    phone: '+91 9999999099',
    website: 'olacabs.com',
  },
  { id: 20, x: 2800, y: 160, w: 160, h: 80, type: 'available', price: 499, size: 'small' },
  {
    id: 21,
    x: 2960,
    y: 0,
    w: 240,
    h: 240,
    type: 'ad',
    brand: 'Myntra',
    tagline: "India\'s fashion capital",
    color: '#FF3F6C',
    textColor: '#fff',
    emoji: '👠',
    views: '82K',
    clicks: '6.3K',
    category: 'Fashion',
    adTitle: 'End of season sale — up to 70% off',
    location: 'Chennai, TN',
    phone: '+91 1800102040',
    website: 'myntra.com',
  },

  // Row B (y=320)
  {
    id: 22,
    x: 0,
    y: 320,
    w: 160,
    h: 160,
    type: 'ad',
    brand: 'BookMyShow',
    tagline: 'Movies. Events. Sports.',
    color: '#E71A26',
    textColor: '#fff',
    emoji: '🎬',
    views: '33K',
    clicks: '2.2K',
    category: 'Entertainment',
    adTitle: 'Book tickets for KGF 3',
    location: 'Chennai, TN',
    phone: '+91 2266208000',
    website: 'bookmyshow.com',
  },
  { id: 23, x: 160, y: 320, w: 160, h: 80, type: 'available', price: 499, size: 'small' },
  { id: 24, x: 160, y: 400, w: 80, h: 80, type: 'available', price: 299, size: 'small' },
  { id: 25, x: 240, y: 400, w: 80, h: 80, type: 'available', price: 299, size: 'small' },
  {
    id: 26,
    x: 320,
    y: 240,
    w: 400,
    h: 240,
    type: 'ad',
    brand: 'Amazon India',
    tagline: 'Karo Puri Shopping',
    color: '#FF9900',
    textColor: '#131A22',
    emoji: '📦',
    views: '203K',
    clicks: '18K',
    category: 'E-Commerce',
    adTitle: 'Prime Day Deals — shop now!',
    location: 'Chennai, TN',
    phone: '+91 1800419200',
    website: 'amazon.in',
  },
  {
    id: 27,
    x: 720,
    y: 320,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Dunzo',
    tagline: 'Get anything delivered',
    color: '#00A878',
    textColor: '#fff',
    emoji: '⚡',
    views: '21K',
    clicks: '1.4K',
    category: 'Quick Commerce',
    adTitle: '10-minute delivery to your door',
    location: 'Chennai, TN',
    phone: '+91 9999998888',
    website: 'dunzo.com',
  },
  { id: 28, x: 720, y: 480, w: 160, h: 80, type: 'available', price: 499, size: 'small' },
  { id: 29, x: 880, y: 480, w: 80, h: 80, type: 'available', price: 299, size: 'small' },
  {
    id: 30,
    x: 960,
    y: 320,
    w: 240,
    h: 240,
    type: 'ad',
    brand: 'Rapido',
    tagline: 'Bike taxis & more',
    color: '#FFCC00',
    textColor: '#1A1A1A',
    emoji: '🏍️',
    views: '27K',
    clicks: '1.9K',
    category: 'Transport',
    adTitle: 'Affordable rides across the city',
    location: 'Chennai, TN',
    phone: '+91 9999997777',
    website: 'rapido.bike',
  },
  {
    id: 31,
    x: 1200,
    y: 240,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Lenskart',
    tagline: 'Vision is life',
    color: '#004B83',
    textColor: '#fff',
    emoji: '👓',
    views: '35K',
    clicks: '2.6K',
    category: 'Eyewear',
    adTitle: 'Buy 1 Get 1 Free on all frames',
    location: 'Chennai, TN',
    phone: '+91 1800111010',
    website: 'lenskart.com',
  },
  { id: 32, x: 1200, y: 400, w: 240, h: 80, type: 'available', price: 599, size: 'medium' },
  {
    id: 33,
    x: 1440,
    y: 320,
    w: 160,
    h: 160,
    type: 'ad',
    brand: 'Cult.fit',
    tagline: 'Move. Eat. Meditate.',
    color: '#E03E4D',
    textColor: '#fff',
    emoji: '💪',
    views: '19K',
    clicks: '1.3K',
    category: 'Health & Fitness',
    adTitle: "Join Chennai\'s best gym chain",
    location: 'Chennai, TN',
    phone: '+91 9980899990',
    website: 'cult.fit',
  },
  { id: 34, x: 1600, y: 320, w: 160, h: 160, type: 'available', price: 799, size: 'medium' },
  {
    id: 35,
    x: 1760,
    y: 240,
    w: 480,
    h: 320,
    type: 'ad',
    brand: 'MakeMyTrip',
    tagline: 'Dil Toh Roaming Hai',
    color: '#E8312A',
    textColor: '#fff',
    emoji: '✈️',
    views: '142K',
    clicks: '10.1K',
    category: 'Travel',
    adTitle: 'Book flights to Maldives from ₹12,999',
    location: 'Chennai, TN',
    phone: '+91 1800102010',
    website: 'makemytrip.com',
  },
  { id: 36, x: 2240, y: 480, w: 320, h: 80, type: 'available', price: 1299, size: 'large' },
  {
    id: 37,
    x: 2560,
    y: 240,
    w: 240,
    h: 320,
    type: 'ad',
    brand: 'Boat',
    tagline: 'Designed for the underdogs',
    color: '#1A1A1A',
    textColor: '#FF4136',
    emoji: '🎧',
    views: '56K',
    clicks: '4.8K',
    category: 'Electronics',
    adTitle: 'New Nirvana earbuds — ₹1,499',
    location: 'Chennai, TN',
    phone: '+91 9971111113',
    website: 'boat-lifestyle.com',
  },
  {
    id: 38,
    x: 2800,
    y: 240,
    w: 160,
    h: 320,
    type: 'ad',
    brand: 'Tata 1mg',
    tagline: 'India ki pharmacy',
    color: '#E61A23',
    textColor: '#fff',
    emoji: '💊',
    views: '31K',
    clicks: '2.1K',
    category: 'Healthcare',
    adTitle: 'Order medicines in 2 hours',
    location: 'Chennai, TN',
    phone: '+91 1800889001',
    website: '1mg.com',
  },
  {
    id: 39,
    x: 2960,
    y: 240,
    w: 240,
    h: 320,
    type: 'ad',
    brand: 'Wakefit',
    tagline: 'Sleep is your superpower',
    color: '#2C3E50',
    textColor: '#00A882',
    emoji: '🛌',
    views: '23K',
    clicks: '1.6K',
    category: 'Home & Living',
    adTitle: 'Orthopedic mattresses from ₹6,999',
    location: 'Chennai, TN',
    phone: '+91 8068263636',
    website: 'wakefit.co',
  },

  // Row C (y=560)
  {
    id: 40,
    x: 0,
    y: 480,
    w: 320,
    h: 240,
    type: 'ad',
    brand: 'Zepto',
    tagline: '10-minute grocery delivery',
    color: '#7B2FBE',
    textColor: '#fff',
    emoji: '🥦',
    views: '44K',
    clicks: '3.2K',
    category: 'Quick Commerce',
    adTitle: 'Fresh groceries at lightning speed',
    location: 'Chennai, TN',
    phone: '+91 9920202020',
    website: 'zeptonow.com',
  },
  { id: 41, x: 0, y: 720, w: 160, h: 160, type: 'available', price: 599, size: 'medium' },
  { id: 42, x: 160, y: 720, w: 160, h: 80, type: 'available', price: 499, size: 'small' },
  {
    id: 43,
    x: 320,
    y: 560,
    w: 400,
    h: 240,
    type: 'ad',
    brand: "Domino\'s India",
    tagline: '30 minutes or free',
    color: '#006491',
    textColor: '#fff',
    emoji: '🍕',
    views: '88K',
    clicks: '7.2K',
    category: 'Food & Dining',
    adTitle: 'New Cheese Burst pizza — order now!',
    location: 'Chennai, TN',
    phone: '+91 7666733333',
    website: 'dominos.co.in',
  },
  {
    id: 44,
    x: 720,
    y: 560,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Jio',
    tagline: 'True 5G. True Unlimited.',
    color: '#014DCB',
    textColor: '#fff',
    emoji: '📶',
    views: '91K',
    clicks: '5.9K',
    category: 'Telecom',
    adTitle: '5G recharge plans from ₹299',
    location: 'Chennai, TN',
    phone: '1800889999',
    website: 'jio.com',
  },
  {
    id: 45,
    x: 960,
    y: 560,
    w: 240,
    h: 240,
    type: 'ad',
    brand: 'SBI Card',
    tagline: 'Simply click. Simply save.',
    color: '#22409A',
    textColor: '#fff',
    emoji: '💰',
    views: '37K',
    clicks: '2.8K',
    category: 'Banking',
    adTitle: 'Apply for SBI SimplySAVE card',
    location: 'Chennai, TN',
    phone: '1800180044',
    website: 'sbicard.com',
  },
  {
    id: 46,
    x: 1200,
    y: 480,
    w: 240,
    h: 320,
    type: 'ad',
    brand: 'Tanishq',
    tagline: 'A million moments of gold',
    color: '#8B6914',
    textColor: '#FFD700',
    emoji: '💍',
    views: '29K',
    clicks: '1.8K',
    category: 'Jewellery',
    adTitle: 'Akshaya Tritiya gold collection',
    location: 'Chennai, TN',
    phone: '+91 1800266668',
    website: 'tanishq.co.in',
  },
  {
    id: 47,
    x: 1440,
    y: 480,
    w: 320,
    h: 320,
    type: 'ad',
    brand: 'Kia India',
    tagline: 'Movement that inspires',
    color: '#05141F',
    textColor: '#FF3131',
    emoji: '🚙',
    views: '74K',
    clicks: '5.6K',
    category: 'Automotive',
    adTitle: 'All-new Kia Seltos — Book a test drive',
    location: 'Chennai, TN',
    phone: '+91 1800108484',
    website: 'kia.com/in',
  },
  {
    id: 48,
    x: 1760,
    y: 560,
    w: 480,
    h: 240,
    type: 'ad',
    brand: 'Muthoot Finance',
    tagline: 'Gold loan in 3 minutes',
    color: '#B8860B',
    textColor: '#fff',
    emoji: '🏦',
    views: '42K',
    clicks: '3.1K',
    category: 'Finance',
    adTitle: 'Emergency funds against your gold',
    location: 'Chennai, TN',
    phone: '+91 1800313030',
    website: 'muthootfinance.com',
  },
  {
    id: 49,
    x: 2240,
    y: 560,
    w: 320,
    h: 240,
    type: 'ad',
    brand: 'Zoho',
    tagline: 'Run your entire business',
    color: '#C62025',
    textColor: '#fff',
    emoji: '💻',
    views: '51K',
    clicks: '4.2K',
    category: 'SaaS / B2B',
    adTitle: 'CRM, books & more — free trial now',
    location: 'Chennai, TN',
    phone: '+91 4443553333',
    website: 'zoho.com',
  },
  {
    id: 50,
    x: 2560,
    y: 560,
    w: 240,
    h: 240,
    type: 'ad',
    brand: 'KFC India',
    tagline: "Finger Lickin\' Good",
    color: '#E8000D',
    textColor: '#fff',
    emoji: '🍗',
    views: '66K',
    clicks: '5.1K',
    category: 'Food & Dining',
    adTitle: 'Try our new Zinger Stacker Burger',
    location: 'Chennai, TN',
    phone: '+91 9980100200',
    website: 'kfc.co.in',
  },
  {
    id: 51,
    x: 2800,
    y: 560,
    w: 400,
    h: 240,
    type: 'ad',
    brand: 'TVS Motor',
    tagline: 'Inspiring Confidence',
    color: '#00529B',
    textColor: '#fff',
    emoji: '🏍️',
    views: '38K',
    clicks: '2.9K',
    category: 'Automotive',
    adTitle: 'TVS Apache — conquer every road',
    location: 'Chennai, TN',
    phone: '+91 4422334455',
    website: 'tvsmotor.com',
  },

  // Row D (y=800)
  { id: 52, x: 0, y: 880, w: 320, h: 160, type: 'available', price: 1999, size: 'large' },
  {
    id: 53,
    x: 320,
    y: 800,
    w: 400,
    h: 160,
    type: 'ad',
    brand: 'Puma India',
    tagline: 'Forever Faster',
    color: '#E4002B',
    textColor: '#fff',
    emoji: '👟',
    views: '55K',
    clicks: '4.4K',
    category: 'Sports & Fashion',
    adTitle: 'Run collection — now at 50% off',
    location: 'Chennai, TN',
    phone: '+91 1800220122',
    website: 'puma.com/in',
  },
  {
    id: 54,
    x: 720,
    y: 720,
    w: 240,
    h: 240,
    type: 'ad',
    brand: 'Airtel',
    tagline: 'The smartphone network',
    color: '#ED1C24',
    textColor: '#fff',
    emoji: '📡',
    views: '79K',
    clicks: '5.3K',
    category: 'Telecom',
    adTitle: 'Airtel 5G — fastest in Chennai',
    location: 'Chennai, TN',
    phone: '121',
    website: 'airtel.in',
  },
  {
    id: 55,
    x: 960,
    y: 800,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Tata Neu',
    tagline: 'Everything lives here',
    color: '#00509D',
    textColor: '#fff',
    emoji: '🌟',
    views: '31K',
    clicks: '2.4K',
    category: 'Super App',
    adTitle: 'Shop, travel & pay — earn NeuCoins',
    location: 'Chennai, TN',
    phone: '+91 1800266644',
    website: 'tata.com/neu',
  },
  { id: 56, x: 1200, y: 800, w: 240, h: 160, type: 'available', price: 799, size: 'medium' },
  {
    id: 57,
    x: 1440,
    y: 800,
    w: 320,
    h: 240,
    type: 'ad',
    brand: 'Hyundai India',
    tagline: 'New Thinking. New Possibilities.',
    color: '#002C5F',
    textColor: '#fff',
    emoji: '🚘',
    views: '62K',
    clicks: '4.7K',
    category: 'Automotive',
    adTitle: 'Creta N-Line — feel the thrill',
    location: 'Chennai, TN',
    phone: '+91 1800114645',
    website: 'hyundai.com/in',
  },
  {
    id: 58,
    x: 1760,
    y: 800,
    w: 480,
    h: 240,
    type: 'ad',
    brand: 'Reliance Digital',
    tagline: 'Explore infinite possibilities',
    color: '#4A1942',
    textColor: '#fff',
    emoji: '📺',
    views: '92K',
    clicks: '7.1K',
    category: 'Electronics',
    adTitle: 'Samsung QLED TV from ₹49,999',
    location: 'Chennai, TN',
    phone: '+91 18008999555',
    website: 'reliancedigital.in',
  },
  {
    id: 59,
    x: 2240,
    y: 800,
    w: 320,
    h: 160,
    type: 'ad',
    brand: 'Big Bazaar',
    tagline: 'Isse Sasta Aur Accha Kahin Nahin',
    color: '#E7352B',
    textColor: '#fff',
    emoji: '🛒',
    views: '45K',
    clicks: '3.5K',
    category: 'Retail',
    adTitle: 'Grocery sale — savings up to ₹500',
    location: 'Chennai, TN',
    phone: '+91 18002661111',
    website: 'bigbazaar.com',
  },
  {
    id: 60,
    x: 2560,
    y: 800,
    w: 240,
    h: 240,
    type: 'ad',
    brand: "McDonald\'s India",
    tagline: "I\'m Lovin\' It",
    color: '#FFC72C',
    textColor: '#27251F',
    emoji: '🍔',
    views: '77K',
    clicks: '6.2K',
    category: 'Food & Dining',
    adTitle: 'McSpicy McValue — ₹99 meals daily',
    location: 'Chennai, TN',
    phone: '+91 1860102205',
    website: 'mcdonaldsindia.com',
  },
  { id: 61, x: 2800, y: 800, w: 400, h: 160, type: 'available', price: 2499, size: 'premium' },

  // Row E — Real Estate (y=1040)
  {
    id: 62,
    x: 0,
    y: 1040,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'MagicBricks',
    tagline: 'Real estate made magical',
    color: '#E84142',
    textColor: '#fff',
    emoji: '🏠',
    views: '38K',
    clicks: '2.8K',
    category: 'Real Estate',
    adTitle: '2BHK flats from ₹45L in Chennai',
    location: 'Chennai, TN',
    phone: '+91 9999948888',
    website: 'magicbricks.com',
  },
  {
    id: 63,
    x: 240,
    y: 1040,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'NoBroker',
    tagline: 'Zero brokerage. Full service.',
    color: '#FF6600',
    textColor: '#fff',
    emoji: '🔑',
    views: '29K',
    clicks: '2.1K',
    category: 'Real Estate',
    adTitle: 'Rent without paying brokerage',
    location: 'Chennai, TN',
    phone: '+91 9999907777',
    website: 'nobroker.in',
  },
  {
    id: 64,
    x: 480,
    y: 1040,
    w: 160,
    h: 320,
    type: 'ad',
    brand: '99acres',
    tagline: "India's No. 1 property site",
    color: '#C0392B',
    textColor: '#fff',
    emoji: '🏢',
    views: '44K',
    clicks: '3.2K',
    category: 'Real Estate',
    adTitle: 'New projects in North Chennai — ₹35L+',
    location: 'Chennai, TN',
    phone: '+91 9955555595',
    website: '99acres.com',
  },
  {
    id: 65,
    x: 640,
    y: 1040,
    w: 320,
    h: 240,
    type: 'ad',
    brand: 'DLF Homes',
    tagline: "Building India's finest living",
    color: '#1B3A6B',
    textColor: '#fff',
    emoji: '🏛️',
    views: '52K',
    clicks: '3.8K',
    category: 'Real Estate',
    adTitle: 'DLF luxury villas — Limited units in Chennai',
    location: 'Chennai, TN',
    phone: '+91 1800200100',
    website: 'dlf.in',
  },
  { id: 66, x: 0, y: 1200, w: 240, h: 160, type: 'available', price: 799, size: 'medium' },
  { id: 67, x: 240, y: 1200, w: 240, h: 80, type: 'available', price: 499, size: 'small' },
  { id: 68, x: 640, y: 1280, w: 160, h: 80, type: 'available', price: 299, size: 'small' },
  { id: 69, x: 800, y: 1280, w: 160, h: 80, type: 'available', price: 299, size: 'small' },

  // Row E — Jobs (y=1040, continuing right)
  {
    id: 70,
    x: 960,
    y: 1040,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Naukri.com',
    tagline: 'Find the right job for you',
    color: '#2D6CDF',
    textColor: '#fff',
    emoji: '💼',
    views: '52K',
    clicks: '4.8K',
    category: 'Jobs',
    adTitle: '1,200+ IT jobs in Chennai this week',
    location: 'Chennai, TN',
    phone: '+91 9999904444',
    website: 'naukri.com',
  },
  {
    id: 71,
    x: 1200,
    y: 1040,
    w: 320,
    h: 160,
    type: 'ad',
    brand: 'LinkedIn Jobs',
    tagline: 'Find jobs you will love',
    color: '#0A66C2',
    textColor: '#fff',
    emoji: '👔',
    views: '67K',
    clicks: '5.4K',
    category: 'Jobs',
    adTitle: '500+ remote jobs added today in Chennai',
    location: 'Chennai, TN',
    phone: '',
    website: 'linkedin.com/jobs',
  },
  {
    id: 72,
    x: 1520,
    y: 1040,
    w: 160,
    h: 160,
    type: 'ad',
    brand: 'Internshala',
    tagline: 'Internships & training',
    color: '#0F8C8C',
    textColor: '#fff',
    emoji: '🎓',
    views: '21K',
    clicks: '1.9K',
    category: 'Jobs',
    adTitle: 'Find internships near you',
    location: 'Chennai, TN',
    phone: '+91 9999933333',
    website: 'internshala.com',
  },
  {
    id: 73,
    x: 960,
    y: 1200,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Shine.com',
    tagline: 'Your career, amplified',
    color: '#FF5722',
    textColor: '#fff',
    emoji: '⭐',
    views: '18K',
    clicks: '1.6K',
    category: 'Jobs',
    adTitle: 'Top MNC hiring in Chennai now',
    location: 'Chennai, TN',
    phone: '+91 9999911223',
    website: 'shine.com',
  },
  { id: 74, x: 1200, y: 1200, w: 320, h: 80, type: 'available', price: 999, size: 'medium' },
  { id: 75, x: 1520, y: 1200, w: 160, h: 80, type: 'available', price: 499, size: 'small' },

  // Row E — Wanted & Classifieds
  {
    id: 76,
    x: 1680,
    y: 1040,
    w: 160,
    h: 160,
    type: 'ad',
    brand: 'OLX India',
    tagline: 'Buy. Sell. Repeat.',
    color: '#3A77B9',
    textColor: '#fff',
    emoji: '📢',
    views: '41K',
    clicks: '3.6K',
    category: 'Wanted',
    adTitle: 'Sell your old electronics fast',
    location: 'Chennai, TN',
    phone: '+91 9999911111',
    website: 'olx.in',
  },
  {
    id: 77,
    x: 1840,
    y: 1040,
    w: 160,
    h: 160,
    type: 'ad',
    brand: 'Quikr',
    tagline: 'Ab har kaam aasaan',
    color: '#E94E35',
    textColor: '#fff',
    emoji: '🛒',
    views: '28K',
    clicks: '2.2K',
    category: 'Wanted',
    adTitle: 'Buy & sell used goods near you',
    location: 'Chennai, TN',
    phone: '+91 9999922222',
    website: 'quikr.com',
  },
  {
    id: 78,
    x: 1680,
    y: 1200,
    w: 320,
    h: 160,
    type: 'ad',
    brand: 'Cars24',
    tagline: 'Sell your car in 60 minutes',
    color: '#E31E24',
    textColor: '#fff',
    emoji: '🚗',
    views: '33K',
    clicks: '2.9K',
    category: 'Wanted',
    adTitle: 'Get best price for your used car today',
    location: 'Chennai, TN',
    phone: '+91 9999900099',
    website: 'cars24.com',
  },
  { id: 79, x: 2000, y: 1040, w: 80, h: 80, type: 'available', price: 299, size: 'small' },
  { id: 80, x: 2000, y: 1120, w: 80, h: 80, type: 'available', price: 299, size: 'small' },
  { id: 81, x: 2000, y: 1200, w: 80, h: 160, type: 'available', price: 499, size: 'small' },

  // Row E — Spa & Beauty
  {
    id: 82,
    x: 2080,
    y: 1040,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Lakmé Salon',
    tagline: 'Beauty is our business',
    color: '#C8185A',
    textColor: '#fff',
    emoji: '💅',
    views: '19K',
    clicks: '1.6K',
    category: 'Spa & Beauty',
    adTitle: 'Bridal packages from ₹4,999 — Book now',
    location: 'Chennai, TN',
    phone: '+91 9999955555',
    website: 'lakmesalon.in',
  },
  {
    id: 83,
    x: 2320,
    y: 1040,
    w: 160,
    h: 320,
    type: 'ad',
    brand: 'VLCC',
    tagline: 'Look good. Feel great.',
    color: '#7B2869',
    textColor: '#fff',
    emoji: '🌸',
    views: '15K',
    clicks: '1.2K',
    category: 'Spa & Beauty',
    adTitle: 'Weight loss & skin glow programmes',
    location: 'Chennai, TN',
    phone: '+91 9999966666',
    website: 'vlcc.com',
  },
  {
    id: 84,
    x: 2480,
    y: 1040,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'MyGlamm',
    tagline: 'Glam up, always',
    color: '#E91E8C',
    textColor: '#fff',
    emoji: '✨',
    views: '22K',
    clicks: '1.8K',
    category: 'Spa & Beauty',
    adTitle: 'Buy 2 get 1 free on all makeup',
    location: 'Chennai, TN',
    phone: '+91 9999977777',
    website: 'myglamm.com',
  },
  {
    id: 85,
    x: 2720,
    y: 1040,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Naturals Salon',
    tagline: "India's largest salon chain",
    color: '#6D3B8E',
    textColor: '#fff',
    emoji: '💆',
    views: '12K',
    clicks: '0.9K',
    category: 'Spa & Beauty',
    adTitle: 'Hair spa, facials & more at 40% off',
    location: 'Chennai, TN',
    phone: '+91 9999944444',
    website: 'naturals.in',
  },
  {
    id: 86,
    x: 2960,
    y: 1040,
    w: 240,
    h: 160,
    type: 'ad',
    brand: 'Purplle',
    tagline: 'Beauty, affordable & online',
    color: '#9C27B0',
    textColor: '#fff',
    emoji: '💄',
    views: '17K',
    clicks: '1.4K',
    category: 'Spa & Beauty',
    adTitle: 'Luxury skincare up to 60% off',
    location: 'Chennai, TN',
    phone: '+91 9999933334',
    website: 'purplle.com',
  },
  { id: 87, x: 2080, y: 1200, w: 240, h: 80, type: 'available', price: 599, size: 'medium' },
  { id: 88, x: 2480, y: 1200, w: 240, h: 80, type: 'available', price: 599, size: 'medium' },
  { id: 89, x: 2720, y: 1200, w: 240, h: 80, type: 'available', price: 599, size: 'medium' },
  { id: 90, x: 2960, y: 1200, w: 240, h: 80, type: 'available', price: 599, size: 'medium' },
]

const INDIA_CITIES: CityCard[] = [
  { name: 'Chennai', ads: 1245, available: 38, occupancy: 62, icon: '🏛️' },
  { name: 'Bangalore', ads: 2180, available: 24, occupancy: 76, icon: '🌿' },
  { name: 'Mumbai', ads: 3420, available: 18, occupancy: 82, icon: '🌊' },
  { name: 'Delhi', ads: 2890, available: 21, occupancy: 79, icon: '🏛' },
  { name: 'Hyderabad', ads: 1560, available: 41, occupancy: 59, icon: '💎' },
  { name: 'Pune', ads: 980, available: 52, occupancy: 48, icon: '🎓' },
  { name: 'Kolkata', ads: 1120, available: 44, occupancy: 56, icon: '🌸' },
  { name: 'Ahmedabad', ads: 760, available: 61, occupancy: 39, icon: '🏺' },
]

// ─── Filter System ────────────────────────────────────────────────────────────

const FILTER_CATEGORIES = [
  { id: 'All', label: 'All Ads', emoji: '🌐' },
  { id: 'Food & Dining', label: 'Food & Dining', emoji: '🍕' },
  { id: 'Electronics', label: 'Electronics', emoji: '📱' },
  { id: 'Real Estate', label: 'Real Estate', emoji: '🏠' },
  { id: 'Fashion', label: 'Fashion', emoji: '👗' },
  { id: 'Jobs', label: 'Jobs', emoji: '💼' },
  { id: 'Wanted', label: 'Wanted', emoji: '📢' },
  { id: 'Spa & Beauty', label: 'Spa & Beauty', emoji: '💅' },
  { id: 'Fintech', label: 'Fintech', emoji: '💳' },
  { id: 'Travel', label: 'Travel', emoji: '✈️' },
  { id: 'Automotive', label: 'Automotive', emoji: '🚗' },
  { id: 'Healthcare', label: 'Healthcare', emoji: '💊' },
  { id: 'Entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'E-Commerce', label: 'E-Commerce', emoji: '🛍️' },
]

function normalizeCategory(cat?: string): string {
  if (!cat) return 'Other'
  const c = cat.toLowerCase()
  if (
    c.includes('food') ||
    c.includes('dining') ||
    c.includes('quick commerce') ||
    c.includes('restaurant')
  )
    return 'Food & Dining'
  if (c.includes('real estate') || c.includes('property')) return 'Real Estate'
  if (c.includes('job') || c.includes('career') || c.includes('intern')) return 'Jobs'
  if (c.includes('wanted') || c.includes('classifi') || c.includes('buy & sell')) return 'Wanted'
  if (
    c.includes('spa') ||
    c.includes('beauty') ||
    c.includes('salon') ||
    c.includes('wellness') ||
    c.includes('glamm')
  )
    return 'Spa & Beauty'
  if (c.includes('electronics') || c.includes('gadget')) return 'Electronics'
  if (
    c.includes('fashion') ||
    c.includes('jewellery') ||
    c.includes('eyewear') ||
    c.includes('sports & fashion')
  )
    return 'Fashion'
  if (
    c.includes('fintech') ||
    c.includes('banking') ||
    c.includes('finance') ||
    c.includes('payment')
  )
    return 'Fintech'
  if (c.includes('travel')) return 'Travel'
  if (c.includes('automotive') || c.includes('transport')) return 'Automotive'
  if (
    c.includes('health') ||
    c.includes('fitness') ||
    c.includes('pharma') ||
    c.includes('medical')
  )
    return 'Healthcare'
  if (c.includes('entertainment') || c.includes('gaming') || c.includes('sport'))
    return 'Entertainment'
  if (
    c.includes('e-commerce') ||
    c.includes('retail') ||
    c.includes('social commerce') ||
    c.includes('super app')
  )
    return 'E-Commerce'
  return 'Other'
}

// ─── Shared UI Helpers ────────────────────────────────────────────────────────

function PwLogo({ size = 'md', dark = false }: { size?: 'sm' | 'md' | 'lg'; dark?: boolean }) {
  const sizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' }
  return (
    <span className={`font-['Outfit'] font-black tracking-tight ${sizes[size]}`}>
      <span className={dark ? 'text-white' : 'text-[#6C5FE6]'}>Pixel</span>
      <span className={dark ? 'text-white/70' : 'text-foreground'}>World</span>
    </span>
  )
}

function PrimaryBtn({
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

function GhostBtn({
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

function Badge({
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

function StatCard({
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

// ─── World Map SVG ─────────────────────────────────────────────────────────────

function WorldMap({ onCountryClick }: { onCountryClick: (country: string) => void }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const countries = [
    { id: 'usa', name: 'USA', cx: 160, cy: 195, r: 24, ads: '18,340', color: '#6C5FE6' },
    { id: 'brazil', name: 'Brazil', cx: 240, cy: 355, r: 18, ads: '6,120', color: '#00A882' },
    { id: 'uk', name: 'UK', cx: 462, cy: 120, r: 12, ads: '9,200', color: '#00A882' },
    { id: 'germany', name: 'Germany', cx: 494, cy: 130, r: 11, ads: '7,450', color: '#00A882' },
    { id: 'uae', name: 'UAE', cx: 620, cy: 225, r: 14, ads: '4,230', color: '#F59E0B' },
    { id: 'india', name: 'India', cx: 690, cy: 280, r: 22, ads: '12,450', color: '#6C5FE6' },
    { id: 'china', name: 'China', cx: 775, cy: 195, r: 20, ads: '10,890', color: '#EC4899' },
    { id: 'japan', name: 'Japan', cx: 860, cy: 195, r: 13, ads: '5,670', color: '#00A882' },
    { id: 'australia', name: 'Australia', cx: 840, cy: 390, r: 16, ads: '3,980', color: '#00A882' },
    { id: 'nigeria', name: 'Nigeria', cx: 480, cy: 295, r: 13, ads: '2,140', color: '#00A882' },
    { id: 'saudi', name: 'Saudi Arabia', cx: 600, cy: 240, r: 13, ads: '3,560', color: '#F59E0B' },
    { id: 'canada', name: 'Canada', cx: 160, cy: 130, r: 14, ads: '4,820', color: '#00A882' },
    { id: 'mexico', name: 'Mexico', cx: 150, cy: 240, r: 12, ads: '2,680', color: '#00A882' },
    { id: 'argentina', name: 'Argentina', cx: 220, cy: 420, r: 12, ads: '1,940', color: '#00A882' },
    {
      id: 'southafrica',
      name: 'South Africa',
      cx: 520,
      cy: 420,
      r: 12,
      ads: '1,780',
      color: '#00A882',
    },
    { id: 'singapore', name: 'Singapore', cx: 790, cy: 310, r: 10, ads: '2,210', color: '#00A882' },
    { id: 'indonesia', name: 'Indonesia', cx: 820, cy: 330, r: 14, ads: '3,450', color: '#EC4899' },
    { id: 'kenya', name: 'Kenya', cx: 560, cy: 320, r: 10, ads: '1,120', color: '#00A882' },
    { id: 'france', name: 'France', cx: 474, cy: 145, r: 12, ads: '5,890', color: '#00A882' },
  ]

  return (
    <div className="relative w-full aspect-[2/1] max-w-5xl mx-auto">
      <svg viewBox="0 0 1000 500" className="w-full h-full">
        <defs>
          <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#D6E8FF" />
            <stop offset="100%" stopColor="#EAF2FF" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softglow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ocean */}
        <rect width="1000" height="500" fill="url(#oceanGrad)" rx="16" />

        {/* Grid lines */}
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 50}
            x2="1000"
            y2={i * 50}
            stroke="rgba(60,100,220,0.08)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 50}
            y1="0"
            x2={i * 50}
            y2="500"
            stroke="rgba(60,100,220,0.08)"
            strokeWidth="1"
          />
        ))}

        {/* Continents — simplified outlines */}
        {/* North America */}
        <path
          d="M 70 65 L 240 60 L 280 90 L 275 140 L 250 200 L 240 270 L 210 320 L 185 350 L 155 365 L 135 330 L 110 290 L 75 250 L 60 200 L 65 140 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* South America */}
        <path
          d="M 185 290 L 255 275 L 295 300 L 305 370 L 290 440 L 255 475 L 210 470 L 180 440 L 170 380 L 175 320 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Europe */}
        <path
          d="M 435 55 L 530 50 L 560 80 L 555 115 L 535 145 L 500 160 L 455 155 L 430 125 L 425 90 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Africa */}
        <path
          d="M 435 175 L 580 170 L 605 220 L 600 300 L 575 390 L 530 445 L 470 445 L 425 395 L 415 290 L 425 210 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Middle East */}
        <path
          d="M 560 150 L 645 135 L 680 175 L 668 225 L 630 240 L 580 225 L 558 195 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Asia (main body) */}
        <path
          d="M 600 60 L 900 55 L 940 100 L 935 200 L 895 270 L 830 300 L 770 300 L 725 260 L 665 240 L 640 195 L 605 175 L 580 130 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Indian subcontinent */}
        <path
          d="M 645 195 L 730 195 L 760 235 L 755 320 L 710 368 L 668 348 L 640 295 Z"
          fill="rgba(60,100,220,0.14)"
          stroke="rgba(60,100,220,0.22)"
          strokeWidth="0.8"
        />
        {/* SE Asia */}
        <path
          d="M 770 265 L 870 255 L 910 295 L 895 340 L 845 360 L 790 325 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />
        {/* Australia */}
        <path
          d="M 790 340 L 935 330 L 960 380 L 950 440 L 880 465 L 800 445 L 775 400 Z"
          fill="rgba(60,100,220,0.10)"
          stroke="rgba(60,100,220,0.20)"
          strokeWidth="0.8"
        />

        {/* Country active indicators */}
        {countries.map((c) => {
          const isHovered = hovered === c.id
          const isClickable = c.id === 'india'
          return (
            <g
              key={c.id}
              onClick={() => isClickable && onCountryClick(c.name)}
              onMouseEnter={() => setHovered(c.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: isClickable ? 'pointer' : 'default' }}
            >
              {/* Pulse rings */}
              <circle
                cx={c.cx}
                cy={c.cy}
                r={c.r * 1.8}
                fill="none"
                stroke={c.color}
                strokeWidth="1"
                opacity="0.2"
              >
                <animate
                  attributeName="r"
                  values={`${c.r * 1.4};${c.r * 2.8};${c.r * 1.4}`}
                  dur="3s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0;0.4"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={c.cx}
                cy={c.cy}
                r={c.r * 1.2}
                fill="none"
                stroke={c.color}
                strokeWidth="1.5"
                opacity="0.3"
              >
                <animate
                  attributeName="r"
                  values={`${c.r};${c.r * 2.2};${c.r}`}
                  dur="3s"
                  begin="0.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  dur="3s"
                  begin="0.5s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Main dot */}
              <circle
                cx={c.cx}
                cy={c.cy}
                r={isHovered ? c.r * 1.15 : c.r}
                fill={c.color}
                opacity={isHovered ? 0.95 : 0.75}
                filter="url(#glow)"
                style={{ transition: 'r 0.2s, opacity 0.2s' }}
              />

              {/* Label on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={c.cx - 55}
                    y={c.cy - c.r - 38}
                    width="110"
                    height="28"
                    rx="6"
                    fill="rgba(255,255,255,0.96)"
                    stroke="rgba(0,0,0,0.10)"
                    strokeWidth="0.8"
                  />
                  <text
                    x={c.cx}
                    y={c.cy - c.r - 28}
                    textAnchor="middle"
                    fill="#0F1117"
                    fontSize="8"
                    fontFamily="Outfit"
                    fontWeight="600"
                  >
                    {c.name}
                  </text>
                  <text
                    x={c.cx}
                    y={c.cy - c.r - 17}
                    textAnchor="middle"
                    fill={c.color}
                    fontSize="7"
                    fontFamily="JetBrains Mono"
                  >
                    {c.ads} active ads
                  </text>
                  {isClickable && (
                    <text
                      x={c.cx}
                      y={c.cy + c.r + 12}
                      textAnchor="middle"
                      fill="#6C5FE6"
                      fontSize="7"
                      fontFamily="Outfit"
                      fontWeight="600"
                    >
                      ↗ Explore
                    </text>
                  )}
                </g>
              )}
            </g>
          )
        })}

        {/* Connection lines between major hubs */}
        {[
          [160, 195, 462, 120],
          [160, 195, 690, 280],
          [690, 280, 775, 195],
          [462, 120, 690, 280],
          [620, 225, 690, 280],
          [160, 195, 240, 355],
        ].map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="rgba(108,95,230,0.22)"
            strokeWidth="0.8"
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-4 flex items-center gap-4">
        {[
          { color: '#6C5FE6', label: 'High Activity' },
          { color: '#00A882', label: 'Active' },
          { color: '#F59E0B', label: 'Growing' },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
            <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Click hint for India */}
      <div className="absolute bottom-3 right-4">
        <span className="text-xs text-[#6C5FE6] font-['Outfit'] font-medium animate-pulse">
          Click India to explore →
        </span>
      </div>
    </div>
  )
}

// ─── Screen 1: Landing ────────────────────────────────────────────────────────

function LandingScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .gradient-text {
          background: linear-gradient(135deg, #6C5FE6 0%, #00A882 50%, #EC4899 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[rgba(245,247,252,0.85)] backdrop-blur-xl border-b border-black/5">
        <PwLogo />
        <nav className="hidden md:flex items-center gap-7">
          {['Explore', 'How It Works', 'For Advertisers', 'Pricing'].map((n) => (
            <button
              key={n}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-['Outfit'] font-medium"
            >
              {n}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <Search size={18} />
          </button>
          <GhostBtn small onClick={() => onNavigate('login')}>
            Login
          </GhostBtn>
          <PrimaryBtn small onClick={() => onNavigate('create-ad')}>
            Post Your Ad
          </PrimaryBtn>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-8 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#6C5FE6]/12 blur-[120px]" />
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full bg-[#00A882]/10 blur-[100px]" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-[#EC4899]/8 blur-[100px]" />
        </div>

        {/* Badge */}
        <div className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-[#6C5FE6]/30 bg-[#6C5FE6]/10">
          <Sparkles size={14} className="text-[#6C5FE6]" />
          <span className="text-xs font-['Outfit'] font-semibold text-[#6C5FE6]">
            120+ cities · 580K+ active ads · Real-time canvas
          </span>
        </div>

        <h1 className="text-center font-['Outfit'] font-black text-6xl md:text-7xl lg:text-8xl leading-none tracking-tight max-w-4xl mb-6">
          <span className="text-foreground">Own Your Space.</span>
          <br />
          <span className="gradient-text">Get Discovered.</span>
        </h1>

        <p className="text-center text-lg text-muted-foreground max-w-xl mb-10 font-['Inter'] leading-relaxed">
          Rent interactive digital advertising space and put your brand on the world&#39;s visual
          canvas. Location-based. Interactive. Unforgettable.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <PrimaryBtn onClick={() => onNavigate('country')} className="text-base px-8 py-4">
            <Globe size={18} />
            Explore the World
          </PrimaryBtn>
          <GhostBtn onClick={() => onNavigate('create-ad')} className="text-base px-8 py-4">
            <Megaphone size={18} />
            Post Your Ad
          </GhostBtn>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-8 mt-12 py-5 px-8 rounded-2xl bg-card border border-black/6 flex-wrap justify-center">
          {[
            { v: '580K+', l: 'Active Ads Globally' },
            { v: '120+', l: 'Cities Worldwide' },
            { v: '48M+', l: 'Monthly Impressions' },
            { v: '99.9%', l: 'Canvas Uptime' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl font-['Outfit'] font-black text-[#6C5FE6]">{s.v}</div>
              <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* World Map section */}
      <section className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-['Outfit'] font-bold text-4xl text-foreground mb-3">
            Live Activity Across the World
          </h2>
          <p className="text-muted-foreground font-['Inter']">
            Click any country to explore its advertising canvas
          </p>
        </div>

        <div className="rounded-3xl border border-black/6 bg-card p-6 shadow-2xl">
          <WorldMap onCountryClick={() => onNavigate('country')} />
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { country: '🇮🇳 India', ads: '12,450', trend: '+18% this week', color: '#6C5FE6' },
            { country: '🇺🇸 USA', ads: '18,340', trend: '+12% this week', color: '#EC4899' },
            { country: '🇦🇪 UAE', ads: '4,230', trend: '+24% this week', color: '#F59E0B' },
            { country: '🇬🇧 UK', ads: '9,200', trend: '+9% this week', color: '#00A882' },
          ].map((c) => (
            <div
              key={c.country}
              className="rounded-2xl border border-black/6 bg-card p-5 hover:border-black/10 transition-all cursor-pointer group"
              onClick={() => onNavigate('country')}
            >
              <div className="text-xl mb-2 font-['Outfit'] font-bold">{c.country}</div>
              <div className="text-2xl font-['Outfit'] font-black mb-1" style={{ color: c.color }}>
                {c.ads}
              </div>
              <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                Active Ads
              </div>
              <div className="text-xs text-[#00A882] mt-2 font-['Outfit'] font-semibold">
                {c.trend}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section className="px-6 py-16 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: MapPin,
              title: 'Location-Based Precision',
              desc: 'Target audiences exactly where they are. Place ads in specific cities, neighborhoods, and canvases that matter to your business.',
              color: '#6C5FE6',
            },
            {
              icon: Zap,
              title: 'Interactive Ads',
              desc: 'Not just images — your ads can have call buttons, WhatsApp links, website redirects, maps, and more built right in.',
              color: '#00A882',
            },
            {
              icon: TrendingUp,
              title: 'Real-Time Analytics',
              desc: 'Track views, interactions, CTA clicks, and engagement rate with a live dashboard updated every minute.',
              color: '#EC4899',
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-black/6 bg-card p-8 hover:border-black/8 transition-all group"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                style={{ background: `${f.color}18` }}
              >
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 className="font-['Outfit'] font-bold text-xl text-foreground mb-3">{f.title}</h3>
              <p className="text-muted-foreground font-['Inter'] leading-relaxed text-sm">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <div className="rounded-3xl bg-gradient-to-r from-[#6C5FE6]/10 via-[#8B7FFA]/8 to-[#00A882]/10 border border-[#6C5FE6]/15 p-12 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at 30% 50%, #6C5FE6 0%, transparent 50%), radial-gradient(circle at 70% 50%, #00A882 0%, transparent 50%)',
            }}
          />
          <div className="relative">
            <h2 className="font-['Outfit'] font-black text-4xl text-foreground mb-4">
              Ready to stake your claim?
            </h2>
            <p className="text-muted-foreground mb-8 font-['Inter']">
              Join 42,000+ advertisers who have made PixelWorld their digital home.
            </p>
            <PrimaryBtn
              onClick={() => onNavigate('canvas')}
              className="text-base px-10 py-4 mx-auto"
            >
              Start for Free <ArrowRight size={18} />
            </PrimaryBtn>
          </div>
        </div>
      </section>
    </div>
  )
}

// ─── Screen 2: Country (India) ─────────────────────────────────────────────────

function CountryScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <PwLogo />
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground font-['Outfit']">
          <button className="hover:text-foreground transition-colors">World</button>
          <ChevronRight size={14} />
          <span className="text-foreground font-semibold">India</span>
        </nav>
        <div className="flex items-center gap-3">
          <PrimaryBtn small onClick={() => onNavigate('canvas')}>
            Post Your Ad
          </PrimaryBtn>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 text-sm font-['Outfit']"
            >
              <ArrowLeft size={16} /> Back to World Map
            </button>
            <div className="flex items-center gap-4">
              <div className="text-5xl">🇮🇳</div>
              <div>
                <h1 className="font-['Outfit'] font-black text-5xl text-foreground leading-tight">
                  India
                </h1>
                <p className="text-muted-foreground font-['Inter'] mt-1">
                  Choose a city to explore its advertising canvas
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                placeholder="Search city, business or ad..."
                className="bg-card border border-black/8 rounded-xl pl-9 pr-4 py-2.5 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50 w-72"
              />
            </div>
          </div>
        </div>

        {/* Country stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Active Ads"
            value="12,450"
            sub="↑ 18% this week"
            icon={Megaphone}
            accent
          />
          <StatCard label="Available Spaces" value="4,820" icon={Grid3X3} />
          <StatCard label="Total Advertisers" value="8,234" icon={Users} />
          <StatCard
            label="Avg. Daily Impressions"
            value="2.4M"
            sub="across all canvases"
            icon={Eye}
          />
        </div>

        {/* City grid */}
        <h2 className="font-['Outfit'] font-bold text-2xl text-foreground mb-6">Top Cities</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {INDIA_CITIES.map((city) => (
            <div
              key={city.name}
              className="rounded-2xl border border-black/6 bg-card hover:border-[#6C5FE6]/30 hover:bg-[#6C5FE6]/5 transition-all cursor-pointer group p-6"
              onClick={() => onNavigate('canvas')}
            >
              <div className="text-3xl mb-4">{city.icon}</div>
              <h3 className="font-['Outfit'] font-bold text-xl text-foreground mb-4">
                {city.name}
              </h3>
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                    Active Ads
                  </span>
                  <span className="text-sm font-['Outfit'] font-bold text-[#6C5FE6]">
                    {city.ads.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                    Space Available
                  </span>
                  <span className="text-sm font-['Outfit'] font-bold text-[#00A882]">
                    {city.available}%
                  </span>
                </div>
              </div>
              {/* Occupancy bar */}
              <div className="w-full h-1.5 rounded-full bg-black/5 overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6C5FE6] to-[#00A882]"
                  style={{ width: `${city.occupancy}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{city.occupancy}% occupied</span>
                <button className="flex items-center gap-1 text-xs text-[#6C5FE6] font-['Outfit'] font-semibold group-hover:gap-2 transition-all">
                  Explore <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Premium banner */}
        <div className="mt-10 rounded-2xl border border-[#F59E0B]/20 bg-[#F59E0B]/5 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center">
              <Star size={18} className="text-[#F59E0B]" />
            </div>
            <div>
              <div className="font-['Outfit'] font-bold text-foreground">
                Premium Canvas Spaces Available in Mumbai & Delhi
              </div>
              <div className="text-sm text-muted-foreground">
                High-traffic zones with 2.8M+ monthly impressions
              </div>
            </div>
          </div>
          <PrimaryBtn small>View Premium Spaces</PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 3: City Canvas ────────────────────────────────────────────────────

function CanvasScreen({
  onNavigate,
  campaigns,
  onCampaignSaved,
}: {
  onNavigate: (s: Screen) => void
  campaigns: StoredCampaign[]
  onCampaignSaved: (campaign: StoredCampaign) => void
}) {
  const [zoom, setZoom] = useState(0.7)
  const [pan, setPan] = useState({ x: -120, y: -80 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [hoveredTile, setHoveredTile] = useState<CanvasTile | null>(null)
  const [selectedAd, setSelectedAd] = useState<CanvasTile | null>(null)
  const [selectedSpace, setSelectedSpace] = useState<CanvasTile | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [activeFilter, setActiveFilter] = useState('All')
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const persistedCampaign = campaigns[0] ?? null

  const adTilesByCategory = React.useMemo(() => {
    const counts: Record<string, number> = { All: 0 }
    TILES.forEach((t) => {
      if (t.type !== 'ad') return
      counts.All = (counts.All ?? 0) + 1
      const norm = normalizeCategory(t.category)
      counts[norm] = (counts[norm] ?? 0) + 1
    })
    return counts
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.tile-btn')) return
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
      setPanStart({ ...pan })
    },
    [pan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      setPan({
        x: panStart.x + (e.clientX - dragStart.x),
        y: panStart.y + (e.clientY - dragStart.y),
      })
    },
    [isDragging, dragStart, panStart],
  )

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.08 : 0.08
    setZoom((z) => Math.max(0.25, Math.min(2.5, z + delta)))
  }, [])

  const resetView = () => {
    setZoom(0.7)
    setPan({ x: -120, y: -80 })
  }

  const miniScale = 160 / CANVAS_W
  const container = containerRef.current?.getBoundingClientRect()
  const vpW = (container?.width ?? 1200) / zoom
  const vpH = (container?.height ?? 700) / zoom
  const vpX = -pan.x / zoom
  const vpY = -pan.y / zoom

  if (showCreate)
    return (
      <CreateAdScreen
        onBack={() => setShowCreate(false)}
        onNavigate={onNavigate}
        onCampaignSaved={onCampaignSaved}
      />
    )

  return (
    <div className="h-screen bg-[#ECF0FA] flex flex-col overflow-hidden">
      <style>{`
        .canvas-grid { background-image: linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px); background-size: 80px 80px; }
        .tile-hover { transition: filter 0.15s, transform 0.15s, opacity 0.2s; }
        .tile-hover:hover { filter: brightness(1.12); transform: scale(1.02); z-index: 20; }
        .filter-scroll::-webkit-scrollbar { display: none; }
        .filter-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Top bar */}
      <header className="flex items-center gap-4 px-6 py-3 border-b border-black/6 bg-[rgba(245,247,252,0.98)] backdrop-blur-xl z-40 shrink-0 shadow-sm">
        <PwLogo size="sm" />
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-['Outfit']">
          <button onClick={() => onNavigate('landing')} className="hover:text-foreground">
            World
          </button>
          <ChevronRight size={12} />
          <button onClick={() => onNavigate('country')} className="hover:text-foreground">
            India
          </button>
          <ChevronRight size={12} />
          <button className="hover:text-foreground">Tamil Nadu</button>
          <ChevronRight size={12} />
          <span className="text-foreground font-semibold">Chennai</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              placeholder="Search ads or businesses..."
              className="bg-[#EDF0F8] border border-black/8 rounded-lg pl-9 pr-4 py-2 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/40 w-60"
            />
          </div>
          <GhostBtn small onClick={() => onNavigate('dashboard')}>
            My Ads
          </GhostBtn>
          <PrimaryBtn small onClick={() => setShowCreate(true)}>
            + Post Your Ad
          </PrimaryBtn>
          <button className="w-8 h-8 rounded-full bg-[#6C5FE6] flex items-center justify-center text-white text-xs font-bold font-['Outfit']">
            A
          </button>
        </div>
      </header>

      {/* Category filter bar */}
      <div className="shrink-0 bg-white border-b border-black/6 shadow-sm z-30">
        <div className="flex items-center gap-1.5 px-4 py-2.5 overflow-x-auto filter-scroll">
          {FILTER_CATEGORIES.map((cat) => {
            const count = adTilesByCategory[cat.id] ?? 0
            if (cat.id !== 'All' && count === 0) return null
            const isActive = activeFilter === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-['Outfit'] font-semibold transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-[#6C5FE6] text-white shadow-md shadow-[#6C5FE6]/30'
                    : 'bg-[#F0F2F8] text-muted-foreground hover:bg-[#E4E7F5] hover:text-foreground border border-black/5'
                }`}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                <span>{cat.label}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-['JetBrains_Mono'] font-medium ${
                    isActive ? 'bg-white/20 text-white' : 'bg-black/8 text-muted-foreground'
                  }`}
                >
                  {cat.id === 'All' ? adTilesByCategory.All : count}
                </span>
              </button>
            )
          })}
          {activeFilter !== 'All' && (
            <button
              onClick={() => setActiveFilter('All')}
              className="flex items-center gap-1 ml-1 px-3 py-1.5 rounded-full text-xs font-['Outfit'] font-semibold text-muted-foreground hover:text-foreground border border-black/8 hover:border-black/15 transition-all shrink-0"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Active filter summary strip */}
        {activeFilter !== 'All' && (
          <div className="flex items-center gap-3 px-4 pb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-['JetBrains_Mono']">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6C5FE6] inline-block" />
              Showing{' '}
              <strong className="text-foreground">
                {adTilesByCategory[activeFilter] ?? 0} ads
              </strong>{' '}
              in
              <strong className="text-[#6C5FE6]">
                {FILTER_CATEGORIES.find((c) => c.id === activeFilter)?.emoji} {activeFilter}
              </strong>
              — other categories are dimmed
            </div>
          </div>
        )}
      </div>

      {/* Canvas area */}
      <div
        className="relative flex-1 overflow-hidden"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          ref={canvasRef}
          className="absolute canvas-grid"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {TILES.map((tile) => {
            const tileNorm = normalizeCategory(tile.category)
            const isFiltered = activeFilter !== 'All'
            const matchesFilter = tile.type === 'available' || tileNorm === activeFilter
            const dimmed = isFiltered && !matchesFilter
            return (
              <div
                key={tile.id}
                className={`absolute tile-hover rounded-lg overflow-hidden ${tile.type === 'available' ? 'border-2 border-dashed border-black/12 bg-[#F0F2F9]' : 'shadow-lg'}`}
                style={{
                  left: tile.x,
                  top: tile.y,
                  width: tile.w,
                  height: tile.h,
                  background: tile.type === 'ad' ? tile.color : undefined,
                  zIndex: hoveredTile?.id === tile.id ? 10 : matchesFilter ? 2 : 1,
                  opacity: dimmed ? 0.18 : 1,
                  filter: dimmed ? 'saturate(0)' : 'none',
                  transition: 'opacity 0.25s ease, filter 0.25s ease',
                }}
                onMouseEnter={() => setHoveredTile(tile)}
                onMouseLeave={() => setHoveredTile(null)}
                onClick={(e) => {
                  e.stopPropagation()
                  if (tile.type === 'ad') {
                    setSelectedAd(tile)
                    setSelectedSpace(null)
                  } else {
                    setSelectedSpace(tile)
                    setSelectedAd(null)
                  }
                }}
              >
                {tile.type === 'ad' ? (
                  <div
                    className="relative w-full h-full p-3 flex flex-col justify-between"
                    style={{ color: tile.textColor }}
                  >
                    {/* Subtle inner gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20 pointer-events-none" />
                    <div className="relative">
                      <div className="text-xl mb-1">{tile.emoji}</div>
                      <div className="font-['Outfit'] font-black text-xs leading-tight opacity-90">
                        {tile.brand}
                      </div>
                    </div>
                    {tile.w >= 200 && (
                      <div className="relative">
                        <div className="font-['Inter'] text-xs leading-snug opacity-75 line-clamp-2">
                          {tile.tagline}
                        </div>
                      </div>
                    )}
                    {/* Hover overlay */}
                    {hoveredTile?.id === tile.id && (
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                        <div className="font-['Outfit'] font-bold text-white text-sm text-center px-2">
                          {tile.brand}
                        </div>
                        <div className="font-['Inter'] text-white/75 text-xs text-center px-2 line-clamp-2">
                          {tile.adTitle}
                        </div>
                        <button className="tile-btn mt-1 px-3 py-1.5 bg-white text-black text-xs font-['Outfit'] font-bold rounded-lg hover:bg-white/90 transition-colors">
                          View Ad
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 p-2">
                    {hoveredTile?.id === tile.id ? (
                      <>
                        <div className="font-['Outfit'] font-bold text-[#6C5FE6] text-xs text-center">
                          Rent This Space
                        </div>
                        <div className="font-['JetBrains_Mono'] text-muted-foreground text-xs">
                          From ₹{tile.price}
                        </div>
                        <button className="tile-btn mt-1 px-3 py-1 bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-bold rounded-lg hover:bg-[#6B5EE6] transition-colors">
                          Reserve
                        </button>
                      </>
                    ) : (
                      <>
                        <Plus size={14} className="text-black/25" />
                        <div className="font-['JetBrains_Mono'] text-black/25 text-xs">
                          Available
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {persistedCampaign?.creative.url && (
            <button
              className="absolute tile-btn overflow-hidden rounded-lg shadow-xl ring-2 ring-[#6C5FE6] bg-white"
              style={{
                left: 1360,
                top: 1680,
                width: Math.max(160, Math.min(400, persistedCampaign.width)),
                height: Math.max(160, Math.min(400, persistedCampaign.height)),
                zIndex: 5,
              }}
              onClick={(event) => {
                event.stopPropagation()
                onNavigate('dashboard')
              }}
              aria-label={`Open ${persistedCampaign.name}`}
            >
              <CreativeImage campaign={persistedCampaign} sizes="400px" />
              <span className="absolute right-2 top-2 rounded-md bg-[#6C5FE6] px-2 py-1 font-['JetBrains_Mono'] text-[10px] font-bold text-white">
                YOUR DRAFT
              </span>
            </button>
          )}
        </div>

        {/* Canvas controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-30">
          {[
            { icon: Plus, action: () => setZoom((z) => Math.min(2.5, z + 0.15)), tip: 'Zoom In' },
            {
              icon: Minus,
              action: () => setZoom((z) => Math.max(0.25, z - 0.15)),
              tip: 'Zoom Out',
            },
            { icon: RotateCcw, action: resetView, tip: 'Reset View' },
            { icon: Maximize2, action: () => {}, tip: 'Fullscreen' },
          ].map(({ icon: Icon, action, tip }) => (
            <button
              key={tip}
              title={tip}
              onClick={action}
              className="w-9 h-9 rounded-xl bg-card border border-black/8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-black/12 transition-all shadow-lg"
            >
              <Icon size={15} />
            </button>
          ))}
          {/* Zoom indicator */}
          <div className="mt-1 px-2 py-1 rounded-lg bg-card border border-black/8 text-center">
            <span className="text-xs font-['JetBrains_Mono'] text-muted-foreground">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>

        {/* Mini-map */}
        <div className="absolute bottom-4 right-4 z-30 rounded-xl border border-black/8 bg-[#F5F7FC]/90 backdrop-blur-sm p-2 shadow-xl">
          <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground mb-1.5 px-1">
            Mini Map
          </div>
          <div
            className="relative overflow-hidden rounded-lg bg-[#F0F2F9]"
            style={{ width: 160, height: Math.round((160 * CANVAS_H) / CANVAS_W) }}
          >
            {TILES.filter((t) => t.type === 'ad').map((t) => {
              const matched =
                activeFilter === 'All' || normalizeCategory(t.category) === activeFilter
              return (
                <div
                  key={t.id}
                  className="absolute rounded-sm transition-opacity duration-200"
                  style={{
                    left: t.x * miniScale,
                    top: t.y * miniScale,
                    width: Math.max(3, t.w * miniScale),
                    height: Math.max(3, t.h * miniScale),
                    background: matched ? t.color : '#C8CDD8',
                    opacity: matched ? 0.9 : 0.3,
                  }}
                />
              )
            })}
            {/* Viewport rect */}
            <div
              className="absolute border-2 border-[#6C5FE6] rounded-sm pointer-events-none"
              style={{
                left: Math.max(0, vpX * miniScale),
                top: Math.max(0, vpY * miniScale),
                width: Math.min(160, vpW * miniScale),
                height: Math.min(120, vpH * miniScale),
                background: 'rgba(124,111,247,0.1)',
              }}
            />
          </div>
        </div>

        {/* Canvas info bar */}
        <div className="absolute bottom-4 left-4 z-30 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F5F7FC]/90 backdrop-blur-sm border border-black/8">
            <div className="w-2 h-2 rounded-full bg-[#00A882] animate-pulse" />
            <span className="text-xs font-['JetBrains_Mono'] text-foreground">
              Chennai Main Canvas
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#F5F7FC]/90 backdrop-blur-sm border border-black/8">
            {[
              { color: '#6C5FE6', label: 'Active' },
              { color: '#DDE1F0', label: 'Available', border: true },
              { color: '#F59E0B', label: 'Expiring' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{
                    background: l.color,
                    border: l.border ? '1px dashed rgba(0,0,0,0.25)' : 'none',
                  }}
                />
                <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ad detail panel */}
      {selectedAd && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-black/8 z-50 overflow-y-auto shadow-2xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ background: selectedAd.color }}
                >
                  {selectedAd.emoji}
                </div>
                <div>
                  <div className="font-['Outfit'] font-bold text-foreground">
                    {selectedAd.brand}
                  </div>
                  <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                    {selectedAd.category}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAd(null)}
                className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/6 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Ad preview */}
            <div
              className="rounded-2xl overflow-hidden mb-6 aspect-video flex items-center justify-center relative"
              style={{ background: selectedAd.color }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/30" />
              <div className="relative text-center" style={{ color: selectedAd.textColor }}>
                <div className="text-5xl mb-2">{selectedAd.emoji}</div>
                <div className="font-['Outfit'] font-black text-2xl">{selectedAd.brand}</div>
                <div className="font-['Inter'] text-sm opacity-80 mt-1 px-4">
                  {selectedAd.tagline}
                </div>
              </div>
              <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play size={14} className="text-white ml-0.5" />
              </button>
            </div>

            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-2">
              {selectedAd.adTitle}
            </h3>
            <p className="text-sm text-muted-foreground font-['Inter'] mb-4 leading-relaxed">
              {selectedAd.tagline} — Click through to explore our latest offers and deals, only
              available for a limited time.
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
              <MapPin size={12} className="text-[#00A882]" />
              <span className="font-['JetBrains_Mono']">{selectedAd.location}</span>
            </div>

            {/* CTA buttons */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {[
                { icon: ExternalLink, label: 'Visit Website', color: 'bg-[#6C5FE6] text-white' },
                {
                  icon: Phone,
                  label: 'Call Now',
                  color: 'bg-[#00A882]/15 text-[#00A882] border border-[#00A882]/20',
                },
                {
                  icon: MessageCircle,
                  label: 'WhatsApp',
                  color: 'bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20',
                },
                {
                  icon: Navigation,
                  label: 'Directions',
                  color: 'bg-black/5 text-foreground border border-black/8',
                },
                {
                  icon: ShoppingBag,
                  label: 'Shop Now',
                  color: 'bg-black/5 text-foreground border border-black/8',
                },
                {
                  icon: Share2,
                  label: 'Share Ad',
                  color: 'bg-black/5 text-muted-foreground border border-black/8',
                },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-['Outfit'] font-medium transition-all hover:opacity-80 ${color}`}
                >
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-black/6 bg-card p-4 grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-['Outfit'] font-black text-[#6C5FE6]">
                  {selectedAd.views}
                </div>
                <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                  Total Views
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-['Outfit'] font-black text-[#00A882]">
                  {selectedAd.clicks}
                </div>
                <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                  Interactions
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Select space panel */}
      {selectedSpace && !selectedAd && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-white border-l border-black/8 z-50 overflow-y-auto shadow-2xl">
          <SelectSpacePanel
            space={selectedSpace}
            onClose={() => setSelectedSpace(null)}
            onContinue={() => {
              setSelectedSpace(null)
              setShowCreate(true)
            }}
          />
        </div>
      )}
    </div>
  )
}

// ─── Select Space Panel ───────────────────────────────────────────────────────

function SelectSpacePanel({
  space,
  onClose,
  onContinue,
}: {
  space: CanvasTile
  onClose: () => void
  onContinue: () => void
}) {
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | 'premium'>(
    'medium',
  )
  const [duration, setDuration] = useState<7 | 30 | 90>(30)

  const sizes = [
    { id: 'small' as const, label: 'Small', dims: '50 × 50 units', base: 299 },
    { id: 'medium' as const, label: 'Medium', dims: '100 × 100 units', base: 999 },
    { id: 'large' as const, label: 'Large', dims: '200 × 200 units', base: 2499 },
    { id: 'premium' as const, label: 'Premium', dims: 'Custom Size', base: 4999 },
  ]

  const durations = [
    { d: 7 as const, label: '7 Days', mult: 0.3 },
    { d: 30 as const, label: '30 Days', mult: 1 },
    { d: 90 as const, label: '90 Days', mult: 2.6 },
  ]

  const basePrice = sizes.find((s) => s.id === selectedSize)?.base ?? 999
  const mult = durations.find((d) => d.d === duration)?.mult ?? 1
  const price = Math.round(basePrice * mult)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-['Outfit'] font-bold text-xl text-foreground">Reserve Ad Space</h3>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg bg-black/5 hover:bg-black/6 flex items-center justify-center text-muted-foreground transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Space info */}
      <div className="rounded-xl border border-black/8 bg-card p-4 mb-6 space-y-2">
        {[
          ['Location', 'Chennai, India'],
          ['Canvas', 'Chennai Main Canvas'],
          ['Space ID', 'CHN-A-1024'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">{k}</span>
            <span className="text-xs text-foreground font-['Outfit'] font-semibold">{v}</span>
          </div>
        ))}
      </div>

      {/* Size selection */}
      <div className="mb-6">
        <label className="block text-sm font-['Outfit'] font-semibold text-foreground mb-3">
          Ad Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          {sizes.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSize(s.id)}
              className={`p-3 rounded-xl border text-left transition-all ${selectedSize === s.id ? 'border-[#6C5FE6] bg-[#6C5FE6]/10' : 'border-black/8 hover:border-black/12'}`}
            >
              <div className="font-['Outfit'] font-bold text-sm text-foreground">{s.label}</div>
              <div className="font-['JetBrains_Mono'] text-xs text-muted-foreground mt-0.5">
                {s.dims}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="mb-6">
        <label className="block text-sm font-['Outfit'] font-semibold text-foreground mb-3">
          Rental Duration
        </label>
        <div className="flex gap-2">
          {durations.map(({ d, label }) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-['Outfit'] font-semibold transition-all ${duration === d ? 'border-[#6C5FE6] bg-[#6C5FE6]/10 text-[#6C5FE6]' : 'border-black/8 text-muted-foreground hover:border-black/12'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price summary */}
      <div className="rounded-xl border border-[#6C5FE6]/20 bg-[#6C5FE6]/5 p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground font-['Outfit']">Space Size</span>
          <span className="text-sm text-foreground font-['Outfit'] font-semibold">
            {sizes.find((s) => s.id === selectedSize)?.dims}
          </span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-muted-foreground font-['Outfit']">Duration</span>
          <span className="text-sm text-foreground font-['Outfit'] font-semibold">
            {duration} Days
          </span>
        </div>
        <div className="border-t border-black/8 pt-3 flex justify-between items-center">
          <span className="font-['Outfit'] font-bold text-foreground">Total Price</span>
          <span className="font-['Outfit'] font-black text-2xl text-[#6C5FE6]">
            ₹{price.toLocaleString()}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground font-['Inter'] mb-5 flex items-center gap-1.5">
        <Clock size={12} /> This space will be reserved for 10 minutes during checkout.
      </p>

      <PrimaryBtn className="w-full justify-center" onClick={onContinue}>
        Reserve This Space <ArrowRight size={16} />
      </PrimaryBtn>
    </div>
  )
}

// ─── Screen 6: Create Ad ──────────────────────────────────────────────────────

function CreateAdScreen({
  onBack,
  onNavigate,
  onCampaignSaved,
  initialCampaign,
}: {
  onBack: () => void
  onNavigate: (s: Screen) => void
  onCampaignSaved: (campaign: StoredCampaign) => void
  initialCampaign?: StoredCampaign | null
}) {
  const [step, setStep] = useState(initialCampaign ? 2 : 1)
  const [ctaType, setCtaType] = useState(initialCampaign?.callToAction ?? 'Visit Website')
  const [adName, setAdName] = useState(initialCampaign?.name ?? '')
  const [brandName, setBrandName] = useState(initialCampaign?.brandName ?? '')
  const [headline, setHeadline] = useState(initialCampaign?.headline ?? '')
  const [desc, setDesc] = useState(initialCampaign?.description ?? '')
  // Space config state
  const [adWidth, setAdWidth] = useState(initialCampaign?.width ?? 200)
  const [adHeight, setAdHeight] = useState(initialCampaign?.height ?? 200)
  const today = new Date().toISOString().split('T')[0]
  const defaultTo = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  const [dateFrom, setDateFrom] = useState(initialCampaign?.startsAt?.split('T')[0] ?? today)
  const [dateTo, setDateTo] = useState(
    initialCampaign?.endsAt?.split('T')[0] ??
      new Date(Date.now() + 86400000).toISOString().split('T')[0],
  )
  const [durationPreset, setDurationPreset] = useState<string>('1')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [savedCampaign, setSavedCampaign] = useState<StoredCampaign | null>(initialCampaign ?? null)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const DURATION_PRESETS = [
    { label: '1 Day', value: '1', days: 1 },
    { label: '3 Days', value: '3', days: 3 },
    { label: '7 Days', value: '7', days: 7 },
    { label: '14 Days', value: '14', days: 14 },
    { label: '1 Month', value: '30', days: 30 },
    { label: '3 Months', value: '90', days: 90 },
    { label: 'Custom', value: 'custom', days: 0 },
  ]

  const applyPreset = (val: string) => {
    setDurationPreset(val)
    if (val === 'custom') return
    const d = parseInt(val, 10)
    const from = dateFrom || today
    const toDate = new Date(new Date(from).getTime() + d * 86400000)
    setDateTo(toDate.toISOString().split('T')[0])
  }

  const handleDateFromChange = (val: string) => {
    setDateFrom(val)
    setDurationPreset('custom')
    // recalculate end date if a non-custom preset was active
  }

  const handleDateToChange = (val: string) => {
    setDateTo(val)
    setDurationPreset('custom')
  }

  const days = React.useMemo(() => {
    if (!dateFrom || !dateTo) return 0
    const diff = new Date(dateTo).getTime() - new Date(dateFrom).getTime()
    return Math.max(0, Math.round(diff / 86400000))
  }, [dateFrom, dateTo])
  const unitW = Math.round(adWidth / 100)
  const unitH = Math.round(adHeight / 100)
  const totalUnits = unitW * unitH
  const dailyRate = totalUnits * 50
  const totalCost = dailyRate * days

  const adjustDim = (dim: 'w' | 'h', delta: number) => {
    if (dim === 'w') setAdWidth((v) => Math.min(800, Math.max(100, v + delta)))
    else setAdHeight((v) => Math.min(800, Math.max(100, v + delta)))
  }

  const steps = ['Space & Details', 'Preview', 'Payment']

  const saveDraft = async () => {
    if (!uploadedFile) {
      setSaveError('Choose an image creative before previewing your campaign.')
      return
    }

    setIsSaving(true)
    setSaveError('')
    const form = new FormData()
    form.set('creative', uploadedFile)
    form.set('name', adName)
    form.set('brandName', brandName)
    form.set('headline', headline)
    form.set('description', desc)
    form.set('callToAction', ctaType)
    form.set('width', String(adWidth))
    form.set('height', String(adHeight))
    form.set('startsAt', dateFrom)
    form.set('endsAt', dateTo)

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        body: form,
        credentials: 'include',
        headers: previewAuthorizationHeaders(),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to save campaign.')
      const campaign = result.campaign as StoredCampaign
      setSavedCampaign(campaign)
      onCampaignSaved(campaign)
      setStep(2)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Unable to save campaign.')
    } finally {
      setIsSaving(false)
    }
  }

  if (step === 2)
    return (
      <AdPreviewScreen
        onBack={() => setStep(1)}
        onNavigate={onNavigate}
        campaign={savedCampaign as StoredCampaign}
      />
    )
  if (step === 3) return <CheckoutScreen onNavigate={onNavigate} campaign={savedCampaign} />

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit']"
          >
            <ArrowLeft size={16} /> Back to Canvas
          </button>
          <div className="w-px h-5 bg-white/10" />
          <PwLogo size="sm" />
        </div>
        <div className="flex items-center gap-6">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-['Outfit'] font-bold ${step > i + 1 ? 'bg-[#00A882] text-black' : step === i + 1 ? 'bg-[#6C5FE6] text-white' : 'bg-black/8 text-muted-foreground'}`}
              >
                {step > i + 1 ? <Check size={12} /> : i + 1}
              </div>
              <span
                className={`text-sm font-['Outfit'] ${step === i + 1 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}
              >
                {s}
              </span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-white/10 ml-2" />}
            </div>
          ))}
        </div>
        <div className="w-32" />
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10">
        {step === 1 && (
          <div className="max-w-5xl">
            <h2 className="font-['Outfit'] font-black text-4xl text-foreground mb-1">
              Choose Your Space
            </h2>
            <p className="text-muted-foreground font-['Inter'] mb-8">
              Configure your ad dimensions, rental period, and upload your creative.
            </p>

            <div className="grid grid-cols-5 gap-6">
              {/* Left — config column */}
              <div className="col-span-3 space-y-5">
                {/* Space info */}
                <div className="rounded-2xl border border-[#6C5FE6]/20 bg-[#6C5FE6]/4 p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#6C5FE6]/12 flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-[#6C5FE6]" />
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {[
                      ['Space ID', 'CHN-A-1024'],
                      ['Canvas', 'Chennai Main Canvas'],
                      ['Location', 'Chennai, Tamil Nadu'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                          {k}
                        </div>
                        <div className="text-sm font-['Outfit'] font-bold text-foreground mt-0.5">
                          {v}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ad size picker */}
                <div className="rounded-2xl border border-black/8 bg-card p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-['Outfit'] font-bold text-base text-foreground">Ad Size</h3>
                    <span className="text-xs text-muted-foreground font-['JetBrains_Mono'] bg-[#EDF0F8] px-2 py-1 rounded-lg">
                      ₹50 per 100 × 100 px / day
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-['Inter'] mb-5">
                    Choose width and height in 100 px steps. Price scales with the area you select.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {(['Width', 'Height'] as const).map((label) => {
                      const val = label === 'Width' ? adWidth : adHeight
                      const dim = label === 'Width' ? 'w' : 'h'
                      return (
                        <div key={label}>
                          <div className="text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                            {label}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => adjustDim(dim, -100)}
                              disabled={val <= 100}
                              className="w-9 h-9 rounded-xl border border-black/10 bg-[#F0F2F8] hover:bg-[#E4E7F5] flex items-center justify-center text-foreground disabled:opacity-30 transition-all"
                            >
                              <Minus size={14} />
                            </button>
                            <div className="flex-1 h-9 rounded-xl border border-[#6C5FE6]/30 bg-[#6C5FE6]/5 flex items-center justify-center">
                              <span className="font-['JetBrains_Mono'] font-bold text-[#6C5FE6] text-sm">
                                {val} px
                              </span>
                            </div>
                            <button
                              onClick={() => adjustDim(dim, 100)}
                              disabled={val >= 800}
                              className="w-9 h-9 rounded-xl border border-black/10 bg-[#F0F2F8] hover:bg-[#E4E7F5] flex items-center justify-center text-foreground disabled:opacity-30 transition-all"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Quick presets */}
                  <div className="text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                    Quick Presets
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Small', w: 100, h: 100 },
                      { label: 'Standard', w: 200, h: 200 },
                      { label: 'Medium', w: 300, h: 300 },
                      { label: 'Large', w: 400, h: 400 },
                      { label: 'Wide Banner', w: 600, h: 200 },
                      { label: 'Tall', w: 200, h: 400 },
                      { label: 'Billboard', w: 800, h: 400 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        onClick={() => {
                          setAdWidth(p.w)
                          setAdHeight(p.h)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-['Outfit'] font-semibold transition-all border ${adWidth === p.w && adHeight === p.h ? 'bg-[#6C5FE6] text-white border-[#6C5FE6]' : 'bg-[#F0F2F8] text-muted-foreground border-black/5 hover:text-foreground hover:bg-[#E4E7F5]'}`}
                      >
                        {p.label}
                        <span className="ml-1.5 opacity-60 font-['JetBrains_Mono'] text-[10px]">
                          {p.w}×{p.h}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range */}
                <div className="rounded-2xl border border-black/8 bg-card p-6">
                  <h3 className="font-['Outfit'] font-bold text-base text-foreground mb-1">
                    Rental Period
                  </h3>
                  <p className="text-xs text-muted-foreground font-['Inter'] mb-4">
                    Pick a quick duration or choose custom start and end dates.
                  </p>

                  {/* Duration preset dropdown */}
                  <div className="mb-4">
                    <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                      Duration
                    </label>
                    <div className="relative">
                      <select
                        value={durationPreset}
                        onChange={(e) => applyPreset(e.target.value)}
                        className="w-full appearance-none bg-[#6C5FE6]/8 border border-[#6C5FE6]/25 rounded-xl px-4 py-2.5 text-sm font-['Outfit'] font-semibold text-[#6C5FE6] focus:outline-none focus:border-[#6C5FE6]/50 cursor-pointer pr-10"
                      >
                        {DURATION_PRESETS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C5FE6] pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Date pickers */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateFrom}
                        min={today}
                        onChange={(e) => handleDateFromChange(e.target.value)}
                        className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-2.5 text-sm font-['JetBrains_Mono'] text-foreground focus:outline-none focus:border-[#6C5FE6]/50 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateTo}
                        min={dateFrom || today}
                        onChange={(e) => handleDateToChange(e.target.value)}
                        className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-2.5 text-sm font-['JetBrains_Mono'] text-foreground focus:outline-none focus:border-[#6C5FE6]/50 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Summary strip */}
                  {days > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-[#00A882] font-['JetBrains_Mono'] bg-[#00A882]/8 rounded-lg px-3 py-2">
                      <Calendar size={12} />
                      Campaign runs for{' '}
                      <strong>
                        {days} day{days !== 1 ? 's' : ''}
                      </strong>{' '}
                      · {dateFrom} → {dateTo}
                    </div>
                  )}
                  {days === 0 && dateFrom && dateTo && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 font-['JetBrains_Mono'] bg-amber-50 rounded-lg px-3 py-2">
                      <AlertTriangle size={12} /> Start date and end date must be different
                    </div>
                  )}
                  {dateTo && dateFrom && new Date(dateTo) < new Date(dateFrom) && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-500 font-['JetBrains_Mono'] bg-red-50 rounded-lg px-3 py-2">
                      <AlertTriangle size={12} /> End date must be after start date
                    </div>
                  )}
                </div>

                {/* Design guide + upload */}
                <div className="rounded-2xl border border-black/8 bg-card p-6">
                  <h3 className="font-['Outfit'] font-bold text-base text-foreground mb-1">
                    Design & Upload Your Ad
                  </h3>
                  <p className="text-xs text-muted-foreground font-['Inter'] mb-4">
                    Create your ad at exactly{' '}
                    <strong className="text-foreground font-semibold">
                      {adWidth} × {adHeight} px
                    </strong>
                    . You can design it using any tool and upload the finished file here.
                  </p>

                  {/* Design tool links */}
                  <div className="rounded-xl border border-[#6C5FE6]/15 bg-[#6C5FE6]/4 p-4 mb-4">
                    <div className="text-xs font-['Outfit'] font-bold text-[#6C5FE6] mb-3 flex items-center gap-1.5">
                      <Sparkles size={12} /> Design online for free
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          name: 'Canva',
                          url: 'https://www.canva.com',
                          desc: 'Drag & drop design',
                          emoji: '🎨',
                        },
                        {
                          name: 'Adobe Express',
                          url: 'https://express.adobe.com',
                          desc: 'Professional templates',
                          emoji: '✦',
                        },
                        {
                          name: 'Figma',
                          url: 'https://www.figma.com',
                          desc: 'For designers',
                          emoji: '🖼',
                        },
                      ].map((tool) => (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-start gap-1 p-3 rounded-xl border border-black/6 bg-white hover:border-[#6C5FE6]/30 hover:bg-[#6C5FE6]/5 transition-all group"
                        >
                          <div className="text-xl mb-0.5">{tool.emoji}</div>
                          <div className="font-['Outfit'] font-bold text-xs text-foreground group-hover:text-[#6C5FE6] transition-colors">
                            {tool.name}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-['Inter']">
                            {tool.desc}
                          </div>
                          <div className="flex items-center gap-0.5 text-[10px] text-[#6C5FE6] font-['Outfit'] font-semibold mt-0.5">
                            Open <ExternalLink size={9} />
                          </div>
                        </a>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-['JetBrains_Mono'] mt-3 flex items-center gap-1">
                      <span className="text-amber-500">⚠</span>
                      Set canvas to{' '}
                      <strong>
                        {adWidth} × {adHeight} px
                      </strong>{' '}
                      when designing for a perfect fit on the canvas.
                    </p>
                  </div>

                  {/* Upload zone */}
                  <div
                    className={`rounded-xl border-2 border-dashed transition-all cursor-pointer group ${uploadedFile ? 'border-[#00A882]/40 bg-[#00A882]/5' : 'border-black/12 hover:border-[#6C5FE6]/40 hover:bg-[#6C5FE6]/3'}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setUploadedFile(file)
                          setSaveError('')
                        }
                      }}
                    />
                    {uploadedFile ? (
                      <div className="p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#00A882]/15 flex items-center justify-center shrink-0">
                          <Check size={18} className="text-[#00A882]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-['Outfit'] font-bold text-foreground truncate">
                            {uploadedFile.name}
                          </div>
                          <div className="text-xs text-[#00A882] font-['JetBrains_Mono'] mt-0.5">
                            Ready to upload securely
                          </div>
                        </div>
                        <button
                          className="text-xs text-muted-foreground hover:text-foreground font-['Outfit'] shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            setUploadedFile(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 flex flex-col items-center gap-2 text-center">
                        <div className="w-10 h-10 rounded-xl bg-[#EDF0F8] group-hover:bg-[#6C5FE6]/12 flex items-center justify-center transition-colors">
                          <Upload
                            size={18}
                            className="text-muted-foreground group-hover:text-[#6C5FE6] transition-colors"
                          />
                        </div>
                        <div className="text-sm font-['Outfit'] font-semibold text-foreground">
                          Drop your ad file here
                        </div>
                        <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                          JPG, PNG, GIF, WebP · Max 50 MB
                        </div>
                        <div className="text-xs text-muted-foreground font-['Inter']">
                          or design online above and come back to upload
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right — campaign info + cost */}
              <div className="col-span-2 space-y-5">
                {/* Campaign Information */}
                <div className="rounded-2xl border border-black/8 bg-card p-5">
                  <div className="text-sm font-['Outfit'] font-bold text-foreground mb-1">
                    Campaign Information
                  </div>
                  <p className="text-xs text-muted-foreground font-['Inter'] mb-4">
                    Tell us about your ad so viewers know who it's from.
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        label: 'Campaign Name',
                        value: adName,
                        setter: setAdName,
                        placeholder: 'Summer Sale 2025',
                      },
                      {
                        label: 'Business Name',
                        value: brandName,
                        setter: setBrandName,
                        placeholder: 'Acme Corp',
                      },
                      {
                        label: 'Ad Headline',
                        value: headline,
                        setter: setHeadline,
                        placeholder: 'Up to 50% off this summer!',
                      },
                    ].map(({ label, value, setter, placeholder }) => (
                      <div key={label}>
                        <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                          {label}
                        </label>
                        <input
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          placeholder={placeholder}
                          className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                        Description
                      </label>
                      <textarea
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        placeholder="Tell customers why they should choose you..."
                        rows={2}
                        className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50 resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                        Call to Action
                      </label>
                      <div className="relative">
                        <select
                          value={ctaType}
                          onChange={(e) => setCtaType(e.target.value)}
                          className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3.5 py-2 text-sm font-['Outfit'] text-foreground focus:outline-none focus:border-[#6C5FE6]/50 appearance-none cursor-pointer"
                        >
                          {[
                            'Visit Website',
                            'Call Now',
                            'WhatsApp',
                            'Get Directions',
                            'Shop Now',
                            'Book Now',
                            'Learn More',
                          ].map((o) => (
                            <option key={o}>{o}</option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="rounded-2xl border border-[#6C5FE6]/20 bg-[#6C5FE6]/4 p-5 space-y-3">
                  <div className="text-sm font-['Outfit'] font-bold text-foreground">
                    Cost Breakdown
                  </div>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Size', `${adWidth} × ${adHeight} px`],
                      ['Area units', `${unitW} × ${unitH} = ${totalUnits} units`],
                      ['Rate', `₹50 × ${totalUnits} = ₹${dailyRate} / day`],
                      ['Duration', `${days} day${days !== 1 ? 's' : ''}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-muted-foreground font-['JetBrains_Mono'] text-xs">
                          {k}
                        </span>
                        <span className="text-foreground font-['JetBrains_Mono'] text-xs font-semibold">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#6C5FE6]/15 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-['Outfit'] font-bold text-sm text-foreground">
                        Total
                      </span>
                      <span className="font-['Outfit'] font-black text-2xl text-[#6C5FE6]">
                        {days > 0 ? `₹${totalCost.toLocaleString()}` : '—'}
                      </span>
                    </div>
                    {days > 0 && (
                      <div className="text-[10px] text-muted-foreground font-['JetBrains_Mono'] mt-1 text-right">
                        ₹{dailyRate}/day × {days} days
                      </div>
                    )}
                  </div>
                  {days === 0 && (
                    <p className="text-xs text-amber-600 font-['Inter'] flex items-center gap-1">
                      <AlertTriangle size={11} /> Select valid dates to see total cost
                    </p>
                  )}
                </div>

                {/* Size reference table */}
                <div className="rounded-2xl border border-black/8 bg-card p-5">
                  <div className="text-xs font-['Outfit'] font-bold text-foreground mb-3">
                    Size Reference
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-black/5">
                        {['Size', 'Use for', '₹/day'].map((h) => (
                          <th
                            key={h}
                            className="text-left pb-2 text-muted-foreground font-['JetBrains_Mono'] font-medium"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-['JetBrains_Mono']">
                      {[
                        ['100×100', 'Icon / logo', '₹50'],
                        ['200×200', 'Standard post', '₹200'],
                        ['400×400', 'Feature ad', '₹800'],
                        ['600×200', 'Banner strip', '₹600'],
                        ['800×400', 'Billboard', '₹1,600'],
                      ].map(([sz, use, cost]) => (
                        <tr key={sz} className="border-b border-black/4 last:border-0">
                          <td className="py-1.5 text-[#6C5FE6] font-semibold">{sz}</td>
                          <td className="py-1.5 text-muted-foreground">{use}</td>
                          <td className="py-1.5 text-foreground font-semibold">{cost}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <Clock size={13} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 font-['Inter'] leading-relaxed">
                    This space is reserved for <strong>10 minutes</strong> during checkout. Complete
                    payment to secure your dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-10">
          <GhostBtn onClick={() => onBack()}>
            <ChevronLeft size={16} /> Back to Canvas
          </GhostBtn>
          <div className="flex flex-col items-end gap-2">
            {saveError && (
              <p className="max-w-md text-right text-xs font-['Inter'] text-red-500">{saveError}</p>
            )}
            <PrimaryBtn onClick={saveDraft} disabled={isSaving}>
              {isSaving ? 'Saving Draft…' : 'Save Draft & Preview'} <ArrowRight size={16} />
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 7: Ad Preview ─────────────────────────────────────────────────────

function AdPreviewScreen({
  onBack,
  onNavigate,
  campaign,
}: {
  onBack: () => void
  onNavigate: (s: Screen) => void
  campaign: StoredCampaign
}) {
  const [mode, setMode] = useState<'canvas' | 'hover' | 'detail'>('canvas')

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 sticky top-0 z-50 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl">
        <PwLogo size="sm" />
        <h2 className="font-['Outfit'] font-bold text-lg text-foreground">Ad Preview</h2>
        <div className="flex gap-3">
          <GhostBtn small onClick={onBack}>
            <Edit2 size={14} /> Back to Edit
          </GhostBtn>
          <PrimaryBtn small onClick={() => onNavigate('checkout')}>
            Continue to Payment <ArrowRight size={14} />
          </PrimaryBtn>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex gap-2 mb-8">
          {(['canvas', 'hover', 'detail'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-xl text-sm font-['Outfit'] font-semibold capitalize transition-all ${mode === m ? 'bg-[#6C5FE6] text-white' : 'bg-black/5 text-muted-foreground hover:text-foreground'}`}
            >
              {m === 'canvas' ? 'Canvas View' : m === 'hover' ? 'Hover View' : 'Ad Detail View'}
            </button>
          ))}
        </div>

        {mode === 'canvas' && (
          <div className="rounded-3xl border border-black/8 overflow-hidden bg-[#ECF0FA] p-6 min-h-[400px] relative canvas-grid-preview">
            <style>{`.canvas-grid-preview { background-image: linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px); background-size: 80px 80px; }`}</style>
            <div className="flex items-center justify-center gap-4 h-72">
              {/* surrounding tiles */}
              <div className="w-24 h-24 rounded-lg bg-[#E23744] opacity-50" />
              <div className="w-36 h-36 rounded-xl overflow-hidden relative shadow-[0_0_30px_rgba(124,111,247,0.4)] ring-2 ring-[#6C5FE6]">
                <CreativeImage campaign={campaign} sizes="144px" />
                <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-[#6C5FE6] rounded text-white text-xs font-['JetBrains_Mono']">
                  YOUR AD
                </div>
              </div>
              <div className="w-20 h-20 rounded-lg bg-[#FF6B35] opacity-50" />
            </div>
            <p className="text-center text-xs text-muted-foreground font-['JetBrains_Mono'] mt-2">
              Your ad appears on the Chennai canvas alongside other advertisers
            </p>
          </div>
        )}

        {mode === 'hover' && (
          <div className="rounded-3xl border border-black/8 overflow-hidden bg-[#ECF0FA] p-6 flex items-center justify-center min-h-[400px]">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-xl">
              <CreativeImage campaign={campaign} sizes="192px" />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4">
                <div className="font-['Outfit'] font-bold text-white text-base text-center">
                  {campaign.brandName}
                </div>
                <div className="font-['Inter'] text-white/75 text-xs text-center">
                  {campaign.headline}
                </div>
                <div className="mt-1 px-4 py-1.5 bg-[#6C5FE6] rounded-lg text-white text-xs font-['Outfit'] font-bold">
                  View Ad
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'detail' && (
          <div className="max-w-md mx-auto rounded-3xl border border-black/8 bg-card overflow-hidden">
            <div className="relative aspect-video bg-gradient-to-br from-[#6C5FE6] to-[#4C3FBF]">
              <CreativeImage campaign={campaign} sizes="448px" />
            </div>
            <div className="p-6">
              <h3 className="font-['Outfit'] font-bold text-xl text-foreground mb-1">
                {campaign.brandName}
              </h3>
              <p className="text-sm text-muted-foreground font-['Inter'] mb-4">
                {campaign.headline} — {campaign.description || 'Tap to learn more.'}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#6C5FE6] text-white text-sm font-['Outfit'] font-semibold">
                  <ExternalLink size={14} /> Visit Website
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-black/8 text-sm font-['Outfit'] text-foreground">
                  <Phone size={14} /> Call Now
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen 8: Checkout ───────────────────────────────────────────────────────

function CheckoutScreen({
  onNavigate,
  campaign,
}: {
  onNavigate: (s: Screen) => void
  campaign: StoredCampaign | null
}) {
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking'>('upi')

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-8 py-4 border-b border-black/6 sticky top-0 z-50 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl">
        <PwLogo size="sm" />
        <h2 className="font-['Outfit'] font-bold text-lg text-foreground">Checkout</h2>
        <div className="w-24" />
      </header>

      <div className="max-w-4xl mx-auto px-8 py-10 grid grid-cols-5 gap-8">
        {/* Summary */}
        <div className="col-span-3 space-y-6">
          <div className="rounded-2xl border border-black/8 bg-card p-6">
            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
              Campaign Summary
            </h3>
            {campaign?.creative.url && (
              <div className="relative mb-5 aspect-video overflow-hidden rounded-xl bg-[#EDF0F8]">
                <CreativeImage campaign={campaign} sizes="480px" />
              </div>
            )}
            <div className="space-y-3">
              {[
                ['Location', 'Chennai, Tamil Nadu'],
                ['Ad Space', 'CHN-A-1024'],
                ['Size', '100 × 100 units (Medium)'],
                ['Duration', '30 Days'],
                ['Start Date', '25 July 2025'],
                ['Expiry Date', '24 August 2025'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-2 border-b border-black/5 last:border-0"
                >
                  <span className="text-sm text-muted-foreground font-['JetBrains_Mono']">{k}</span>
                  <span className="text-sm text-foreground font-['Outfit'] font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-2xl border border-black/8 bg-card p-6">
            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
              Payment Method
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {(['upi', 'card', 'netbanking'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`p-3 rounded-xl border text-sm font-['Outfit'] font-semibold capitalize transition-all ${method === m ? 'border-[#6C5FE6] bg-[#6C5FE6]/10 text-[#6C5FE6]' : 'border-black/8 text-muted-foreground hover:border-black/12'}`}
                >
                  {m === 'upi' ? 'UPI' : m === 'card' ? 'Card' : 'Net Banking'}
                </button>
              ))}
            </div>

            {method === 'upi' && (
              <div>
                <label className="block text-sm font-['Outfit'] font-semibold text-foreground mb-2">
                  UPI ID
                </label>
                <input
                  placeholder="yourname@bank"
                  className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                />
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-3">
                <input
                  placeholder="Card Number"
                  className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="MM / YY"
                    className="bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                  />
                  <input
                    placeholder="CVV"
                    className="bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price summary */}
        <div className="col-span-2">
          <div className="rounded-2xl border border-black/8 bg-card p-6 sticky top-24">
            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">Order Total</h3>
            <div className="space-y-3 mb-5">
              {[
                ['Space Rental (30 days)', '₹999'],
                ['Creative Processing Fee', '₹49'],
                ['GST (18%)', '₹188'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{k}</span>
                  <span className="text-sm text-foreground font-semibold">{v}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-black/8 pt-4 flex justify-between items-center mb-6">
              <span className="font-['Outfit'] font-bold text-foreground text-lg">Total</span>
              <span className="font-['Outfit'] font-black text-2xl text-[#6C5FE6]">₹1,236</span>
            </div>

            <PrimaryBtn
              className="w-full justify-center mb-4"
              onClick={() => onNavigate('dashboard')}
            >
              Pay & Submit Ad <ArrowRight size={16} />
            </PrimaryBtn>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/8 border border-amber-500/15">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-400/80 font-['Inter'] leading-relaxed">
                Your advertisement will be reviewed before it becomes publicly visible. Review
                typically takes 2–4 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 9: Advertiser Dashboard ──────────────────────────────────────────

const DASH_CAMPAIGNS = [
  {
    name: 'Summer Sale Campaign',
    city: 'Chennai',
    canvas: 'Chennai Main',
    status: 'active',
    start: '1 Jul',
    expiry: '31 Jul',
    days: 10,
    impressions: '42,180',
    interactions: '3,241',
    emoji: '🎉',
    color: '#6C5FE6',
  },
  {
    name: 'Product Launch Q3',
    city: 'Bangalore',
    canvas: 'Koramangala',
    status: 'pending',
    start: '25 Jul',
    expiry: '24 Aug',
    days: 30,
    impressions: '—',
    interactions: '—',
    emoji: '🚀',
    color: '#00A882',
  },
  {
    name: 'Festival Offer',
    city: 'Mumbai',
    canvas: 'Andheri West',
    status: 'expiring',
    start: '1 Jun',
    expiry: '28 Jul',
    days: 3,
    impressions: '128,440',
    interactions: '9,821',
    emoji: '🪔',
    color: '#F59E0B',
  },
]

function DashboardScreen({
  onNavigate,
  campaigns,
  onOpenCampaign,
}: {
  onNavigate: (s: Screen) => void
  campaigns: StoredCampaign[]
  onOpenCampaign: (campaign: StoredCampaign) => void
}) {
  const [activePage, setActivePage] = useState('overview')

  const sidebarItems = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'campaigns', icon: Megaphone, label: 'Campaigns' },
    { id: 'spaces', icon: Grid3X3, label: 'My Ad Spaces' },
    { id: 'creatives', icon: FileImage, label: 'Creatives' },
    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
    { id: 'payments', icon: Wallet, label: 'Payments' },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: '3' },
    { id: 'profile', icon: UserCircle, label: 'Business Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-black/6 flex flex-col fixed top-0 bottom-0 left-0 z-40">
        <div className="p-6 border-b border-black/6">
          <PwLogo size="sm" />
        </div>
        <nav className="flex-1 p-3 overflow-y-auto">
          {sidebarItems.map(({ id, icon: Icon, label, badge }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl mb-0.5 text-sm font-['Outfit'] font-medium transition-all ${activePage === id ? 'bg-[#6C5FE6]/15 text-[#6C5FE6]' : 'text-muted-foreground hover:text-foreground hover:bg-black/4'}`}
            >
              <Icon size={16} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="text-xs bg-[#6C5FE6] text-white px-1.5 py-0.5 rounded-full font-['JetBrains_Mono']">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-black/6">
          <button
            onClick={() => onNavigate('landing')}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-['Outfit'] text-muted-foreground hover:text-foreground hover:bg-black/4 transition-all"
          >
            <LogOut size={16} /> Back to Canvas
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-60 min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-black/6 bg-[rgba(245,247,252,0.95)] backdrop-blur-xl">
          <div>
            <h1 className="font-['Outfit'] font-black text-2xl text-foreground">Overview</h1>
            <p className="text-sm text-muted-foreground font-['Inter']">
              Welcome back, Arjun — here&#39;s what&#39;s happening.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6C5FE6]" />
            </button>
            <PrimaryBtn small onClick={() => onNavigate('canvas')}>
              + New Campaign
            </PrimaryBtn>
          </div>
        </header>

        <div className="p-8">
          {campaigns.length > 0 && (
            <div className="mb-8">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="font-['Outfit'] text-xl font-black text-foreground">
                    Saved Payload Drafts
                  </h2>
                  <p className="font-['Inter'] text-sm text-muted-foreground">
                    These campaigns and creatives persist across devices and sessions.
                  </p>
                </div>
                <Badge color="purple">{campaigns.length} drafts</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {campaigns.map((campaign) => (
                  <button
                    key={campaign.id}
                    onClick={() => onOpenCampaign(campaign)}
                    className="overflow-hidden rounded-2xl border border-black/6 bg-card text-left transition-all hover:border-[#6C5FE6]/30 hover:shadow-lg"
                  >
                    <div className="relative aspect-video bg-[#EDF0F8]">
                      <CreativeImage campaign={campaign} sizes="(max-width: 1200px) 33vw, 360px" />
                      <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 font-['JetBrains_Mono'] text-[10px] font-bold uppercase text-[#6C5FE6] backdrop-blur">
                        {campaign.status}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="font-['Outfit'] text-sm font-bold text-foreground">
                        {campaign.name}
                      </div>
                      <div className="mt-1 font-['Inter'] text-xs text-muted-foreground">
                        {campaign.brandName} · {campaign.width} × {campaign.height}px
                      </div>
                      <div className="mt-3 font-['Outfit'] text-xs font-semibold text-[#6C5FE6]">
                        Open campaign →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Stats */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {[
              { label: 'Active Campaigns', value: '3', icon: Megaphone, accent: true },
              { label: 'Pending Approval', value: '1', icon: Clock },
              { label: 'Expiring Soon', value: '1', icon: AlertTriangle },
              { label: 'Total Impressions', value: '170.6K', icon: Eye },
              { label: 'Ad Interactions', value: '13.1K', icon: MousePointer },
              { label: 'CTA Clicks', value: '4,820', icon: Target },
            ].map((s) => (
              <div
                key={s.label}
                className={`rounded-2xl border p-4 ${s.accent ? 'border-[#6C5FE6]/20 bg-[#6C5FE6]/8' : 'border-black/6 bg-card'}`}
              >
                <s.icon
                  size={16}
                  className={`mb-2 ${s.accent ? 'text-[#6C5FE6]' : 'text-muted-foreground'}`}
                />
                <div
                  className={`text-2xl font-['Outfit'] font-black ${s.accent ? 'text-[#6C5FE6]' : 'text-foreground'}`}
                >
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Chart placeholder */}
          <div className="rounded-2xl border border-black/6 bg-card p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-['Outfit'] font-bold text-lg text-foreground">
                  Impressions Over Time
                </h3>
                <p className="text-sm text-muted-foreground font-['Inter']">
                  Last 30 days across all campaigns
                </p>
              </div>
              <div className="flex gap-2">
                {['7D', '30D', '90D'].map((t) => (
                  <button
                    key={t}
                    className={`px-3 py-1 rounded-lg text-xs font-['Outfit'] font-semibold ${t === '30D' ? 'bg-[#6C5FE6] text-white' : 'bg-black/5 text-muted-foreground hover:text-foreground'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            {/* Simple bar chart */}
            <div className="flex items-end gap-1.5 h-32">
              {[
                42, 68, 55, 82, 94, 76, 88, 102, 115, 98, 124, 108, 132, 95, 110, 128, 140, 118,
                145, 132, 155, 148, 162, 138, 175, 168, 182, 158, 170, 185,
              ].map((v, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-[#6C5FE6]/40 hover:bg-[#6C5FE6]/70 transition-colors"
                  style={{ height: `${(v / 185) * 100}%` }}
                />
              ))}
            </div>
          </div>

          {/* Campaigns table */}
          <div className="rounded-2xl border border-black/6 bg-card overflow-hidden mb-8">
            <div className="flex items-center justify-between p-6 border-b border-black/6">
              <h3 className="font-['Outfit'] font-bold text-lg text-foreground">My Campaigns</h3>
              <PrimaryBtn small onClick={() => onNavigate('canvas')}>
                + New Campaign
              </PrimaryBtn>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5">
                    {[
                      'Campaign',
                      'City / Canvas',
                      'Status',
                      'Dates',
                      'Impressions',
                      'Interactions',
                      'Actions',
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 text-xs font-['JetBrains_Mono'] text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DASH_CAMPAIGNS.map((c) => (
                    <tr
                      key={c.name}
                      className="border-b border-black/4 hover:bg-white/2 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                            style={{ background: `${c.color}20` }}
                          >
                            {c.emoji}
                          </div>
                          <span className="font-['Outfit'] font-semibold text-sm text-foreground">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground font-['Outfit']">{c.city}</div>
                        <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                          {c.canvas}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          color={
                            c.status === 'active'
                              ? 'teal'
                              : c.status === 'pending'
                                ? 'purple'
                                : 'amber'
                          }
                        >
                          {c.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                          {c.start} → {c.expiry}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: c.days <= 5 ? '#F59E0B' : '#6B7491' }}
                        >
                          {c.days} days left
                        </div>
                      </td>
                      <td className="px-6 py-4 font-['Outfit'] font-semibold text-sm text-foreground">
                        {c.impressions}
                      </td>
                      <td className="px-6 py-4 font-['Outfit'] font-semibold text-sm text-foreground">
                        {c.interactions}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="px-2.5 py-1 rounded-lg bg-black/5 hover:bg-black/6 text-xs font-['Outfit'] text-muted-foreground hover:text-foreground transition-all">
                            Analytics
                          </button>
                          {c.status === 'expiring' && (
                            <button
                              onClick={() => onNavigate('expiring')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-xs font-['Outfit'] text-amber-400 transition-all"
                            >
                              Renew
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ad Space thumbnails */}
          <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-4">My Ad Spaces</h3>
          <div className="grid grid-cols-3 gap-4">
            {DASH_CAMPAIGNS.map((c) => (
              <div
                key={c.name}
                className="rounded-2xl border border-black/6 bg-card overflow-hidden"
              >
                <div
                  className="aspect-video flex items-center justify-center text-4xl"
                  style={{ background: `${c.color}18` }}
                >
                  {c.emoji}
                </div>
                <div className="p-4">
                  <div className="font-['Outfit'] font-semibold text-sm text-foreground">
                    {c.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                    {c.city} · Expires {c.expiry}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Badge
                      color={
                        c.status === 'active' ? 'teal' : c.status === 'pending' ? 'purple' : 'amber'
                      }
                    >
                      {c.status}
                    </Badge>
                    {c.status === 'expiring' && (
                      <button
                        onClick={() => onNavigate('expiring')}
                        className="text-xs text-amber-400 font-['Outfit'] font-semibold hover:text-amber-300"
                      >
                        Renew →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Screen 10: Expiring Ad ───────────────────────────────────────────────────

function ExpiringAdScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] mb-8"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center">
              <AlertTriangle size={22} className="text-amber-400" />
            </div>
            <div>
              <div className="font-['Outfit'] font-black text-xl text-foreground">
                Your ad space is expiring soon!
              </div>
              <div className="text-sm text-amber-400 font-['Outfit'] font-semibold">
                Your Chennai ad space expires in 3 days
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-black/8 bg-card p-6 mb-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center text-3xl">
                🪔
              </div>
              <div>
                <div className="font-['Outfit'] font-bold text-lg text-foreground">
                  Festival Offer Campaign
                </div>
                <div className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                  CHN-A-0842 · Chennai Main Canvas
                </div>
                <div className="text-sm text-amber-400 font-['Outfit'] font-semibold mt-1">
                  Expires: 28 July 2025
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Views', value: '128,440', color: '#6C5FE6' },
                { label: 'Interactions', value: '9,821', color: '#00A882' },
                { label: 'CTA Clicks', value: '3,450', color: '#EC4899' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-black/6 bg-[#F5F7FC] p-4 text-center"
                >
                  <div className="text-xl font-['Outfit'] font-black" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <PrimaryBtn className="flex-1 justify-center" onClick={() => onNavigate('checkout')}>
              Renew for 30 Days — ₹999 <ArrowRight size={16} />
            </PrimaryBtn>
            <GhostBtn className="flex-1 justify-center" onClick={() => onNavigate('dashboard')}>
              Let It Expire
            </GhostBtn>
          </div>
        </div>

        <div className="rounded-2xl border border-black/8 bg-card p-5">
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground font-['Inter'] leading-relaxed">
              If you don&#39;t renew, your ad will be removed and the space will become available to
              other advertisers after the{' '}
              <strong className="text-foreground">48-hour grace period</strong>. You can still
              reactivate it within this window if you change your mind.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Screen 11: Admin Dashboard ───────────────────────────────────────────────

function AdminDashboard({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [activePage, setActivePage] = useState('overview')

  const adminNav = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'advertisers', icon: Building2, label: 'Advertisers' },
    { id: 'ads', icon: FileImage, label: 'Ads & Creatives' },
    { id: 'campaigns', icon: Megaphone, label: 'Campaigns' },
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
      badge: '23',
    },
    { id: 'payments', icon: CreditCard, label: 'Payments' },
    { id: 'pricing', icon: DollarSign, label: 'Pricing' },
    { id: 'analytics', icon: Activity, label: 'Analytics' },
    { id: 'audit', icon: BookOpen, label: 'Audit Logs' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const metrics = [
    {
      label: 'Total Users',
      value: '248,120',
      change: '+1,240 today',
      icon: Users,
      color: '#6C5FE6',
    },
    {
      label: 'Active Advertisers',
      value: '42,830',
      change: '+380 this week',
      icon: Building2,
      color: '#00A882',
    },
    {
      label: 'Active Campaigns',
      value: '128,440',
      change: '+920 today',
      icon: Megaphone,
      color: '#EC4899',
    },
    {
      label: 'Pending Ad Reviews',
      value: '23',
      change: 'Action required',
      icon: Clock,
      color: '#F59E0B',
    },
    {
      label: 'Expiring This Week',
      value: '45',
      change: 'Need attention',
      icon: AlertTriangle,
      color: '#E03E4D',
    },
    {
      label: 'Canvas Occupancy',
      value: '68%',
      change: 'Across all cities',
      icon: Grid3X3,
      color: '#6C5FE6',
    },
    {
      label: 'Monthly Revenue',
      value: '₹8.4M',
      change: '+22% vs last month',
      icon: DollarSign,
      color: '#00A882',
    },
    {
      label: 'Failed Payments',
      value: '12',
      change: 'Retry pending',
      icon: AlertTriangle,
      color: '#E03E4D',
    },
  ]

  return (
    <div className="min-h-screen bg-[#F4F6FB] flex">
      {/* Admin sidebar — slightly different tint */}
      <aside className="w-60 bg-[#FAFBFF] border-r border-black/5 flex flex-col fixed top-0 bottom-0 left-0 z-40">
        <div className="p-5 border-b border-black/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#E03E4D]/20 flex items-center justify-center">
              <Shield size={14} className="text-[#E03E4D]" />
            </div>
            <div>
              <div className="font-['Outfit'] font-black text-sm text-foreground">PixelWorld</div>
              <div className="font-['JetBrains_Mono'] text-xs text-[#E03E4D]">Admin Console</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {adminNav.map(({ id, icon: Icon, label, badge, action }) => (
            <button
              key={id}
              onClick={action || (() => setActivePage(id))}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-['Outfit'] font-medium transition-all ${activePage === id ? 'bg-[#E03E4D]/12 text-[#E03E4D]' : 'text-muted-foreground hover:text-foreground hover:bg-black/3'}`}
            >
              <Icon size={15} />
              <span className="flex-1 text-left">{label}</span>
              {badge && (
                <span className="text-xs bg-[#E03E4D] text-white px-1.5 py-0.5 rounded-full font-['JetBrains_Mono']">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-black/5">
          <button
            onClick={() => onNavigate('landing')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-black/3 transition-all font-['Outfit']"
          >
            <LogOut size={15} /> Exit Admin
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-60">
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl">
          <div>
            <h1 className="font-['Outfit'] font-black text-2xl text-foreground">
              Admin Control Center
            </h1>
            <p className="text-sm text-muted-foreground font-['JetBrains_Mono']">
              21 Jul 2025 · 09:42 IST
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-muted-foreground hover:text-foreground">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#E03E4D]" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#E03E4D]/20 flex items-center justify-center text-xs font-bold text-[#E03E4D] font-['Outfit']">
              SA
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Metrics grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-2xl border border-black/5 bg-[#F0F2F9] p-5">
                <div className="flex items-center justify-between mb-3">
                  <m.icon size={16} style={{ color: m.color }} />
                  <MoreHorizontal size={14} className="text-muted-foreground" />
                </div>
                <div className="text-2xl font-['Outfit'] font-black text-foreground">{m.value}</div>
                <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                  {m.label}
                </div>
                <div className="text-xs mt-1.5" style={{ color: m.color }}>
                  {m.change}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Geographic overview */}
            <div className="col-span-2 rounded-2xl border border-black/5 bg-[#F0F2F9] p-6">
              <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
                Performance by City
              </h3>
              {[
                { city: 'Mumbai', ads: 3420, rev: '₹2.1M', occ: 82 },
                { city: 'Delhi', ads: 2890, rev: '₹1.8M', occ: 79 },
                { city: 'Bangalore', ads: 2180, rev: '₹1.4M', occ: 76 },
                { city: 'Chennai', ads: 1245, rev: '₹0.8M', occ: 62 },
                { city: 'Hyderabad', ads: 1560, rev: '₹1.0M', occ: 59 },
              ].map((c) => (
                <div
                  key={c.city}
                  className="flex items-center gap-4 py-2.5 border-b border-black/4 last:border-0"
                >
                  <div className="w-24 font-['Outfit'] font-semibold text-sm text-foreground">
                    {c.city}
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#6C5FE6] to-[#00A882]"
                      style={{ width: `${c.occ}%` }}
                    />
                  </div>
                  <div className="text-xs font-['JetBrains_Mono'] text-muted-foreground w-8">
                    {c.occ}%
                  </div>
                  <div className="text-xs font-['JetBrains_Mono'] text-[#00A882] w-16 text-right">
                    {c.rev}
                  </div>
                </div>
              ))}
            </div>

            {/* Action required */}
            <div className="rounded-2xl border border-black/5 bg-[#F0F2F9] p-6">
              <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
                Action Required
              </h3>
              {[
                {
                  label: 'Ads Pending Review',
                  count: 23,
                  color: '#F59E0B',
                  action: 'admin-mod' as Screen,
                },
                {
                  label: 'Failed Payments',
                  count: 12,
                  color: '#E03E4D',
                  action: 'admin' as Screen,
                },
                {
                  label: 'Ads Expiring Today',
                  count: 45,
                  color: '#EC4899',
                  action: 'admin' as Screen,
                },
                {
                  label: 'User Reports',
                  count: 3,
                  color: '#E03E4D',
                  action: 'admin-mod' as Screen,
                },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => onNavigate(a.action)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-black/4 transition-all mb-1"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                    <span className="text-sm font-['Outfit'] text-foreground">{a.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-['Outfit'] font-black text-sm" style={{ color: a.color }}>
                      {a.count}
                    </span>
                    <ChevronRight size={12} className="text-muted-foreground" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Screen 12: Admin Moderation ──────────────────────────────────────────────

function AdminModeration({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [action, setAction] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <header className="flex items-center gap-4 px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit']"
        >
          <ArrowLeft size={16} /> Admin Dashboard
        </button>
        <div className="w-px h-5 bg-white/10" />
        <h1 className="font-['Outfit'] font-bold text-lg text-foreground">Ad Moderation</h1>
        <div className="ml-auto flex items-center gap-3">
          <Badge color="amber">23 Pending</Badge>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-2 gap-8">
        {/* Creative preview */}
        <div>
          <div className="rounded-2xl border border-black/8 bg-card overflow-hidden mb-4">
            <div className="aspect-video bg-gradient-to-br from-[#FF6B35] to-[#E23744] flex flex-col items-center justify-center gap-3 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />
              <div className="text-5xl">🍕</div>
              <div className="font-['Outfit'] font-black text-white text-3xl">
                Chennai Pizza Co.
              </div>
              <div className="font-['Inter'] text-white/80 text-base">
                Best pizza in the city · Free delivery
              </div>
              <div className="px-6 py-2.5 bg-white rounded-xl text-[#FF6B35] font-['Outfit'] font-bold">
                Order Now
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-black/8 bg-card p-5">
            <div className="font-['Outfit'] font-semibold text-sm text-foreground mb-3">
              Ad Creative Details
            </div>
            <div className="space-y-2">
              {[
                ['Format', 'Static Image · JPG · 1200×628px'],
                ['File Size', '842 KB'],
                ['Color Profile', 'sRGB'],
                ['Destination URL', 'https://chennaipizzaco.in/order'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">{k}</span>
                  <span className="text-xs text-foreground font-['Outfit']">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-black/8 bg-card p-6">
            <h3 className="font-['Outfit'] font-bold text-lg text-foreground mb-5">
              Ad Information
            </h3>
            <div className="space-y-2.5">
              {[
                ['Advertiser', 'Priya Subramanian'],
                ['Business Name', 'Chennai Pizza Co.'],
                ['Campaign', 'Weekend Special Offer'],
                ['Canvas', 'Chennai Main Canvas · Zone B'],
                ['City', 'Chennai, Tamil Nadu'],
                ['Rental Duration', '30 Days'],
                ['Start Date', '25 July 2025'],
                ['Expiry Date', '24 August 2025'],
                ['CTA Type', 'Order Now → chennaipizzaco.in'],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between py-1.5 border-b border-black/4 last:border-0"
                >
                  <span className="text-sm text-muted-foreground font-['JetBrains_Mono']">{k}</span>
                  <span className="text-sm text-foreground font-['Outfit'] font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl border border-black/8 bg-card p-6">
            <h3 className="font-['Outfit'] font-bold text-base text-foreground mb-4">
              Moderation Checklist
            </h3>
            {[
              {
                label: 'Creative Quality',
                status: 'pass',
                note: 'Clear, high-res image meets minimum requirements',
              },
              { label: 'Content Policy', status: 'pass', note: 'No prohibited content detected' },
              {
                label: 'Destination URL',
                status: 'pass',
                note: 'URL resolves and loads correctly',
              },
              {
                label: 'Business Information',
                status: 'review',
                note: 'GST number not provided — verify manually',
              },
            ].map(({ label, status, note }) => (
              <div
                key={label}
                className="flex items-start gap-3 py-2.5 border-b border-black/4 last:border-0"
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${status === 'pass' ? 'bg-[#00A882]/15' : 'bg-amber-500/15'}`}
                >
                  {status === 'pass' ? (
                    <Check size={11} className="text-[#00A882]" />
                  ) : (
                    <AlertTriangle size={10} className="text-amber-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-['Outfit'] font-semibold text-foreground">
                    {label}
                  </div>
                  <div className="text-xs text-muted-foreground font-['Inter'] mt-0.5">{note}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {action === 'reject' ? (
            <div className="rounded-2xl border border-[#E03E4D]/20 bg-[#E03E4D]/5 p-5">
              <div className="font-['Outfit'] font-semibold text-sm text-foreground mb-3">
                Rejection Reason (required)
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this ad is being rejected..."
                rows={3}
                className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-4 py-3 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#E03E4D]/40 resize-none mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setAction(null)}
                  className="flex-1 py-2.5 rounded-xl border border-black/8 text-sm font-['Outfit'] text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-[#E03E4D] text-white text-sm font-['Outfit'] font-semibold hover:bg-[#E03E4D] transition-all">
                  Send Rejection
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00A882] text-[#07080F] font-['Outfit'] font-bold text-sm hover:bg-[#00B891] transition-all"
              >
                <Check size={16} /> Approve Ad
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#6C5FE6]/30 text-[#6C5FE6] font-['Outfit'] font-bold text-sm hover:bg-[#6C5FE6]/10 transition-all">
                <Edit2 size={14} /> Request Changes
              </button>
              <button
                onClick={() => setAction('reject')}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#E03E4D]/30 text-[#E03E4D] font-['Outfit'] font-bold text-sm hover:bg-[#E03E4D]/10 transition-all"
              >
                <X size={16} /> Reject Ad
              </button>
              <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-black/8 text-muted-foreground font-['Outfit'] font-bold text-sm hover:text-foreground hover:border-black/12 transition-all">
                <Shield size={14} /> Suspend Advertiser
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Screen 13: Admin Canvas ──────────────────────────────────────────────────

function AdminCanvasScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  const [selectedTile, setSelectedTile] = useState<CanvasTile | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const statusColors: Record<string, string> = {
    active: '#00A882',
    available: '#DDE2F2',
    reserved: '#6C5FE6',
    expiring: '#F59E0B',
    suspended: '#E03E4D',
    premium: '#EC4899',
  }

  const adTiles = TILES.filter((t) => t.type === 'ad')
  const availTiles = TILES.filter((t) => t.type === 'available')

  return (
    <div className="min-h-screen bg-[#F4F6FB]">
      <header className="flex items-center gap-4 px-8 py-4 border-b border-black/5 bg-[rgba(244,246,251,0.95)] backdrop-blur-xl sticky top-0 z-50">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit']"
        >
          <ArrowLeft size={16} /> Admin
        </button>
        <div className="w-px h-5 bg-white/10" />
        <h1 className="font-['Outfit'] font-bold text-lg text-foreground">
          Canvas Management — Chennai Main Canvas
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex gap-1">
            {['all', 'active', 'available', 'expiring', 'suspended'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-['Outfit'] font-semibold capitalize transition-all ${filterStatus === s ? 'bg-[#6C5FE6] text-white' : 'bg-black/5 text-muted-foreground hover:text-foreground'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black/8 text-xs font-['Outfit'] text-muted-foreground hover:text-foreground">
            <Filter size={12} /> Filters
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Canvas mini view */}
        <div className="flex-1 overflow-auto p-6">
          {/* Stats bar */}
          <div className="grid grid-cols-6 gap-3 mb-6">
            {[
              { label: 'Total Inventory', value: '1,200', color: '#6B7491' },
              { label: 'Available', value: availTiles.length.toString(), color: '#5B6890' },
              { label: 'Occupied', value: adTiles.length.toString(), color: '#00A882' },
              { label: 'Reserved', value: '8', color: '#6C5FE6' },
              { label: 'Occupancy Rate', value: '68%', color: '#6C5FE6' },
              { label: 'Revenue (MTD)', value: '₹8.4M', color: '#00A882' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-black/5 bg-[#F0F2F9] p-4">
                <div className="text-lg font-['Outfit'] font-black" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground font-['JetBrains_Mono'] mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4">
            {Object.entries(statusColors).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{
                    background: v,
                    border: k === 'available' ? '1px dashed rgba(255,255,255,0.15)' : 'none',
                  }}
                />
                <span className="text-xs text-muted-foreground font-['JetBrains_Mono'] capitalize">
                  {k}
                </span>
              </div>
            ))}
          </div>

          {/* Visual canvas grid (scaled down) */}
          <div
            className="rounded-2xl border border-black/8 overflow-hidden bg-[#ECF0FA] relative"
            style={{ height: 480 }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div
              className="absolute inset-0"
              style={{ transform: 'scale(0.2)', transformOrigin: '0 0' }}
            >
              {TILES.map((tile) => (
                <div
                  key={tile.id}
                  className="absolute rounded cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    left: tile.x,
                    top: tile.y,
                    width: tile.w,
                    height: tile.h,
                    background: tile.type === 'ad' ? tile.color : statusColors.available,
                    border: tile.type === 'available' ? '2px dashed rgba(255,255,255,0.1)' : 'none',
                    opacity: selectedTile?.id === tile.id ? 1 : 0.85,
                    outline: selectedTile?.id === tile.id ? '3px solid #6C5FE6' : 'none',
                  }}
                  onClick={() => setSelectedTile(tile)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Space detail panel */}
        <div className="w-72 border-l border-black/5 bg-white p-5 overflow-y-auto shrink-0">
          {selectedTile ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <div className="font-['Outfit'] font-bold text-foreground">Space Details</div>
                <button
                  onClick={() => setSelectedTile(null)}
                  className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              </div>
              <div className="space-y-2 mb-5">
                {[
                  ['Space ID', `CHN-${selectedTile.id.toString().padStart(4, '0')}`],
                  ['Status', selectedTile.type === 'ad' ? 'Active' : 'Available'],
                  ['Position', `${selectedTile.x} × ${selectedTile.y}`],
                  ['Dimensions', `${selectedTile.w} × ${selectedTile.h}px`],
                  ...(selectedTile.type === 'ad'
                    ? [
                        ['Advertiser', selectedTile.brand ?? '—'],
                        ['Campaign', selectedTile.adTitle ?? '—'],
                        ['Impressions', selectedTile.views ?? '—'],
                        ['Interactions', selectedTile.clicks ?? '—'],
                      ]
                    : [['List Price', `₹${selectedTile.price}`]]),
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex justify-between py-1.5 border-b border-black/4 last:border-0"
                  >
                    <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                      {k}
                    </span>
                    <span className="text-xs text-foreground font-['Outfit'] font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {selectedTile.type === 'ad' && (
                  <>
                    <button className="w-full py-2 rounded-lg border border-[#E03E4D]/30 text-[#E03E4D] text-xs font-['Outfit'] font-semibold hover:bg-[#E03E4D]/10 transition-all">
                      Suspend Space
                    </button>
                    <button className="w-full py-2 rounded-lg border border-black/8 text-muted-foreground text-xs font-['Outfit'] font-semibold hover:text-foreground transition-all">
                      View Campaign
                    </button>
                  </>
                )}
                {selectedTile.type === 'available' && (
                  <button className="w-full py-2 rounded-lg bg-[#6C5FE6] text-white text-xs font-['Outfit'] font-semibold hover:bg-[#6B5EE6] transition-all">
                    Assign to Campaign
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <Layers size={32} className="text-muted-foreground/30" />
              <div className="text-sm text-muted-foreground font-['Outfit']">
                Click any space on the canvas to view its details
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Navigation Hub ───────────────────────────────────────────────────────────

// ─── Login Screen ─────────────────────────────────────────────────────────────

// Shared Google SVG
function GoogleIcon() {
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
function AuthPanel({
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
function AuthInput({
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
function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
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

function LoginScreen({
  onNavigate,
  onAuthenticated,
}: {
  onNavigate: (s: Screen) => void
  onAuthenticated: (user: AppUser) => void
}) {
  const [view, setView] = useState<LoginView>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // forgot / OTP / reset state
  const [forgotEmail, setForgotEmail] = useState('')
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  const [newPw, setNewPw] = useState('')
  const [confirmNewPw, setConfirmNewPw] = useState('')
  const [showNewPw, setShowNewPw] = useState(false)

  // Countdown for resend
  useEffect(() => {
    if (view !== 'otp') return
    setResendTimer(30)
    const t = setInterval(() => setResendTimer((n) => (n > 0 ? n - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [view])

  const handleLogin = async () => {
    if (!email) {
      setError('Please enter your email address.')
      return
    }
    if (!password) {
      setError('Please enter your password.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const response = await fetch('/api/app-auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to sign in.')
      savePreviewSession(result.previewToken)
      const sessionResponse = await fetch('/api/app-auth/me', {
        credentials: 'include',
        cache: 'no-store',
        headers: previewAuthorizationHeaders(),
      })
      const session = await sessionResponse.json()
      if (!session.user) {
        throw new Error('We could not verify your sign-in session. Please try again.')
      }
      onAuthenticated(session.user)
      onNavigate('dashboard')
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = () => {
    if (!forgotEmail) {
      setError('Please enter your email address.')
      return
    }
    setError(
      'Password reset by email is not available yet. Please contact your account administrator.',
    )
  }

  const handleVerifyOtp = () => {
    const code = otp.join('')
    if (code.length < 6) {
      setOtpError('Please enter the full 6-digit code.')
      return
    }
    setOtpError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setView('reset')
    }, 1000)
  }

  const handleReset = () => {
    if (!newPw || newPw !== confirmNewPw) {
      setError('Passwords do not match.')
      return
    }
    if (newPw.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setView('reset-success')
    }, 1200)
  }

  const leftPanel = (
    <AuthPanel
      gradient="bg-gradient-to-br from-[#6C5FE6] via-[#5548CC] to-[#3D2FAA]"
      title={
        <>
          The world's first
          <br />
          pixel-perfect ad
          <br />
          marketplace.
        </>
      }
      subtitle="Reach millions across cities, neighbourhoods, and digital canvases. Every pixel tells your story."
      stats={[
        ['12K+', 'Advertisers'],
        ['180+', 'Cities'],
        ['₹2.4Cr', 'Ad spend/mo'],
      ]}
    />
  )

  // ── View: Login ──────────────────────────────────────────────────────────────
  if (view === 'login')
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8">
              <PwLogo size="sm" />
            </div>
            <div className="mb-8">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Welcome back
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Sign in to your PixelWorld account
              </p>
            </div>

            <button
              disabled
              title="Google sign-in is not configured"
              className="w-full flex items-center justify-center gap-3 border border-black/10 bg-white rounded-2xl px-5 py-3 text-sm font-['Outfit'] font-semibold text-muted-foreground opacity-60 cursor-not-allowed mb-5"
            >
              <GoogleIcon /> Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-black/8" />
              <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                or sign in with email
              </span>
              <div className="flex-1 h-px bg-black/8" />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-['Inter'] rounded-xl px-4 py-3 mb-4">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <AuthInput
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
              />
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-['Outfit'] font-semibold text-muted-foreground">
                    Password
                  </span>
                  <button
                    onClick={() => {
                      setForgotEmail(email)
                      setError('')
                      setView('forgot')
                    }}
                    className="text-xs text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <AuthInput
                  label=""
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  rightEl={
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye size={15} />
                    </button>
                  }
                />
              </div>
            </div>

            <PrimaryBtn full onClick={handleLogin} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>

            <p className="text-center text-sm text-muted-foreground font-['Inter'] mt-6">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    )

  // ── View: Forgot Password ────────────────────────────────────────────────────
  if (view === 'forgot')
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <button
              onClick={() => {
                setError('')
                setView('login')
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] font-semibold mb-8 transition-colors"
            >
              <ArrowLeft size={15} /> Back to sign in
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#6C5FE6]/12 flex items-center justify-center mb-6">
              <HelpCircle size={26} className="text-[#6C5FE6]" />
            </div>

            <div className="mb-7">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Forgot password?
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Email password recovery is not configured yet. Enter your account email to view the
                available support option.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-['Inter'] rounded-xl px-4 py-3 mb-4">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="mb-6">
              <AuthInput
                label="Email address"
                type="email"
                value={forgotEmail}
                onChange={setForgotEmail}
                placeholder="you@company.com"
              />
            </div>

            <PrimaryBtn full onClick={handleForgot} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Checking…
                </>
              ) : (
                <>
                  Continue <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>

            <div className="mt-6 p-4 rounded-xl bg-[#EDF0F8] border border-black/6">
              <div className="text-xs font-['Outfit'] font-semibold text-foreground mb-1">
                Password recovery
              </div>
              <ol className="space-y-1">
                {[
                  'Email delivery will be added in a later integration',
                  'No reset codes are generated or simulated',
                  'Contact your account administrator for assistance',
                ].map((s, i) => (
                  <li
                    key={i}
                    className="text-xs text-muted-foreground font-['Inter'] flex items-start gap-2"
                  >
                    <span className="w-4 h-4 rounded-full bg-[#6C5FE6]/15 text-[#6C5FE6] text-[9px] font-['JetBrains_Mono'] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    )

  // ── View: OTP Verification ───────────────────────────────────────────────────
  if (view === 'otp')
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <button
              onClick={() => {
                setOtp(Array(6).fill(''))
                setOtpError('')
                setView('forgot')
              }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-['Outfit'] font-semibold mb-8 transition-colors"
            >
              <ArrowLeft size={15} /> Back
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#00A882]/12 flex items-center justify-center mb-6">
              <Inbox size={26} className="text-[#00A882]" />
            </div>

            <div className="mb-2">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Check your email
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                We sent a 6-digit code to{' '}
                <strong className="text-foreground font-semibold">{forgotEmail}</strong>.<br />
                It expires in 10 minutes.
              </p>
            </div>

            <div className="my-8">
              <OtpInput value={otp} onChange={setOtp} />
              {otpError && (
                <p className="text-center text-xs text-red-500 font-['Inter'] mt-3 flex items-center justify-center gap-1">
                  <AlertTriangle size={11} /> {otpError}
                </p>
              )}
            </div>

            <PrimaryBtn
              full
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length < 6}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Verifying…
                </>
              ) : (
                <>
                  Verify Code <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>

            <div className="flex items-center justify-center gap-2 mt-6">
              <span className="text-sm text-muted-foreground font-['Inter']">
                Didn't receive it?
              </span>
              {resendTimer > 0 ? (
                <span className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  onClick={() => {
                    setOtp(Array(6).fill(''))
                    setResendTimer(30)
                  }}
                  className="text-sm text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setForgotEmail('')
                  setView('forgot')
                }}
                className="text-xs text-muted-foreground hover:text-foreground font-['Inter'] hover:underline"
              >
                Wrong email address? Change it
              </button>
            </div>
          </div>
        </div>
      </div>
    )

  // ── View: Reset Password ─────────────────────────────────────────────────────
  if (view === 'reset') {
    const strength =
      newPw.length === 0
        ? 0
        : newPw.length < 6
          ? 1
          : newPw.length < 10
            ? 2
            : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw)
              ? 4
              : 3
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-[#00A882]']
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-[#6C5FE6]/12 flex items-center justify-center mb-6">
              <Shield size={26} className="text-[#6C5FE6]" />
            </div>

            <div className="mb-7">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Set new password
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Your identity is verified. Choose a strong new password.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-['Inter'] rounded-xl px-4 py-3 mb-4">
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <AuthInput
                  label="New password"
                  type={showNewPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={setNewPw}
                  placeholder="Min. 8 characters"
                  rightEl={
                    <button
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye size={15} />
                    </button>
                  }
                />
                {newPw && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-black/8'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-['JetBrains_Mono'] text-muted-foreground w-12 text-right">
                      {strengthLabels[strength]}
                    </span>
                  </div>
                )}
              </div>
              <AuthInput
                label="Confirm new password"
                type="password"
                value={confirmNewPw}
                onChange={setConfirmNewPw}
                placeholder="Re-enter password"
                error={
                  confirmNewPw && confirmNewPw !== newPw ? 'Passwords do not match' : undefined
                }
              />
            </div>

            <div className="rounded-xl bg-[#EDF0F8] p-4 mb-6 space-y-1.5">
              {[
                ['At least 8 characters', newPw.length >= 8],
                ['At least one uppercase letter', /[A-Z]/.test(newPw)],
                ['At least one number', /[0-9]/.test(newPw)],
              ].map(([rule, met]) => (
                <div key={rule as string} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${met ? 'bg-[#00A882]' : 'bg-black/10'}`}
                  >
                    {met && <Check size={9} className="text-white" />}
                  </div>
                  <span
                    className={`text-xs font-['Inter'] transition-colors ${met ? 'text-[#00A882]' : 'text-muted-foreground'}`}
                  >
                    {rule as string}
                  </span>
                </div>
              ))}
            </div>

            <PrimaryBtn full onClick={handleReset} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Updating password…
                </>
              ) : (
                <>
                  Reset Password <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    )
  }

  // ── View: Reset Success ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex">
      {leftPanel}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-[#00A882]/12 flex items-center justify-center mx-auto mb-6">
            <Check size={36} className="text-[#00A882]" />
          </div>
          <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-2">
            Password reset!
          </h1>
          <p className="text-muted-foreground font-['Inter'] text-sm mb-8">
            Your password has been updated successfully. You can now sign in with your new password.
          </p>
          <PrimaryBtn
            full
            onClick={() => {
              setView('login')
              setPassword('')
              setNewPw('')
              setConfirmNewPw('')
              setOtp(Array(6).fill(''))
            }}
          >
            Back to Sign In <ArrowRight size={15} />
          </PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

// ─── Signup Screen ────────────────────────────────────────────────────────────

function SignupScreen({
  onNavigate,
  onAuthenticated,
}: {
  onNavigate: (s: Screen) => void
  onAuthenticated: (user: AppUser) => void
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  // step 1 — credentials
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  // step 2 — profile
  const [role, setRole] = useState<'advertiser' | 'agency' | 'business'>('advertiser')
  const [company, setCompany] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [selectedCats, setSelectedCats] = useState<string[]>([])
  // step 3 — email OTP
  const [emailOtp, setEmailOtp] = useState<string[]>(Array(6).fill(''))
  const [otpError, setOtpError] = useState('')
  const [resendTimer, setResendTimer] = useState(30)
  // step 4 — onboarding
  const [onboardGoal, setOnboardGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [signupError, setSignupError] = useState('')

  const pwStrength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : /[A-Z]/.test(password) && /[0-9]/.test(password)
            ? 4
            : 3
  const pwLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const pwColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-yellow-400', 'bg-[#00A882]']

  useEffect(() => {
    if (step !== 3) return
    setResendTimer(30)
    const t = setInterval(() => setResendTimer((n) => (n > 0 ? n - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [step])

  const handleCreateAccount = async () => {
    setSignupError('')
    setLoading(true)
    try {
      const response = await fetch('/api/app-auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
          accountType: role,
          company,
          preferredCategories: selectedCats,
          agreed,
        }),
        credentials: 'include',
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Unable to create account.')
      savePreviewSession(result.previewToken)
      const sessionResponse = await fetch('/api/app-auth/me', {
        credentials: 'include',
        cache: 'no-store',
        headers: previewAuthorizationHeaders(),
      })
      const session = await sessionResponse.json()
      if (!session.user) {
        throw new Error('We could not verify your sign-in session. Please try again.')
      }
      onAuthenticated(session.user)
      setStep(4)
    } catch (createError) {
      setSignupError(
        createError instanceof Error ? createError.message : 'Unable to create account.',
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmail = () => {
    if (emailOtp.join('').length < 6) {
      setOtpError('Please enter the full 6-digit code.')
      return
    }
    setOtpError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(4)
    }, 1000)
  }

  const handleFinish = () => {
    onNavigate('dashboard')
  }

  const leftPanel = (
    <AuthPanel
      gradient="bg-gradient-to-br from-[#00A882] via-[#008F6E] to-[#006B52]"
      title={
        <>
          Start advertising
          <br />
          in minutes.
        </>
      }
      subtitle="Join thousands of businesses already reaching their audience on PixelWorld's interactive canvas."
    />
  )

  const STEP_LABELS = ['Account details', 'Profile & role', 'Account created', 'Get started']

  const StepIndicator = () => (
    <div className="flex items-center gap-1.5 mb-8">
      {STEP_LABELS.map((label, i) => {
        const s = i + 1
        const done = step > s
        const active = step === s
        return (
          <React.Fragment key={s}>
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-['Outfit'] font-bold transition-all ${done ? 'bg-[#00A882] text-white' : active ? 'bg-[#6C5FE6] text-white' : 'bg-[#EDF0F8] text-muted-foreground'}`}
              >
                {done ? <Check size={11} /> : s}
              </div>
              <span
                className={`text-[11px] font-['Outfit'] font-semibold hidden sm:block ${active ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`flex-1 h-px min-w-[12px] transition-colors ${step > s ? 'bg-[#00A882]' : 'bg-black/8'}`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  // ── Step 1: Credentials ──────────────────────────────────────────────────────
  if (step === 1)
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6">
              <PwLogo size="sm" />
            </div>
            <StepIndicator />
            <div className="mb-6">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Create account
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Start your PixelWorld journey
              </p>
            </div>

            <button
              disabled
              title="Google sign-up is not configured"
              className="w-full flex items-center justify-center gap-3 border border-black/10 bg-white rounded-2xl px-5 py-3 text-sm font-['Outfit'] font-semibold text-muted-foreground opacity-60 cursor-not-allowed mb-5"
            >
              <GoogleIcon /> Sign up with Google
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-black/8" />
              <span className="text-xs text-muted-foreground font-['JetBrains_Mono']">
                or with email
              </span>
              <div className="flex-1 h-px bg-black/8" />
            </div>

            <div className="space-y-3.5 mb-6">
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ['First name', firstName, setFirstName],
                    ['Last name', lastName, setLastName],
                  ] as const
                ).map(([lbl, val, set]) => (
                  <div key={lbl}>
                    <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-1.5">
                      {lbl}
                    </label>
                    <input
                      value={val}
                      onChange={(e) => set(e.target.value)}
                      placeholder={lbl}
                      className="w-full bg-[#EDF0F8] border border-black/8 rounded-xl px-3.5 py-2.5 text-sm font-['Outfit'] text-foreground placeholder-muted-foreground focus:outline-none focus:border-[#6C5FE6]/50 focus:bg-white transition-colors"
                    />
                  </div>
                ))}
              </div>
              <AuthInput
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@company.com"
              />
              <AuthInput
                label="Phone number"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="+91 98765 43210"
              />
              <div>
                <AuthInput
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Min. 8 characters"
                  rightEl={
                    <button
                      onClick={() => setShowPw(!showPw)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Eye size={15} />
                    </button>
                  }
                />
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${i <= pwStrength ? pwColors[pwStrength] : 'bg-black/8'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-['JetBrains_Mono'] text-muted-foreground">
                      {pwLabels[pwStrength]}
                    </span>
                  </div>
                )}
              </div>
              <AuthInput
                label="Confirm password"
                type="password"
                value={confirmPw}
                onChange={setConfirmPw}
                placeholder="Re-enter password"
                error={confirmPw && confirmPw !== password ? 'Passwords do not match' : undefined}
              />
            </div>

            <PrimaryBtn
              full
              onClick={() => setStep(2)}
              disabled={!firstName || !email || !password || password !== confirmPw}
            >
              Continue <ArrowRight size={15} />
            </PrimaryBtn>
            <p className="text-center text-sm text-muted-foreground font-['Inter'] mt-5">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    )

  // ── Step 2: Profile & Role ───────────────────────────────────────────────────
  if (step === 2)
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6">
              <PwLogo size="sm" />
            </div>
            <StepIndicator />
            <div className="mb-6">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Your profile
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                Tell us how you'll use PixelWorld
              </p>
            </div>

            <div className="space-y-5 mb-6">
              <div>
                <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                  Account type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'advertiser', label: 'Individual', emoji: '👤', desc: 'Personal ads' },
                    { value: 'business', label: 'Business', emoji: '🏢', desc: 'Company brand' },
                    { value: 'agency', label: 'Agency', emoji: '🏛️', desc: 'Manage clients' },
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRole(r.value as typeof role)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${role === r.value ? 'border-[#6C5FE6] bg-[#6C5FE6]/8' : 'border-black/8 bg-card hover:border-[#6C5FE6]/30'}`}
                    >
                      <div className="text-xl mb-1">{r.emoji}</div>
                      <div
                        className={`text-xs font-['Outfit'] font-bold ${role === r.value ? 'text-[#6C5FE6]' : 'text-foreground'}`}
                      >
                        {r.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-['Inter']">
                        {r.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              {(role === 'business' || role === 'agency') && (
                <AuthInput
                  label={role === 'agency' ? 'Agency name' : 'Company name'}
                  value={company}
                  onChange={setCompany}
                  placeholder="e.g. Acme Advertising"
                />
              )}
              <div>
                <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                  Preferred ad categories{' '}
                  <span className="text-muted-foreground font-normal">(pick any)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Food & Dining',
                    'Real Estate',
                    'Fashion',
                    'Electronics',
                    'Jobs',
                    'Travel',
                    'Healthcare',
                    'Fintech',
                    'Entertainment',
                    'Automotive',
                  ].map((cat) => {
                    const on = selectedCats.includes(cat)
                    return (
                      <button
                        key={cat}
                        onClick={() =>
                          setSelectedCats(
                            on ? selectedCats.filter((c) => c !== cat) : [...selectedCats, cat],
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg border text-xs font-['Outfit'] font-semibold transition-all ${on ? 'border-[#6C5FE6] bg-[#6C5FE6]/10 text-[#6C5FE6]' : 'border-black/8 bg-[#EDF0F8] text-muted-foreground hover:border-[#6C5FE6]/30 hover:text-[#6C5FE6]'}`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>
              <label
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => setAgreed(!agreed)}
              >
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${agreed ? 'bg-[#6C5FE6] border-[#6C5FE6]' : 'border-black/20 bg-white group-hover:border-[#6C5FE6]/50'}`}
                >
                  {agreed && <Check size={11} className="text-white" />}
                </div>
                <span className="text-xs text-muted-foreground font-['Inter'] leading-relaxed">
                  I agree to PixelWorld's{' '}
                  <span className="text-[#6C5FE6] font-semibold">Terms of Service</span> and{' '}
                  <span className="text-[#6C5FE6] font-semibold">Privacy Policy</span>
                </span>
              </label>
            </div>

            {signupError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-['Inter'] rounded-xl px-4 py-3 mb-4">
                <AlertTriangle size={14} /> {signupError}
              </div>
            )}
            <div className="flex gap-3">
              <GhostBtn onClick={() => setStep(1)}>
                <ChevronLeft size={15} /> Back
              </GhostBtn>
              <div className="flex-1">
                <PrimaryBtn full onClick={handleCreateAccount} disabled={!agreed || loading}>
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" /> Creating account…
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight size={15} />
                    </>
                  )}
                </PrimaryBtn>
              </div>
            </div>
          </div>
        </div>
      </div>
    )

  // ── Step 3: Verify Email ─────────────────────────────────────────────────────
  if (step === 3)
    return (
      <div className="min-h-screen bg-background flex">
        {leftPanel}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6">
              <PwLogo size="sm" />
            </div>
            <StepIndicator />

            <div className="w-14 h-14 rounded-2xl bg-[#00A882]/12 flex items-center justify-center mb-6">
              <Inbox size={26} className="text-[#00A882]" />
            </div>
            <div className="mb-2">
              <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
                Verify your email
              </h1>
              <p className="text-muted-foreground font-['Inter'] text-sm">
                We sent a 6-digit code to <strong className="text-foreground">{email}</strong>.
                Enter it below to activate your account.
              </p>
            </div>

            <div className="my-8">
              <OtpInput value={emailOtp} onChange={setEmailOtp} />
              {otpError && (
                <p className="text-center text-xs text-red-500 font-['Inter'] mt-3 flex items-center justify-center gap-1">
                  <AlertTriangle size={11} /> {otpError}
                </p>
              )}
            </div>

            <PrimaryBtn
              full
              onClick={handleVerifyEmail}
              disabled={loading || emailOtp.join('').length < 6}
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Verifying…
                </>
              ) : (
                <>
                  Verify & Continue <ArrowRight size={15} />
                </>
              )}
            </PrimaryBtn>

            <div className="flex items-center justify-center gap-2 mt-5">
              <span className="text-sm text-muted-foreground font-['Inter']">Didn't get it?</span>
              {resendTimer > 0 ? (
                <span className="text-sm text-muted-foreground font-['JetBrains_Mono']">
                  Resend in {resendTimer}s
                </span>
              ) : (
                <button
                  onClick={() => {
                    setEmailOtp(Array(6).fill(''))
                    setResendTimer(30)
                  }}
                  className="text-sm text-[#6C5FE6] font-['Outfit'] font-semibold hover:underline"
                >
                  Resend code
                </button>
              )}
            </div>

            <div className="mt-3 text-center">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-muted-foreground hover:text-foreground font-['Inter'] hover:underline"
              >
                Wrong email? Go back and change it
              </button>
            </div>
          </div>
        </div>
      </div>
    )

  // ── Step 4: Onboarding ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex">
      {leftPanel}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6">
            <PwLogo size="sm" />
          </div>
          <StepIndicator />

          <div className="mb-7">
            <div className="text-3xl mb-4">🎉</div>
            <h1 className="font-['Outfit'] font-black text-3xl text-foreground mb-1">
              Welcome, {firstName}!
            </h1>
            <p className="text-muted-foreground font-['Inter'] text-sm">
              Your account is ready. Let's personalise your experience to get you started fast.
            </p>
          </div>

          <div className="space-y-4 mb-7">
            <div>
              <label className="block text-xs font-['Outfit'] font-semibold text-muted-foreground mb-2">
                What's your primary goal?
              </label>
              <div className="space-y-2">
                {[
                  { id: 'brand', label: 'Build brand awareness', emoji: '📣' },
                  { id: 'leads', label: 'Generate leads or enquiries', emoji: '🎯' },
                  { id: 'sales', label: 'Drive direct sales', emoji: '🛍️' },
                  { id: 'local', label: 'Reach a local neighbourhood', emoji: '📍' },
                  { id: 'explore', label: 'Just exploring the platform', emoji: '🔭' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setOnboardGoal(g.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${onboardGoal === g.id ? 'border-[#6C5FE6] bg-[#6C5FE6]/8' : 'border-black/8 bg-card hover:border-[#6C5FE6]/20'}`}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <span
                      className={`text-sm font-['Outfit'] font-semibold ${onboardGoal === g.id ? 'text-[#6C5FE6]' : 'text-foreground'}`}
                    >
                      {g.label}
                    </span>
                    {onboardGoal === g.id && <Check size={14} className="text-[#6C5FE6] ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-[#6C5FE6]/6 border border-[#6C5FE6]/15 p-4">
              <div className="text-xs font-['Outfit'] font-bold text-[#6C5FE6] mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> What's waiting for you
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Explore the canvas', 'Browse live ads across cities'],
                  ['Book your first space', 'Pick a spot that fits your budget'],
                  ['Launch in 24 hrs', 'Ads go live after quick review'],
                  ['Track performance', 'Live clicks, views, and CTR'],
                ].map(([t, d]) => (
                  <div key={t} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#6C5FE6]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={9} className="text-[#6C5FE6]" />
                    </div>
                    <div>
                      <div className="text-xs font-['Outfit'] font-semibold text-foreground">
                        {t}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-['Inter']">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PrimaryBtn full onClick={handleFinish} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" /> Setting up your dashboard…
              </>
            ) : (
              <>
                Go to Dashboard <ArrowRight size={15} />
              </>
            )}
          </PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

// ─── User Profile + UAM Screen ────────────────────────────────────────────────

const UAM_ROLES = [
  {
    id: 'owner',
    label: 'Owner',
    color: 'bg-[#6C5FE6]/15 text-[#6C5FE6]',
    desc: 'Full access to all features, billing, and team management',
  },
  {
    id: 'manager',
    label: 'Campaign Mgr',
    color: 'bg-[#00A882]/15 text-[#00A882]',
    desc: 'Create and manage ad campaigns; no billing or team access',
  },
  {
    id: 'analyst',
    label: 'Analyst',
    color: 'bg-amber-100 text-amber-700',
    desc: 'View-only access to analytics and reports',
  },
  {
    id: 'billing',
    label: 'Billing Admin',
    color: 'bg-blue-100 text-blue-700',
    desc: 'Manage payments, invoices, and billing details only',
  },
]

const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Arjun Sharma',
    email: 'arjun@acmecorp.in',
    role: 'owner',
    avatar: 'AS',
    status: 'active',
    joined: 'Jan 2025',
    lastActive: 'Just now',
  },
  {
    id: 2,
    name: 'Priya Nair',
    email: 'priya@acmecorp.in',
    role: 'manager',
    avatar: 'PN',
    status: 'active',
    joined: 'Mar 2025',
    lastActive: '2h ago',
  },
  {
    id: 3,
    name: 'Karthik Rajan',
    email: 'karthik@acmecorp.in',
    role: 'analyst',
    avatar: 'KR',
    status: 'active',
    joined: 'May 2025',
    lastActive: 'Yesterday',
  },
  {
    id: 4,
    name: 'Sneha Iyer',
    email: 'sneha@acmecorp.in',
    role: 'manager',
    avatar: 'SI',
    status: 'invited',
    joined: '—',
    lastActive: 'Pending',
  },
  {
    id: 5,
    name: 'Rahul Mehta',
    email: 'rahul@acmecorp.in',
    role: 'billing',
    avatar: 'RM',
    status: 'active',
    joined: 'Jun 2025',
    lastActive: '3d ago',
  },
]

function UserProfileScreen({
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

function NavHub({ onNavigate }: { onNavigate: (s: Screen) => void }) {
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

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App({ initialUser }: { initialUser: AppUser | null }) {
  const [screen, setScreen] = useState<Screen | 'hub'>('hub')
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
        .then((result) => setCurrentUser(result.user ?? null))
        .catch(() => setCurrentUser(null))
    }
  }, [])

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

  if (screen === 'hub') return <NavHub onNavigate={nav} />

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
