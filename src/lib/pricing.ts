export type SizeCategory = 'small' | 'medium' | 'large'

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

export const SIZE_CONFIGS: Record<SizeCategory, { label: string; dims: string; width: number; height: number; baseDaily: number; mult: number }> = {
  small: { label: 'Small', dims: '100 × 100 px', width: 100, height: 100, baseDaily: 50, mult: 1.0 },
  medium: { label: 'Medium', dims: '200 × 200 px', width: 200, height: 200, baseDaily: 150, mult: 2.0 },
  large: { label: 'Large', dims: '400 × 200 px', width: 400, height: 200, baseDaily: 300, mult: 3.5 },
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
  const sizeCategory: SizeCategory =
    options.sizeCategory === 'small' || options.sizeCategory === 'large'
      ? options.sizeCategory
      : 'medium'

  const selectedConfig = SIZE_CONFIGS[sizeCategory]
  const dims = selectedConfig.dims
  const basePriceDaily = selectedConfig.baseDaily

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
