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
export const getUploadDir = () => {
  const dir =
    process.env.VERCEL || process.env.NODE_ENV === 'production'
      ? os.tmpdir()
      : path.resolve(process.cwd(), 'media')
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  } catch {
    // Gracefully continue in environments where directory already exists
  }
  return dir
}

const uploadDir = getUploadDir()

const assignMediaOwnership: CollectionBeforeValidateHook = ({ data, operation, req }) => {
  if (isPayloadAdmin(req)) return data
  if (req.user?.collection !== 'users') return data

  const userOrg = (req.user as any)?.defaultOrganization
  const fallbackOrg = typeof userOrg === 'object' && userOrg !== null ? userOrg.id : userOrg
  const organization = (data as any)?.organization || appUserDefaultOrganization(req) || fallbackOrg
  if (!organization) throw new Error('Your account does not have an organization.')

  if (operation === 'create') {
    return {
      ...data,
      organization,
      uploadedBy: (data as any)?.uploadedBy || req.user.id,
      purpose: data?.purpose || 'creative',
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
    beforeOperation: [
      () => {
        getUploadDir()
      },
    ],
    beforeValidate: [
      () => {
        getUploadDir()
      },
      assignMediaOwnership,
    ],
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
        create: ({ req }) => isPayloadAdmin(req) || req.user?.collection === 'users',
        update: ({ req }) => isPayloadAdmin(req) || req.user?.collection === 'users',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: {
        create: ({ req }) => isPayloadAdmin(req) || req.user?.collection === 'users',
        update: ({ req }) => isPayloadAdmin(req) || req.user?.collection === 'users',
      },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      index: true,
      access: {
        create: ({ req }) => isPayloadAdmin(req) || req.user?.collection === 'users',
        update: ({ req }) => isPayloadAdmin(req) || req.user?.collection === 'users',
      },
    },
    createFolderField({ relationTo: 'folders' }),
    createTagField({ relationTo: 'tags' }),
  ],
  upload: {
    staticDir: uploadDir,
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/avif',
      'image/heic',
      'image/heif',
      'image/*',
    ],
    modifyResponseHeaders: ({ headers }) => {
      headers.set('Cache-Control', 'private, no-store')
      headers.set('X-Content-Type-Options', 'nosniff')
      return headers
    },
  },
}
