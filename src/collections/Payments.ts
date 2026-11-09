import type { CollectionConfig } from 'payload'
import {
  appUserCreateAccess,
  isPayloadAdminAccess,
  organizationScopedAccess,
} from '@/access/organization-access'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    group: 'Financial',
    useAsTitle: 'paymentId',
    defaultColumns: ['paymentId', 'amount', 'status', 'provider', 'createdAt'],
  },
  access: {
    create: appUserCreateAccess,
    delete: isPayloadAdminAccess,
    read: organizationScopedAccess,
    update: isPayloadAdminAccess,
  },
  fields: [
    { name: 'paymentId', type: 'text', required: true, unique: true, index: true },
    {
      name: 'provider',
      type: 'select',
      options: [
        { label: 'YouPI-PG (UPI)', value: 'youpi-pg' },
        { label: 'Manual/Offline', value: 'manual' },
      ],
      defaultValue: 'youpi-pg',
      required: true,
    },
    { name: 'transactionHash', type: 'text', index: true },
    { name: 'upiId', type: 'text' },
    { name: 'amount', type: 'number', required: true, min: 0 },
    { name: 'currency', type: 'text', defaultValue: 'INR', required: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
      defaultValue: 'pending',
      required: true,
      index: true,
    },
    {
      name: 'reservation',
      type: 'relationship',
      relationTo: 'reservations' as any,
      required: true,
      index: true,
    },
    {
      name: 'campaign',
      type: 'relationship',
      relationTo: 'campaigns',
      required: true,
      index: true,
    },
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
    { name: 'verifiedAt', type: 'date' },
    { name: 'metadata', type: 'json' },
  ],
  timestamps: true,
}
