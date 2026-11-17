import { getPayload } from 'payload'
import config from '../payload.config'
import { INDIA_CITIES, TILES } from '../data/mock-data'

export async function seedDatabase() {
  const payload = await getPayload({ config })
  console.log('🌱 Starting PixelWorld database seeding...')

  // 1. Seed Cities
  const cityMap = new Map<string, string | number>()
  for (const city of INDIA_CITIES) {
    const slug = city.name.toLowerCase().replace(/\s+/g, '-')
    const existing = await payload.find({
      collection: 'cities' as any,
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      const doc = await payload.create({
        collection: 'cities' as any,
        data: {
          name: city.name,
          slug,
          state: city.name === 'Chennai' ? 'Tamil Nadu' : city.name === 'Mumbai' ? 'Maharashtra' : city.name === 'Bangalore' ? 'Karnataka' : 'India',
          country: 'India',
          icon: city.icon,
          totalSpaces: 100,
          occupiedSpaces: Math.round(100 * (city.occupancy / 100)),
          occupancyRate: city.occupancy,
          basePriceDaily: 299,
          active: true,
        },
      })
      cityMap.set(slug, doc.id)
      console.log(`  ✓ Seeded city: ${city.name}`)
    } else {
      cityMap.set(slug, existing.docs[0].id)
    }
  }

  // 2. Seed Default Location for Chennai
  const chennaiId = cityMap.get('chennai')
  if (chennaiId) {
    const existingLoc = await payload.find({
      collection: 'locations' as any,
      where: { slug: { equals: 'chennai-main-canvas' } },
      limit: 1,
    })
    let locationId = existingLoc.docs[0]?.id
    if (!locationId) {
      const loc = await payload.create({
        collection: 'locations' as any,
        data: {
          name: 'Chennai Main Canvas',
          slug: 'chennai-main-canvas',
          city: chennaiId,
          canvasWidth: 3200,
          canvasHeight: 2400,
          gridCellSize: 80,
          address: 'Chennai, Tamil Nadu, India',
          active: true,
        },
      })
      locationId = loc.id
      console.log('  ✓ Seeded location: Chennai Main Canvas')
    }

    // 3. Seed Slots
    for (const tile of TILES.slice(0, 40)) {
      const slotId = `CHN-${tile.id.toString().padStart(4, '0')}`
      const existingSlot = await payload.find({
        collection: 'inventory-slots' as any,
        where: { slotIdentifier: { equals: slotId } },
        limit: 1,
      })

      if (existingSlot.docs.length === 0) {
        await payload.create({
          collection: 'inventory-slots' as any,
          data: {
            slotIdentifier: slotId,
            city: chennaiId,
            location: locationId,
            x: tile.x,
            y: tile.y,
            width: tile.w,
            height: tile.h,
            sizeCategory: (tile.size as any) || 'medium',
            status: tile.type === 'ad' ? 'occupied' : 'available',
            basePriceDaily: tile.price || 299,
            brandName: tile.brand,
            tagline: tile.tagline,
            category: tile.category,
            emoji: tile.emoji,
            color: tile.color,
            views: tile.views,
            clicks: tile.clicks,
            website: tile.website,
            phone: tile.phone,
          },
        })
      }
    }
    console.log('  ✓ Seeded initial inventory slots')
  }

  console.log('✅ Database seeding finished successfully!')
}
