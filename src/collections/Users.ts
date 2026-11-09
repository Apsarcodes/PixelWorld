import type { Access, CollectionAfterChangeHook, CollectionConfig, FieldAccess } from 'payload'

const isAppUser: Access = ({ req }) => req.user?.collection === 'users'
const isSelf: Access = ({ req }) => {
  if (req.user?.collection !== 'users') return false
  return { id: { equals: req.user.id } }
}
const selfFieldAccess: FieldAccess = ({ req, id }) =>
  req.user?.collection === 'users' && req.user.id === id

const provisionPersonalOrganization: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== 'create') return doc

  const organization = await req.payload.create({
    collection: 'organizations',
    overrideAccess: true,
    req,
    data: {
      name: doc.company || `${doc.firstName}'s organization`,
      type:
        doc.accountType === 'business' || doc.accountType === 'agency'
          ? doc.accountType
          : 'personal',
      owner: doc.id,
    },
  })
  await req.payload.create({
    collection: 'organization-memberships',
    overrideAccess: true,
    req,
    data: {
      organization: organization.id,
      user: doc.id,
      role: 'owner',
      status: 'active',
    },
  })
  await req.payload.update({
    collection: 'users',
    overrideAccess: true,
    req,
    id: doc.id,
    data: { defaultOrganization: organization.id },
  })

  return { ...doc, defaultOrganization: organization.id }
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    hidden: true,
    useAsTitle: 'email',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 60 * 60 * 24 * 7,
  },
  access: {
    admin: () => false,
    create: () => true,
    delete: isSelf,
    read: isSelf,
    update: isSelf,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', required: true },
        { name: 'lastName', type: 'text' },
      ],
    },
    { name: 'phone', type: 'text' },
    {
      name: 'accountType',
      type: 'select',
      defaultValue: 'advertiser',
      options: [
        { label: 'Individual', value: 'advertiser' },
        { label: 'Business', value: 'business' },
        { label: 'Agency', value: 'agency' },
      ],
      required: true,
    },
    { name: 'company', type: 'text' },
    {
      name: 'defaultOrganization',
      type: 'relationship',
      relationTo: 'organizations',
      saveToJWT: true,
      access: {
        create: () => false,
        read: selfFieldAccess,
        update: () => false,
      },
    },
    {
      name: 'preferredCategories',
      type: 'select',
      hasMany: true,
      options: [
        'Food & Dining',
        'Real Estate',
        'Fashion',
        'Electronics',
        'Jobs',
        'Travel',
        'Healthcare',
        'Fintech',
        'Entertainment',
        'Automotive',
      ],
    },
    {
      name: 'onboardingGoal',
      type: 'select',
      options: [
        { label: 'Build brand awareness', value: 'brand' },
        { label: 'Generate leads or enquiries', value: 'leads' },
        { label: 'Drive direct sales', value: 'sales' },
        { label: 'Reach a local neighbourhood', value: 'local' },
        { label: 'Explore the platform', value: 'explore' },
      ],
    },
    {
      name: 'termsAcceptedAt',
      type: 'date',
      access: {
        create: () => true,
        read: selfFieldAccess,
        update: () => false,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: ['active', 'suspended', 'deactivated'],
      access: {
        create: () => false,
        read: selfFieldAccess,
        update: () => false,
      },
    },
  ],
  hooks: {
    afterChange: [provisionPersonalOrganization],
    beforeLogin: [
      ({ user }) => {
        if (user.status !== 'active') {
          throw new Error('This account is not active.')
        }
        return user
      },
    ],
  },
  versions: false,
}
