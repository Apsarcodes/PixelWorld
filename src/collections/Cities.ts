import type { Access, CollectionConfig } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Cities: CollectionConfig = {
  slug: 'cities',
  admin: {
    group: 'Inventory',
    useAsTitle: 'name',
    defaultColumns: ['name', 'state', 'occupancyRate', 'active'],
  },
  access: {
    create: isPayloadAdmin,
    delete: isPayloadAdmin,
    read: () => true, // Publicly readable for marketplace exploration
    update: isPayloadAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'state', type: 'text', required: true },
    { name: 'country', type: 'text', defaultValue: 'India', required: true },
    { name: 'icon', type: 'text', defaultValue: '🏛️' },
    { name: 'totalSpaces', type: 'number', defaultValue: 100, min: 1 },
    { name: 'occupiedSpaces', type: 'number', defaultValue: 0, min: 0 },
    { name: 'occupancyRate', type: 'number', defaultValue: 0, min: 0, max: 100 },
    { name: 'basePriceDaily', type: 'number', defaultValue: 299, min: 0 },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
}
