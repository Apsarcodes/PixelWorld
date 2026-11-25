import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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

const baseConfig = {
  admin: {
    user: Admins.slug,
    constrainWidth: true,
    dashboard: {
      widgets: [],
      defaultLayout: [
        { widgetSlug: 'activity' as const, width: 'full' as const },
        { widgetSlug: 'collections' as const, width: 'full' as const },
      ],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    fallbackLanguage: 'en' as const,
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
}

const usePostgres = Boolean(process.env.DATABASE_URI) || !process.env.FIGMA_EID

function getDatabaseUri(): string {
  let uri = process.env.DATABASE_URI || 'postgresql://postgres:postgres@127.0.0.1:5432/pixelworld'
  // In serverless environments (Vercel), convert Supabase pooler from Session mode (5432, max 15 clients)
  // to Transaction mode (6543, multiplexed pooler) to prevent EMAXCONNSESSION connection exhaustion.
  if (uri.includes('.pooler.supabase.com:5432')) {
    uri = uri.replace('.pooler.supabase.com:5432', '.pooler.supabase.com:6543')
  }
  return uri
}

export default usePostgres
  ? buildConfig({
      ...baseConfig,
      editor: lexicalEditor(),
      secret: process.env.PAYLOAD_SECRET || 'dev_insecure_payload_secret_must_be_changed_in_prod_32bytes',
      db: postgresAdapter({
        pool: {
          connectionString: getDatabaseUri(),
          max: process.env.NODE_ENV === 'production' ? 2 : 10,
          idleTimeoutMillis: 5000,
          connectionTimeoutMillis: 10000,
          ssl:
            process.env.DATABASE_URI?.includes('supabase.co') ||
            process.env.DATABASE_URI?.includes('supabase.com')
              ? { rejectUnauthorized: false }
              : undefined,
        },
      }),
    })
  : buildFigmaConfig({
      ...baseConfig,
      figma: {},
    })
