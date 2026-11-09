import type { CollectionConfig } from 'payload'
import { isPayloadAdmin, memberOrganizationAccess } from '@/access/organization-access'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    group: 'Advertiser',
    useAsTitle: 'name',
  },
  access: {
    create: ({ req }) => isPayloadAdmin(req),
    delete: ({ req }) => isPayloadAdmin(req),
    read: memberOrganizationAccess,
    update: ({ req }) => isPayloadAdmin(req),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'type',
      type: 'select',
      defaultValue: 'personal',
      options: ['personal', 'business', 'agency'],
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
  ],
  timestamps: true,
}
