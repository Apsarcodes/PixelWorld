import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { getPayloadClient } from '@/lib/payload'
import { TILES, normalizeCategory } from '@/data/mock-data'
import type { CanvasTile } from '@/types/pixelworld'

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`inventory_slots:${ip}`, { limit: 120, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') || 'Chennai'
    const category = searchParams.get('category') || 'All'
    const statusFilter = searchParams.get('status') || 'all'

    let tiles: CanvasTile[] = [...TILES]

    try {
      const payload = await getPayloadClient()
      const dbSlots = await payload.find({
        collection: 'inventory-slots' as any,
        limit: 200,
        depth: 1,
      })

      if (dbSlots.docs.length > 0) {
        tiles = dbSlots.docs.map((doc: any) => {
          const isAd = doc.status === 'occupied' || Boolean(doc.activeCampaign)
          return {
            id: doc.id,
            x: doc.x,
            y: doc.y,
            w: doc.width,
            h: doc.height,
            type: isAd ? ('ad' as const) : ('available' as const),
            brand: doc.brandName || (isAd ? 'Sponsored' : undefined),
            tagline: doc.tagline,
            color: doc.color || '#6C5FE6',
            textColor: '#fff',
            emoji: doc.emoji || (isAd ? '📢' : undefined),
            views: doc.views || '10K',
            clicks: doc.clicks || '500',
            category: doc.category || 'General',
            adTitle: doc.brandName ? `${doc.brandName} Promotion` : undefined,
            location: `${city}, India`,
            phone: doc.phone,
            website: doc.website,
            price: doc.basePriceDaily || 299,
            size: doc.sizeCategory || 'medium',
          }
        })
      }
    } catch {
      // Fall back to canonical tiles dataset
    }

    // Apply category filter
    if (category !== 'All') {
      tiles = tiles.filter((t) => {
        if (t.type !== 'ad') return true
        return normalizeCategory(t.category) === category
      })
    }

    // Apply status filter
    if (statusFilter === 'available') {
      tiles = tiles.filter((t) => t.type === 'available')
    } else if (statusFilter === 'ad') {
      tiles = tiles.filter((t) => t.type === 'ad')
    }

    const totalAds = tiles.filter((t) => t.type === 'ad').length
    const totalAvailable = tiles.filter((t) => t.type === 'available').length

    return Response.json({
      ok: true,
      city,
      tiles,
      stats: {
        total: tiles.length,
        ads: totalAds,
        available: totalAvailable,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch inventory slots'
    return Response.json({ error: message }, { status: 500 })
  }
}
