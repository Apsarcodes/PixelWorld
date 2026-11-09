import type { Access, CollectionConfig } from 'payload'
import { isPayloadAdmin, isPayloadAdminAccess } from '@/access/organization-access'

const notificationUserAccess: Access = ({ req }) => {
  if (isPayloadAdmin(req)) return true
  if (req.user?.collection === 'users') {
    return { user: { equals: req.user.id } }
  }
  return false
}

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    group: 'Advertising',
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'type', 'read', 'createdAt'],
  },
  access: {
    create: isPayloadAdminAccess,
    delete: notificationUserAccess,
    read: notificationUserAccess,
    update: notificationUserAccess,
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: false,
      index: true,
    },
    { name: 'title', type: 'text', required: true },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
      defaultValue: 'info',
      required: true,
    },
    { name: 'link', type: 'text' },
    { name: 'read', type: 'checkbox', defaultValue: false, index: true },
    { name: 'readAt', type: 'date' },
  ],
  timestamps: true,
}
