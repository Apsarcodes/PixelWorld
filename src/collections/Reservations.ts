import type { CollectionConfig } from 'payload'
import {
  appUserCreateAccess,
  organizationScopedAccess,
} from '@/access/organization-access'

export const Reservations: CollectionConfig = {
  slug: 'reservations',
  admin: {
    group: 'Advertising',
    useAsTitle: 'reservationCode',
    defaultColumns: ['reservationCode', 'slot', 'organization', 'status', 'totalAmount', 'lockedUntil'],
  },
  access: {
    create: appUserCreateAccess,
    delete: organizationScopedAccess,
    read: organizationScopedAccess,
    update: organizationScopedAccess,
  },
  fields: [
    { name: 'reservationCode', type: 'text', required: true, unique: true, index: true },
    {
      name: 'slot',
      type: 'relationship',
      relationTo: 'inventory-slots' as any,
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
    { name: 'durationDays', type: 'number', required: true, min: 1 },
    { name: 'startDate', type: 'date', required: true },
    { name: 'endDate', type: 'date', required: true },
    { name: 'totalAmount', type: 'number', required: true, min: 0 },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending Payment', value: 'pending_payment' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Expired', value: 'expired' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'pending_payment',
      required: true,
      index: true,
    },
    { name: 'lockedUntil', type: 'date', required: true },
  ],
  timestamps: true,
}
