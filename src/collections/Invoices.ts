import type { CollectionConfig } from 'payload'
import {
  isPayloadAdminAccess,
  organizationScopedAccess,
} from '@/access/organization-access'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  admin: {
    group: 'Financial',
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'organization', 'totalAmount', 'status', 'issuedAt'],
  },
  access: {
    create: isPayloadAdminAccess,
    delete: isPayloadAdminAccess,
    read: organizationScopedAccess,
    update: isPayloadAdminAccess,
  },
  fields: [
    { name: 'invoiceNumber', type: 'text', required: true, unique: true, index: true },
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
      name: 'campaign',
      type: 'relationship',
      relationTo: 'campaigns',
      required: true,
      index: true,
    },
    {
      name: 'payment',
      type: 'relationship',
      relationTo: 'payments' as any,
      required: false,
      index: true,
    },
    { name: 'amount', type: 'number', required: true, min: 0 },
    { name: 'tax', type: 'number', defaultValue: 0, min: 0 },
    { name: 'totalAmount', type: 'number', required: true, min: 0 },
    { name: 'currency', type: 'text', defaultValue: 'INR', required: true },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Issued', value: 'issued' },
        { label: 'Paid', value: 'paid' },
        { label: 'Void', value: 'void' },
      ],
      defaultValue: 'issued',
      required: true,
      index: true,
    },
    { name: 'issuedAt', type: 'date', required: true },
    { name: 'paidAt', type: 'date' },
    { name: 'pdfUrl', type: 'text' },
  ],
  timestamps: true,
}
