import type { Access, PayloadRequest, Where } from 'payload'

const relationshipID = (value: unknown): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) {
    const id = (value as { id?: unknown }).id
    return typeof id === 'string' || typeof id === 'number' ? id : null
  }
  return null
}

export const isPayloadAdmin = (req: PayloadRequest) => req.user?.collection === 'admins'

export const appUserDefaultOrganization = (req: PayloadRequest) => {
  if (req.user?.collection !== 'users') return null
  return relationshipID(req.user.defaultOrganization)
}

async function memberOrganizationIDs(req: PayloadRequest) {
  if (req.user?.collection !== 'users') return []

  const cached = req.context.memberOrganizationIDs
  if (Array.isArray(cached)) return cached as Array<string | number>

  const memberships = await req.payload.find({
    collection: 'organization-memberships',
    overrideAccess: true,
    depth: 0,
    limit: 100,
    where: {
      and: [{ user: { equals: req.user.id } }, { status: { equals: 'active' } }],
    },
  })
  const ids = memberships.docs
    .map((membership) => relationshipID(membership.organization))
    .filter((id): id is string | number => id !== null)
  req.context.memberOrganizationIDs = ids
  return ids
}

export const organizationScopedAccess: Access = async ({ req }) => {
  if (isPayloadAdmin(req)) return true
  if (req.user?.collection !== 'users') return false

  const organizationIDs = await memberOrganizationIDs(req)
  if (organizationIDs.length === 0) return false
  return { organization: { in: organizationIDs } } as Where
}

export const memberOrganizationAccess: Access = async ({ req }) => {
  if (isPayloadAdmin(req)) return true
  if (req.user?.collection !== 'users') return false

  const organizationIDs = await memberOrganizationIDs(req)
  if (organizationIDs.length === 0) return false
  return { id: { in: organizationIDs } } as Where
}

export const appUserCreateAccess: Access = ({ req }) =>
  isPayloadAdmin(req) ||
  (req.user?.collection === 'users' && Boolean(appUserDefaultOrganization(req)))
