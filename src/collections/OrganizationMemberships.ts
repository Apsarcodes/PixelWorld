import type { CollectionConfig } from 'payload'
import { isPayloadAdmin } from '@/access/organization-access'

export const OrganizationMemberships: CollectionConfig = {
  slug: 'organization-memberships',
  admin: {
    group: 'Advertiser',
    defaultColumns: ['organization', 'user', 'role', 'status'],
  },
  access: {
    create: ({ req }) => isPayloadAdmin(req),
    delete: ({ req }) => isPayloadAdmin(req),
    read: ({ req }) => {
      if (isPayloadAdmin(req)) return true
      if (req.user?.collection !== 'users') return false
      return { user: { equals: req.user.id } }
    },
    update: ({ req }) => isPayloadAdmin(req),
  },
  fields: [
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      index: true,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      options: ['owner', 'manager', 'analyst', 'billing'],
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: ['active', 'invited', 'suspended'],
      required: true,
    },
  ],
  timestamps: true,
}
