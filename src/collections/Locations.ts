import type { Access, CollectionConfig } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Locations: CollectionConfig = {
  slug: 'locations',
  admin: {
    group: 'Inventory',
    useAsTitle: 'name',
    defaultColumns: ['name', 'city', 'canvasWidth', 'canvasHeight', 'active'],
  },
  access: {
    create: isPayloadAdmin,
    delete: isPayloadAdmin,
    read: () => true, // Publicly readable for canvas exploration
    update: isPayloadAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    {
      name: 'city',
      type: 'relationship',
      relationTo: 'cities' as any,
      required: true,
      index: true,
    },
    { name: 'canvasWidth', type: 'number', defaultValue: 3200, required: true },
    { name: 'canvasHeight', type: 'number', defaultValue: 2400, required: true },
    { name: 'gridCellSize', type: 'number', defaultValue: 80, required: true },
    { name: 'address', type: 'text' },
    { name: 'active', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
}
