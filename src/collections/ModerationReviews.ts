import type { CollectionConfig } from 'payload'
import { isPayloadAdminAccess } from '@/access/organization-access'

export const ModerationReviews: CollectionConfig = {
  slug: 'moderation-reviews',
  admin: {
    group: 'Advertising',
    useAsTitle: 'action',
    defaultColumns: ['campaign', 'action', 'reviewer', 'reviewedAt'],
  },
  access: {
    create: isPayloadAdminAccess,
    delete: isPayloadAdminAccess,
    read: isPayloadAdminAccess,
    update: isPayloadAdminAccess,
  },
  fields: [
    {
      name: 'campaign',
      type: 'relationship',
      relationTo: 'campaigns',
      required: true,
      index: true,
    },
    {
      name: 'reviewer',
      type: 'relationship',
      relationTo: 'admins',
      required: false,
    },
    {
      name: 'action',
      type: 'select',
      options: [
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Flagged for Revision', value: 'flagged' },
        { label: 'Emergency Takedown', value: 'takedown' },
      ],
      required: true,
      index: true,
    },
    { name: 'reason', type: 'text' },
    { name: 'notes', type: 'textarea' },
    { name: 'complianceFlags', type: 'json' },
    { name: 'reviewedAt', type: 'date', required: true },
  ],
  timestamps: true,
}
