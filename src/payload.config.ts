import path from 'path'
import { buildFigmaConfig } from '@payloadcms/figma'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { en as adminLanguage } from '@payloadcms/translations/languages/en'
import { fileURLToPath } from 'url'
import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Organizations } from './collections/Organizations'
import { OrganizationMemberships } from './collections/OrganizationMemberships'
import { Campaigns } from './collections/Campaigns'
import { Cities } from './collections/Cities'
import { Locations } from './collections/Locations'
import { InventorySlots } from './collections/InventorySlots'
import { Reservations } from './collections/Reservations'
import { Payments } from './collections/Payments'
import { Invoices } from './collections/Invoices'
import { ModerationReviews } from './collections/ModerationReviews'
import { AuditLogs } from './collections/AuditLogs'
import { Notifications } from './collections/Notifications'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildFigmaConfig({
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity', width: 'full' },
        { widgetSlug: 'collections', width: 'full' },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en',
    supportedLanguages: { en: adminLanguage },
  },
  collections: [
    Admins,
    Users,
    Organizations,
    OrganizationMemberships,
    Campaigns,
    Cities,
    Locations,
    InventorySlots,
    Reservations,
    Payments,
    Invoices,
    ModerationReviews,
    AuditLogs,
    Notifications,
    Media,
    Folders,
    Tags,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [mcpPlugin({})],
  figma: {},
})
