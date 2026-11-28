import type { Payload } from 'payload'
import type { User } from '@/payload-types'

/**
 * Ensures a user has a valid default organization.
 * If missing, finds an existing organization owned by the user or creates a new personal organization,
 * creates the owner membership, and links it to user.defaultOrganization.
 */
export async function ensureUserOrganization(
  user: User & { collection?: 'users' },
  payload: Payload,
): Promise<string | number> {
  const currentOrg =
    user.defaultOrganization &&
    typeof user.defaultOrganization === 'object' &&
    'id' in user.defaultOrganization
      ? (user.defaultOrganization as { id: string | number }).id
      : (user.defaultOrganization as string | number | undefined)

  if (currentOrg) {
    return currentOrg
  }

  // 1. Check if the user already owns an organization in Payload
  try {
    const existing = await payload.find({
      collection: 'organizations',
      where: { owner: { equals: user.id } },
      limit: 1,
      overrideAccess: true,
    })

    if (existing.docs.length > 0 && existing.docs[0].id) {
      const orgId = existing.docs[0].id
      await payload.update({
        collection: 'users',
        id: user.id,
        overrideAccess: true,
        data: { defaultOrganization: orgId },
      })
      user.defaultOrganization = orgId as any
      return orgId
    }
  } catch (findErr) {
    console.warn('[Organization] Error finding existing organization:', findErr)
  }

  // 2. Create a new personal organization for the user
  const orgName = `${user.firstName || 'My'} Organization`
  const org = await payload.create({
    collection: 'organizations',
    overrideAccess: true,
    data: {
      name: orgName,
      type: 'personal',
      owner: user.id,
    },
  })

  // 3. Create active owner membership
  await payload
    .create({
      collection: 'organization-memberships',
      overrideAccess: true,
      data: {
        organization: org.id,
        user: user.id,
        role: 'owner',
        status: 'active',
      },
    })
    .catch(() => undefined)

  // 4. Update user record with defaultOrganization
  await payload
    .update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: { defaultOrganization: org.id },
    })
    .catch(() => undefined)

  user.defaultOrganization = org.id as any
  return org.id
}
