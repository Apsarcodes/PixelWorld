import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isOwnerEmail } from '@/constants/auth'

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`admin_stats:${ip}`, { limit: 60, windowMs: 60000 })
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

    const payload = await getPayloadClient()

    // 1. Total users
    const usersResult = await payload.find({
      collection: 'users',
      limit: 1,
      overrideAccess: true,
    })
    const totalUsers = usersResult.totalDocs || 1

    // 2. Campaigns
    const allCampaigns = await payload.find({
      collection: 'campaigns',
      limit: 100,
      overrideAccess: true,
    })
    const totalCampaigns = allCampaigns.totalDocs || 0
    const activeCampaigns = allCampaigns.docs.filter((c: any) => c.status === 'published').length
    const pendingReviews = allCampaigns.docs.filter((c: any) => c.status === 'draft').length

    // 3. Payments and Revenue
    const paymentsResult = await payload.find({
      collection: 'payments' as any,
      limit: 100,
      overrideAccess: true,
    })
    const completedPayments = paymentsResult.docs.filter(
      (p: any) => p.status === 'completed' || p.status === 'success',
    )
    const totalRevenue = completedPayments.reduce(
      (sum: number, p: any) => sum + (Number(p.amount) || 0),
      0,
    )
    const failedPayments = paymentsResult.docs.filter((p: any) => p.status === 'failed').length

    // 4. Inventory Slots & Occupancy (strictly tied to real published campaigns)
    const slotsResult = await payload.find({
      collection: 'inventory-slots' as any,
      limit: 200,
      overrideAccess: true,
    })
    const totalSlots = slotsResult.totalDocs || 100
    const occupiedSlots = activeCampaigns
    const occupancyRate = Math.round((occupiedSlots / (totalSlots || 1)) * 100)

    // Background cleanup of any orphan prototype seed slots
    for (const slot of slotsResult.docs) {
      if ((slot as any).status === 'occupied' && !(slot as any).activeCampaign) {
        payload.update({
          collection: 'inventory-slots' as any,
          id: slot.id,
          overrideAccess: true,
          data: {
            status: 'available',
            brandName: null,
            tagline: null,
          },
        }).catch(() => {})
      }
    }

    // 5. Cities Breakdown
    const citiesResult = await payload.find({
      collection: 'cities' as any,
      limit: 20,
      overrideAccess: true,
    })
    const cityPerformance = citiesResult.docs.map((c: any) => ({
      city: c.name,
      ads: c.occupiedSpaces || 0,
      rev: `₹${((c.occupiedSpaces || 0) * 999).toLocaleString()}`,
      occ: c.occupancyRate || 0,
    }))

    return Response.json({
      ok: true,
      stats: {
        totalUsers,
        activeAdvertisers: Math.max(1, totalUsers),
        totalCampaigns,
        activeCampaigns,
        pendingReviews,
        expiringThisWeek: 0,
        occupancyRate: `${occupancyRate}%`,
        monthlyRevenue: `₹${totalRevenue.toLocaleString()}`,
        failedPayments,
        cityPerformance:
          cityPerformance.length > 0
            ? cityPerformance
            : [{ city: 'Chennai', ads: activeCampaigns, rev: `₹${totalRevenue}`, occ: occupancyRate }],
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch admin stats'
    return Response.json({ error: message }, { status: 500 })
  }
}
