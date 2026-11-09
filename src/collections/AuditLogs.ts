import type { CollectionConfig } from 'payload'
import { isPayloadAdminAccess } from '@/access/organization-access'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  admin: {
    group: 'Security & Operations',
    useAsTitle: 'action',
    defaultColumns: ['action', 'actorType', 'actorId', 'resourceType', 'resourceId', 'status', 'createdAt'],
  },
  access: {
    create: isPayloadAdminAccess,
    delete: () => false, // Immutable audit logs
    read: isPayloadAdminAccess,
    update: () => false, // Immutable audit logs
  },
  fields: [
    {
      name: 'actorType',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'System', value: 'system' },
      ],
      required: true,
      index: true,
    },
    { name: 'actorId', type: 'text', required: true, index: true },
    { name: 'actorEmail', type: 'text' },
    { name: 'action', type: 'text', required: true, index: true },
    { name: 'resourceType', type: 'text', required: true, index: true },
    { name: 'resourceId', type: 'text', required: true, index: true },
    { name: 'ipAddress', type: 'text' },
    { name: 'userAgent', type: 'text' },
    { name: 'changes', type: 'json' },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failure', value: 'failure' },
      ],
      required: true,
      index: true,
    },
  ],
  timestamps: true,
}
