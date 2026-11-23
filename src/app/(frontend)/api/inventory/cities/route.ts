import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { getPayloadClient } from '@/lib/payload'

const DEFAULT_INDIAN_CITIES = [
  { name: 'Chennai', icon: '🏛️', state: 'Tamil Nadu' },
  { name: 'Mumbai', icon: '🌊', state: 'Maharashtra' },
  { name: 'Bangalore', icon: '🌳', state: 'Karnataka' },
  { name: 'Delhi', icon: '🕌', state: 'Delhi NCR' },
  { name: 'Hyderabad', icon: '💎', state: 'Telangana' },
  { name: 'Kolkata', icon: '🌉', state: 'West Bengal' },
  { name: 'Ahmedabad', icon: '🪁', state: 'Gujarat' },
  { name: 'Pune', icon: '🏔️', state: 'Maharashtra' },
]

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`cities:${ip}`, { limit: 120, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('search') || '').toLowerCase().trim()

    let cities = DEFAULT_INDIAN_CITIES.map((c) => ({
      name: c.name,
      slug: c.name.toLowerCase().replace(/\s+/g, '-'),
      icon: c.icon,
      ads: 0,
      available: 100,
      occupancy: 0,
      country: 'India',
    }))

    try {
      const payload = await getPayloadClient()
      const dbCities = await payload.find({
        collection: 'cities' as any,
        limit: 50,
        where: {
          active: { equals: true },
        },
      })

      if (dbCities.docs.length > 0) {
        cities = dbCities.docs.map((doc: any) => {
          const total = doc.totalSpaces || 100
          const occupied = doc.occupiedSpaces || 0
          const available = Math.max(0, total - occupied)
          const occupancy = Math.round((occupied / (total || 1)) * 100)
          return {
            name: doc.name,
            slug: doc.slug,
            icon: doc.icon || '🏛️',
            ads: occupied,
            available,
            occupancy,
            country: doc.country || 'India',
          }
        })
      }
    } catch {
      // Fallback to fresh cities catalog
    }

    if (search) {
      cities = cities.filter(
        (c) => c.name.toLowerCase().includes(search) || c.slug.toLowerCase().includes(search),
      )
    }

    return Response.json({
      ok: true,
      cities,
      total: cities.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load cities'
    return Response.json({ error: message }, { status: 500 })
  }
}
