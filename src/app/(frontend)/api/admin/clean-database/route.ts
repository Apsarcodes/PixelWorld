import { appAuth } from '@/lib/app-auth'
import { getPayloadClient } from '@/lib/payload'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'
import { isOwnerEmail, ADMIN_EMAILS } from '@/constants/auth'

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(`clean_db:${ip}`, { limit: 5, windowMs: 60000 })
    if (!rateLimit.success) {
      return Response.json({ error: 'Too many requests' }, { status: 429 })
    }

    const user = await appAuth.payloadUser(request)
    const isSuperAdmin =
      user &&
      ((user as any).role === 'admin' ||
        (user as any).collection === 'admins' ||
        isOwnerEmail(user.email))

    if (!isSuperAdmin) {
      return Response.json({ error: 'Forbidden. Super admin privileges required.' }, { status: 403 })
    }

    const payload = await getPayloadClient()

    // 1. Delete all campaigns
    const campaignsResult = await payload.find({
      collection: 'campaigns',
      limit: 500,
      overrideAccess: true,
    })

    let deletedCampaignsCount = 0
    for (const c of campaignsResult.docs) {
      try {
        await payload.delete({
          collection: 'campaigns',
          id: c.id,
          overrideAccess: true,
        })
        deletedCampaignsCount++
      } catch (err) {
        console.warn(`Failed to delete campaign ${c.id}:`, err)
      }
    }

    // 2. Delete all non-admin users (preserve super admins)
    const usersResult = await payload.find({
      collection: 'users',
      limit: 500,
      overrideAccess: true,
    })

    let deletedUsersCount = 0
    const preservedAdmins: string[] = []

    for (const u of usersResult.docs) {
      const emailLower = String(u.email || '').toLowerCase().trim()
      const isAdmin = isOwnerEmail(emailLower) || (u as any).role === 'admin'

      if (isAdmin) {
        preservedAdmins.push(emailLower)
      } else {
        try {
          await payload.delete({
            collection: 'users',
            id: u.id,
            overrideAccess: true,
          })
          deletedUsersCount++
        } catch (err) {
          console.warn(`Failed to delete user ${u.id}:`, err)
        }
      }
    }

    // 3. Reset inventory slots to available status
    try {
      const slots = await payload.find({
        collection: 'inventory-slots' as any,
        limit: 500,
        overrideAccess: true,
      })
      for (const slot of slots.docs) {
        await payload.update({
          collection: 'inventory-slots' as any,
          id: slot.id,
          data: {
            status: 'available',
            activeCampaign: null,
          },
          overrideAccess: true,
        }).catch(() => {})
      }
    } catch {}

    // 4. Clean up pending reservations
    try {
      const reservations = await payload.find({
        collection: 'reservations' as any,
        limit: 500,
        overrideAccess: true,
      })
      for (const res of reservations.docs) {
        await payload.delete({
          collection: 'reservations' as any,
          id: res.id,
          overrideAccess: true,
        }).catch(() => {})
      }
    } catch {}

    return Response.json({
      ok: true,
      message: 'Database cleaned successfully. All mock campaigns and non-admin users removed.',
      deletedCampaignsCount,
      deletedUsersCount,
      preservedAdmins,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database cleanup failed'
    console.error('[Clean Database Error]', error)
    return Response.json({ error: message }, { status: 500 })
  }
}
