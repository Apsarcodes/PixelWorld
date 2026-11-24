export type SizeCategory = 'small' | 'medium' | 'large' | 'billboard' | 'custom'

export interface PricingOptions {
  city?: string
  sizeCategory?: SizeCategory
  width?: number
  height?: number
  durationDays?: number
  addons?: {
    whatsappCta?: boolean
    verifiedBadge?: boolean
    priorityPlacement?: boolean
    analyticsPro?: boolean
  }
}

export interface PricingBreakdown {
  city: string
  cityTier: 'Tier 1' | 'Tier 1.5' | 'Tier 2'
  cityMultiplier: number
  sizeCategory: SizeCategory
  dimensions: string
  durationDays: number
  durationDiscountPct: number
  basePriceDaily: number
  spaceRentalSubtotal: number
  addonsTotal: number
  activeAddons: Array<{ id: string; name: string; price: number }>
  subtotal: number
  gstRate: number
  gstAmount: number
  totalAmount: number
}

const CITY_TIERS: Record<string, { tier: 'Tier 1' | 'Tier 1.5' | 'Tier 2'; mult: number }> = {
  mumbai: { tier: 'Tier 1', mult: 1.4 },
  delhi: { tier: 'Tier 1', mult: 1.4 },
  bangalore: { tier: 'Tier 1', mult: 1.35 },
  bengaluru: { tier: 'Tier 1', mult: 1.35 },
  chennai: { tier: 'Tier 1.5', mult: 1.2 },
  hyderabad: { tier: 'Tier 1.5', mult: 1.2 },
  pune: { tier: 'Tier 1.5', mult: 1.15 },
  kolkata: { tier: 'Tier 2', mult: 1.0 },
  ahmedabad: { tier: 'Tier 2', mult: 1.0 },
  jaipur: { tier: 'Tier 2', mult: 1.0 },
  kochi: { tier: 'Tier 2', mult: 1.0 },
  lucknow: { tier: 'Tier 2', mult: 1.0 },
  chandigarh: { tier: 'Tier 2', mult: 1.0 },
}

const SIZE_CONFIGS: Record<Exclude<SizeCategory, 'custom'>, { label: string; dims: string; baseDaily: number; mult: number }> = {
  small: { label: 'Small', dims: '50 × 50 px', baseDaily: 25, mult: 0.6 },
  medium: { label: 'Medium', dims: '100 × 100 px', baseDaily: 40, mult: 1.0 },
  large: { label: 'Large', dims: '200 × 200 px', baseDaily: 80, mult: 2.0 },
  billboard: { label: 'Billboard', dims: '300 × 200 px', baseDaily: 140, mult: 3.5 },
}

const ADDON_PRICING: Record<string, { name: string; price: number }> = {
  whatsappCta: { name: 'Direct WhatsApp & Call Button', price: 99 },
  verifiedBadge: { name: 'Verified Advertiser Blue Badge', price: 149 },
  priorityPlacement: { name: 'Priority Canvas Hotspot Placement', price: 199 },
  analyticsPro: { name: 'Real-Time Analytics Pro & Heatmaps', price: 99 },
}

export function calculateDynamicPrice(options: PricingOptions = {}): PricingBreakdown {
  const cityKey = (options.city || 'chennai').toLowerCase().trim()
  const cityInfo = CITY_TIERS[cityKey] || { tier: 'Tier 2' as const, mult: 1.0 }

  const durationDays = Math.max(1, Math.min(365, Number(options.durationDays) || 30))

  // Duration Discount
  let durationDiscountPct = 0
  if (durationDays >= 90) {
    durationDiscountPct = 25
  } else if (durationDays >= 60) {
    durationDiscountPct = 20
  } else if (durationDays >= 30) {
    durationDiscountPct = 15
  } else if (durationDays >= 14) {
    durationDiscountPct = 5
  }

  // Size base
  let sizeCategory: SizeCategory = options.sizeCategory || 'medium'
  let dims = '100 × 100 px'
  let basePriceDaily = 40

  if (sizeCategory === 'custom' && options.width && options.height) {
    const area = options.width * options.height
    basePriceDaily = Math.max(20, Math.round((area / 10000) * 35))
    dims = `${options.width} × ${options.height} px`
  } else if (sizeCategory !== 'custom' && SIZE_CONFIGS[sizeCategory]) {
    basePriceDaily = SIZE_CONFIGS[sizeCategory].baseDaily
    dims = SIZE_CONFIGS[sizeCategory].dims
  }

  // Adjust daily rate for city tier
  const effectiveDailyRate = Math.round(basePriceDaily * cityInfo.mult)
  const rawRentalTotal = effectiveDailyRate * durationDays
  const discountAmount = Math.round(rawRentalTotal * (durationDiscountPct / 100))
  const spaceRentalSubtotal = Math.max(99, rawRentalTotal - discountAmount)

  // Addons
  const activeAddons: Array<{ id: string; name: string; price: number }> = []
  let addonsTotal = 0

  if (options.addons) {
    for (const [key, enabled] of Object.entries(options.addons)) {
      if (enabled && ADDON_PRICING[key]) {
        activeAddons.push({
          id: key,
          name: ADDON_PRICING[key].name,
          price: ADDON_PRICING[key].price,
        })
        addonsTotal += ADDON_PRICING[key].price
      }
    }
  }

  const subtotal = spaceRentalSubtotal + addonsTotal
  const gstRate = 0.18
  const gstAmount = Math.round(subtotal * gstRate)
  const totalAmount = subtotal + gstAmount

  return {
    city: options.city || 'Chennai',
    cityTier: cityInfo.tier,
    cityMultiplier: cityInfo.mult,
    sizeCategory,
    dimensions: dims,
    durationDays,
    durationDiscountPct,
    basePriceDaily: effectiveDailyRate,
    spaceRentalSubtotal,
    addonsTotal,
    activeAddons,
    subtotal,
    gstRate,
    gstAmount,
    totalAmount,
  }
}
