import { getPayload } from 'payload'
import config from '../payload.config'
import { ADMIN_EMAILS, isOwnerEmail } from '../constants/auth'

export async function runDatabaseCleanup() {
  const payload = await getPayload({ config })
  console.log('🧹 Starting database cleanup...')

  // 1. Delete all campaigns
  const campaigns = await payload.find({
    collection: 'campaigns',
    limit: 500,
    overrideAccess: true,
  })
  console.log(`Found ${campaigns.docs.length} campaigns to delete.`)
  for (const c of campaigns.docs) {
    await payload.delete({
      collection: 'campaigns',
      id: c.id,
      overrideAccess: true,
    })
  }
  console.log('✓ All campaigns deleted.')

  // 2. Delete non-admin users
  const users = await payload.find({
    collection: 'users',
    limit: 500,
    overrideAccess: true,
  })
  console.log(`Found ${users.docs.length} total users in DB.`)
  let deletedCount = 0
  for (const u of users.docs) {
    const emailLower = String(u.email || '').toLowerCase().trim()
    const isAdmin = isOwnerEmail(emailLower) || (u as any).role === 'admin'
    if (isAdmin) {
      console.log(`  🛡️ Preserving Super Admin: ${emailLower}`)
    } else {
      await payload.delete({
        collection: 'users',
        id: u.id,
        overrideAccess: true,
      })
      deletedCount++
    }
  }
  console.log(`✓ Deleted ${deletedCount} non-admin users.`)

  // 3. Reset inventory slots
  const slots = await payload.find({
    collection: 'inventory-slots' as any,
    limit: 500,
    overrideAccess: true,
  })
  for (const s of slots.docs) {
    await payload.update({
      collection: 'inventory-slots' as any,
      id: s.id,
      data: {
        status: 'available',
        activeCampaign: null,
      },
      overrideAccess: true,
    }).catch(() => {})
  }
  console.log(`✓ Reset ${slots.docs.length} inventory slots to available.`)

  console.log('🎉 Database cleanup complete!')
}
