import type { Access, CollectionBeforeValidateHook, CollectionConfig } from 'payload'
import fs from 'fs'
import os from 'os'
import path from 'path'

import { createFolderField, createTagField } from 'payload'
import {
  appUserCreateAccess,
  appUserDefaultOrganization,
  isPayloadAdmin,
  organizationScopedAccess,
} from '@/access/organization-access'

// In serverless environments (Vercel, AWS Lambda), write uploads to OS temp directory
const uploadDir =
  process.env.VERCEL || process.env.NODE_ENV === 'production'
    ? path.resolve(os.tmpdir(), 'media')
    : path.resolve(process.cwd(), 'media')

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }
} catch {
  // Gracefully continue in environments where directory already exists
}

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
    afterRead: [
      ({ doc }) => {
        if (doc && (doc as any).externalURL) {
          doc.url = (doc as any).externalURL
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'externalURL',
      type: 'text',
      admin: {
        readOnly: true,
      },
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
    staticDir: uploadDir,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      headers.set('X-Content-Type-Options', 'nosniff')
      return headers
    },
  },
}
