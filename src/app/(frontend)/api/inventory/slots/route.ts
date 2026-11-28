import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { getPayloadClient } from '@/lib/payload'
import type { CanvasTile } from '@/types/pixelworld'

function generateAvailableGrid(city: string): CanvasTile[] {
  const slots: CanvasTile[] = []
  let id = 1
  // Structured standard layout of Small (100x100), Medium (200x200), and Large (400x200) formats
  const configs: Array<{ w: number; h: number; size: 'small' | 'medium' | 'large'; price: number }> = [
    { w: 200, h: 200, size: 'medium', price: 150 },
    { w: 400, h: 200, size: 'large', price: 300 },
    { w: 100, h: 100, size: 'small', price: 50 },
    { w: 200, h: 200, size: 'medium', price: 150 },
  ]

  for (let r = 0; r < 6; r++) {
    let currentX = 80
    const rowY = r * 260 + 80
    for (let c = 0; c < 5; c++) {
      const cfg = configs[(r + c) % configs.length]
      slots.push({
        id: id++,
        x: currentX,
        y: rowY,
        w: cfg.w,
        h: cfg.h,
        type: 'available',
        price: cfg.price,
        size: cfg.size,
        location: `${city}, India`,
        category: 'General',
      })
      currentX += cfg.w + 40
    }
  }
  return slots
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`inventory_slots:${ip}`, { limit: 120, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city') || 'Mumbai'
    const category = searchParams.get('category') || 'All'
    const statusFilter = searchParams.get('status') || 'all'

    let tiles: CanvasTile[] = generateAvailableGrid(city)

    try {
      const payload = await getPayloadClient()

      // 1. Fetch real inventory slots from DB
      const dbSlots = await payload.find({
        collection: 'inventory-slots' as any,
        limit: 200,
        depth: 1,
      })

      if (dbSlots.docs.length > 0) {
        tiles = dbSlots.docs.map((doc: any, index: number) => {
          const campaign = doc.activeCampaign && typeof doc.activeCampaign === 'object' ? doc.activeCampaign : null
          const isRealPublishedAd = campaign && campaign.status === 'published'

          return {
            id: Number(doc.id) || index + 1,
            x: doc.x ?? (index % 10) * 260 + 80,
            y: doc.y ?? Math.floor(index / 10) * 220 + 80,
            w: doc.width ?? 180,
            h: doc.height ?? 160,
            type: isRealPublishedAd ? ('ad' as const) : ('available' as const),
            brand: isRealPublishedAd ? (campaign.brandName || campaign.name) : undefined,
            tagline: isRealPublishedAd ? (campaign.description || campaign.callToAction) : undefined,
            color: isRealPublishedAd ? '#6C5FE6' : undefined,
            textColor: '#fff',
            emoji: isRealPublishedAd ? '📢' : undefined,
            views: isRealPublishedAd ? (doc.views || '12.4K') : '0',
            clicks: isRealPublishedAd ? (doc.clicks || '840') : '0',
            category: doc.category || 'General',
            adTitle: isRealPublishedAd ? (campaign.headline || campaign.name) : undefined,
            location: `${city}, India`,
            phone: doc.phone,
            website: doc.website,
            price: doc.basePriceDaily || 299,
            size: doc.sizeCategory || 'medium',
          }
        })
      }

      // 2. Fetch real active campaigns and overlay onto the first slots
      const liveCampaigns = await payload.find({
        collection: 'campaigns',
        where: { status: { equals: 'published' } },
        limit: 20,
        depth: 1,
      })

      if (liveCampaigns.docs.length > 0) {
        liveCampaigns.docs.forEach((campaign: any, idx: number) => {
          if (tiles[idx]) {
            tiles[idx] = {
              ...tiles[idx],
              type: 'ad',
              brand: campaign.brandName || campaign.name,
              adTitle: campaign.headline || campaign.name,
              tagline: campaign.description || campaign.callToAction,
              color: '#6C5FE6',
              textColor: '#fff',
              emoji: '🚀',
              views: '12.4K',
              clicks: '840',
              category: 'General',
            }
          }
        })
      }
    } catch {
      // Keep dynamic clean available grid
    }

    // Apply category filter
    let filtered = tiles
    if (category !== 'All') {
      filtered = filtered.filter(
        (t) => t.type === 'available' || t.category?.toLowerCase() === category.toLowerCase(),
      )
    }

    // Apply status filter
    if (statusFilter === 'available') {
      filtered = filtered.filter((t) => t.type === 'available')
    } else if (statusFilter === 'active' || statusFilter === 'ad') {
      filtered = filtered.filter((t) => t.type === 'ad')
    }

    return Response.json({
      ok: true,
      city,
      tiles: filtered,
      total: filtered.length,
      adCount: filtered.filter((t) => t.type === 'ad').length,
      availableCount: filtered.filter((t) => t.type === 'available').length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load inventory slots'
    return Response.json({ error: message }, { status: 500 })
  }
}
