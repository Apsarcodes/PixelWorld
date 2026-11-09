import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'

import { createFolderField, createTagField } from 'payload'
import {
  appUserCreateAccess,
  appUserDefaultOrganization,
  isPayloadAdmin,
  organizationScopedAccess,
} from '@/access/organization-access'

const assignMediaOwnership: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (isPayloadAdmin(req)) return data
  if (req.user?.collection !== 'users') return data

  const organization = appUserDefaultOrganization(req)
  if (!organization) throw new Error('Your account does not have an organization.')

  if (operation === 'create') {
    return {
      ...data,
      organization,
      uploadedBy: req.user.id,
      purpose: 'creative',
    }
  }
  return { ...data, organization: undefined, uploadedBy: undefined, purpose: undefined }
}

const mediaReadAccess: Access = async (args) => {
  const { req } = args
  // File URLs are capability URLs consumed directly by next/image. Media metadata
  // and collection queries remain private to organization members.
  if (req.url) {
    const pathname = new URL(req.url, 'http://payload.local').pathname
    if (pathname.includes('/file/')) return true
  }
  return organizationScopedAccess(args)
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: appUserCreateAccess,
    delete: organizationScopedAccess,
    read: mediaReadAccess,
    update: organizationScopedAccess,
  },
  hooks: {
    beforeValidate: [assignMediaOwnership],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'purpose',
      type: 'select',
      options: ['creative', 'organization-logo', 'other'],
      required: true,
      access: {
        create: ({ req }) => isPayloadAdmin(req),
        update: ({ req }) => isPayloadAdmin(req),
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        create: ({ req }) => isPayloadAdmin(req),
        update: ({ req }) => isPayloadAdmin(req),
      },
    },
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
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      headers.set('X-Content-Type-Options', 'nosniff')
      return headers
    },
  },
}
