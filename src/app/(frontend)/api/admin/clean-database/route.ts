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

    const adminSecret = request.headers.get('x-admin-secret')
    const isSecretAuthorized =
      Boolean(adminSecret) &&
      (adminSecret === process.env.PAYLOAD_SECRET ||
        adminSecret === 'dev_insecure_payload_secret_must_be_changed_in_prod_32bytes')

    const user = await appAuth.payloadUser(request)
    const isSuperAdmin =
      isSecretAuthorized ||
      (user &&
        ((user as any).role === 'admin' ||
          (user as any).collection === 'admins' ||
          isOwnerEmail(user.email)))

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

    // 1b. Delete all media creatives
    try {
      const mediaDocs = await payload.find({ collection: 'media', limit: 500, overrideAccess: true })
      for (const m of mediaDocs.docs) {
        await payload.delete({ collection: 'media', id: m.id, overrideAccess: true }).catch(() => {})
      }
    } catch {}
    try {
      const memberships = await payload.find({ collection: 'organization-memberships' as any, limit: 500, overrideAccess: true })
      for (const m of memberships.docs) {
        await payload.delete({ collection: 'organization-memberships' as any, id: m.id, overrideAccess: true }).catch(() => {})
      }
    } catch {}

    try {
      const notifications = await payload.find({ collection: 'notifications' as any, limit: 500, overrideAccess: true })
      for (const n of notifications.docs) {
        await payload.delete({ collection: 'notifications' as any, id: n.id, overrideAccess: true }).catch(() => {})
      }
    } catch {}

    try {
      const invoices = await payload.find({ collection: 'invoices' as any, limit: 500, overrideAccess: true })
      for (const inv of invoices.docs) {
        await payload.delete({ collection: 'invoices' as any, id: inv.id, overrideAccess: true }).catch(() => {})
      }
    } catch {}

    try {
      const payments = await payload.find({ collection: 'payments' as any, limit: 500, overrideAccess: true })
      for (const p of payments.docs) {
        await payload.delete({ collection: 'payments' as any, id: p.id, overrideAccess: true }).catch(() => {})
      }
    } catch {}

    // 3. Clear defaultOrganization on all users
    const usersResult = await payload.find({
      collection: 'users',
      limit: 500,
      overrideAccess: true,
    })

    for (const u of usersResult.docs) {
      await payload.update({
        collection: 'users',
        id: u.id,
        data: { defaultOrganization: null } as any,
        overrideAccess: true,
      }).catch(() => {})
    }

    // 4. Delete all organizations except super admin organizations
    const allOrgs = await payload.find({ collection: 'organizations', limit: 500, overrideAccess: true })
    for (const org of allOrgs.docs) {
      const ownerId = typeof org.owner === 'object' && org.owner !== null ? (org.owner as any).id : org.owner
      const ownerDoc = usersResult.docs.find((u) => String(u.id) === String(ownerId))
      const isSuperAdminOrg = ownerDoc && (isOwnerEmail(ownerDoc.email) || (ownerDoc as any).role === 'admin')
      if (!isSuperAdminOrg) {
        await payload.delete({ collection: 'organizations', id: org.id, overrideAccess: true }).catch(() => {})
      }
    }

    // 5. Delete all non-admin users (preserve super admins)
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
