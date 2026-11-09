import type { CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import {
  appUserCreateAccess,
  appUserDefaultOrganization,
  isPayloadAdmin,
  organizationScopedAccess,
} from '@/access/organization-access'

const assignCampaignOwnership: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (isPayloadAdmin(req)) return data
  if (req.user?.collection !== 'users') return data

  const organization = appUserDefaultOrganization(req)
  if (!organization) throw new Error('Your account does not have an organization.')

  if (operation === 'create') {
    return { ...data, organization, createdBy: req.user.id }
  }
  return { ...data, organization: undefined, createdBy: undefined }
}

export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  admin: {
    group: 'Advertiser',
    useAsTitle: 'name',
    defaultColumns: ['name', 'organization', '_status', 'updatedAt'],
  },
  access: {
    create: appUserCreateAccess,
    delete: organizationScopedAccess,
    read: organizationScopedAccess,
    readVersions: organizationScopedAccess,
    update: organizationScopedAccess,
  },
  hooks: {
    beforeValidate: [assignCampaignOwnership],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'brandName', type: 'text', required: true },
    { name: 'headline', type: 'text', required: true },
    { name: 'description', type: 'textarea' },
    {
      name: 'callToAction',
      type: 'select',
      options: [
        'Visit Website',
        'Call Now',
        'WhatsApp',
        'Get Directions',
        'Shop Now',
        'Book Now',
        'Learn More',
      ],
      required: true,
    },
    { name: 'creative', type: 'upload', relationTo: 'media', required: true },
    { name: 'width', type: 'number', min: 100, max: 800, required: true },
    { name: 'height', type: 'number', min: 100, max: 800, required: true },
    { name: 'startsAt', type: 'date', required: true },
    { name: 'endsAt', type: 'date', required: true },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      index: true,
      access: {
        create: ({ req }) => isPayloadAdmin(req),
        update: ({ req }) => isPayloadAdmin(req),
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: {
        create: ({ req }) => isPayloadAdmin(req),
        update: ({ req }) => isPayloadAdmin(req),
      },
    },
  ],
  timestamps: true,
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
}
