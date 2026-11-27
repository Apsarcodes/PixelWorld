import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isOwnerEmail } from '@/constants/auth'
import { SIZE_CONFIGS, type SizeCategory } from '@/lib/pricing'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`admin_slot_create:${ip}`, { limit: 30, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests' }, { status: 429 })
    }

    const user = await appAuth.payloadUser(request)
    const isAdmin =
      user &&
      ((user as any).role === 'admin' ||
        (user as any).collection === 'admins' ||
        isOwnerEmail(user.email))

    if (!isAdmin) {
      return Response.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 })
    }

    const body = (await request.json()) as Record<string, unknown>
    const city = String(body.city || 'chennai').toLowerCase().trim()
    const sizeCategory = (body.sizeCategory as SizeCategory) || 'medium'
    const x = Math.max(0, Number(body.x) || 100)
    const y = Math.max(0, Number(body.y) || 100)

    const sizeConfig = SIZE_CONFIGS[sizeCategory] || SIZE_CONFIGS.medium
    const width = sizeConfig.width
    const height = sizeConfig.height
    const basePriceDaily = Number(body.basePriceDaily) || sizeConfig.baseDaily

    const payload = await getPayloadClient()

    // Find or create city relationship
    let cityDocId: string | number | undefined
    try {
      const cityResult = await payload.find({
        collection: 'cities' as any,
        where: { slug: { equals: city } },
        limit: 1,
        overrideAccess: true,
      })
      if (cityResult.docs.length > 0) {
        cityDocId = cityResult.docs[0].id
      } else {
        const newCity = await payload.create({
          collection: 'cities' as any,
          data: {
            name: city.charAt(0).toUpperCase() + city.slice(1),
            slug: city,
            country: 'India',
            tier: city === 'mumbai' || city === 'delhi' ? 'tier1' : 'tier2',
            active: true,
          },
          overrideAccess: true,
        })
        cityDocId = newCity.id
      }
    } catch {
      // Fallback
    }

    const slotIdentifier =
      String(body.slotIdentifier || '').trim() ||
      `${city.slice(0, 3).toUpperCase()}-${sizeCategory.charAt(0).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`

    const newSlot = await payload.create({
      collection: 'inventory-slots' as any,
      data: {
        slotIdentifier,
        city: cityDocId || 1,
        x,
        y,
        width,
        height,
        sizeCategory,
        status: 'available',
        basePriceDaily,
      },
      overrideAccess: true,
    })

    return Response.json({ success: true, slot: newSlot }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create canvas slot.'
    return Response.json({ error: message }, { status: 400 })
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await appAuth.payloadUser(request)
    const isAdmin =
      user &&
      ((user as any).role === 'admin' ||
        (user as any).collection === 'admins' ||
        isOwnerEmail(user.email))

    if (!isAdmin) {
      return Response.json({ error: 'Forbidden. Admin privileges required.' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get('id')

    if (!slotId) {
      return Response.json({ error: 'Slot ID is required' }, { status: 400 })
    }

    const payload = await getPayloadClient()

    // Ensure slot is not currently occupied by an active published campaign
    const existingSlot = await payload.findByID({
      collection: 'inventory-slots' as any,
      id: slotId,
      overrideAccess: true,
    })

    if (!existingSlot) {
      return Response.json({ error: 'Slot not found' }, { status: 404 })
    }

    if ((existingSlot as any).status === 'occupied' && (existingSlot as any).activeCampaign) {
      return Response.json(
        { error: 'Cannot remove a space currently occupied by an active ad campaign.' },
        { status: 400 },
      )
    }

    await payload.delete({
      collection: 'inventory-slots' as any,
      id: slotId,
      overrideAccess: true,
    })

    return Response.json({ success: true, message: `Space ${slotId} removed successfully.` })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to remove canvas slot.'
    return Response.json({ error: message }, { status: 400 })
  }
}
