import type { Access, CollectionConfig } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const InventorySlots: CollectionConfig = {
  slug: 'inventory-slots',
  admin: {
    group: 'Inventory',
    useAsTitle: 'slotIdentifier',
    defaultColumns: ['slotIdentifier', 'city', 'sizeCategory', 'status', 'basePriceDaily'],
  },
  access: {
    create: isPayloadAdmin,
    delete: isPayloadAdmin,
    read: () => true, // Publicly readable for canvas marketplace
    update: isPayloadAdmin,
  },
  fields: [
    { name: 'slotIdentifier', type: 'text', required: true, unique: true, index: true },
    {
      name: 'city',
      type: 'relationship',
      relationTo: 'cities' as any,
      required: true,
      index: true,
    },
    {
      name: 'location',
      type: 'relationship',
      relationTo: 'locations' as any,
      required: false,
      index: true,
    },
    { name: 'x', type: 'number', required: true },
    { name: 'y', type: 'number', required: true },
    { name: 'width', type: 'number', required: true },
    { name: 'height', type: 'number', required: true },
    {
      name: 'sizeCategory',
      type: 'select',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
        { label: 'Premium', value: 'premium' },
      ],
      defaultValue: 'medium',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Available', value: 'available' },
        { label: 'Reserved', value: 'reserved' },
        { label: 'Occupied', value: 'occupied' },
        { label: 'Maintenance', value: 'maintenance' },
      ],
      defaultValue: 'available',
      required: true,
      index: true,
    },
    { name: 'basePriceDaily', type: 'number', defaultValue: 299, required: true },
    {
      name: 'activeCampaign',
      type: 'relationship',
      relationTo: 'campaigns',
      required: false,
    },
    { name: 'reservedUntil', type: 'date', required: false },
    {
      name: 'reservedBy',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    { name: 'brandName', type: 'text' },
    { name: 'category', type: 'text' },
    { name: 'tagline', type: 'text' },
    { name: 'views', type: 'text' },
    { name: 'clicks', type: 'text' },
    { name: 'emoji', type: 'text' },
    { name: 'color', type: 'text' },
    { name: 'website', type: 'text' },
    { name: 'phone', type: 'text' },
  ],
  timestamps: true,
}
