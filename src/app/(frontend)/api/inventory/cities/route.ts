import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { getPayloadClient } from '@/lib/payload'
import { INDIA_CITIES } from '@/data/mock-data'

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`cities:${ip}`, { limit: 120, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('search') || '').toLowerCase().trim()

    let cities = INDIA_CITIES.map((c) => ({
      name: c.name,
      slug: c.name.toLowerCase().replace(/\s+/g, '-'),
      icon: c.icon,
      ads: c.ads,
      available: c.available,
      occupancy: c.occupancy,
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
        cities = dbCities.docs.map((doc: any) => ({
          name: doc.name,
          slug: doc.slug,
          icon: doc.icon || '🏛️',
          ads: (doc.totalSpaces || 100) - (doc.occupiedSpaces || 0),
          available: Math.max(0, 100 - (doc.occupancyRate || 0)),
          occupancy: doc.occupancyRate || 0,
          country: doc.country || 'India',
        }))
      }
    } catch {
      // Graceful fallback to canonical dataset when DB collection is cold/unseeded
    }

    if (search) {
      cities = cities.filter((c) =>
        c.name.toLowerCase().includes(search) || c.slug.toLowerCase().includes(search)
      )
    }

    return Response.json({
      ok: true,
      cities,
      total: cities.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch cities'
    return Response.json({ error: message }, { status: 500 })
  }
}
