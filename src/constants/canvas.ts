export const CELL = 80
export const CANVAS_W = 3200
export const CANVAS_H = 2400

export const FILTER_CATEGORIES = [
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

export function normalizeCategory(cat?: string): string {
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
  if (
    c.includes('fintech') ||
    c.includes('banking') ||
    c.includes('payment') ||
    c.includes('invest') ||
    c.includes('insurance')
  )
    return 'Fintech'
  if (
    c.includes('travel') ||
    c.includes('hotel') ||
    c.includes('airline') ||
    c.includes('flight') ||
    c.includes('tourism')
  )
    return 'Travel'
  if (c.includes('auto') || c.includes('car') || c.includes('ev ') || c.includes('bike'))
    return 'Automotive'
  if (
    c.includes('health') ||
    c.includes('pharma') ||
    c.includes('hospital') ||
    c.includes('diagnost')
  )
    return 'Healthcare'
  if (
    c.includes('entertain') ||
    c.includes('ott') ||
    c.includes('stream') ||
    c.includes('movie') ||
    c.includes('gaming')
  )
    return 'Entertainment'
  if (c.includes('fashion') || c.includes('apparel') || c.includes('cloth') || c.includes('eyewear'))
    return 'Fashion'
  if (c.includes('electron') || c.includes('gadget') || c.includes('laptop') || c.includes('mobile'))
    return 'Electronics'
  if (c.includes('commerce') || c.includes('retail') || c.includes('shop')) return 'E-Commerce'
  return 'Other'
}
