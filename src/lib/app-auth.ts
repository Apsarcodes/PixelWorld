import 'server-only'

import { cookies } from 'next/headers'
import { getPayloadClient } from '@/lib/payload'
import type { User } from '@/payload-types'

const APP_SESSION_COOKIE = 'app-session'
const SESSION_SECONDS = 60 * 60 * 24 * 7
export const isEmbeddedPreviewRuntime = () =>
  process.env.FIGMA === '1' || Boolean(process.env.FIGMA_PUBLIC_URL)

export type AppUser = {
  id: string | number
  email: string
  firstName: string
  lastName?: string | null
  phone?: string | null
  accountType: 'advertiser' | 'business' | 'agency'
  company?: string | null
  onboardingGoal?: string | null
}

function toAppUser(user: Record<string, unknown>): AppUser {
  return {
    id: user.id as string | number,
    email: String(user.email ?? ''),
    firstName: String(user.firstName ?? ''),
    lastName: typeof user.lastName === 'string' ? user.lastName : null,
    phone: typeof user.phone === 'string' ? user.phone : null,
    accountType:
      user.accountType === 'business' || user.accountType === 'agency'
        ? user.accountType
        : 'advertiser',
    company: typeof user.company === 'string' ? user.company : null,
    onboardingGoal: typeof user.onboardingGoal === 'string' ? user.onboardingGoal : null,
  }
}

async function setSessionCookie(token: string, exp?: number) {
  const store = await cookies()
  const embeddedPreview = isEmbeddedPreviewRuntime()
  store.set(APP_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: embeddedPreview ? 'none' : 'lax',
    secure: embeddedPreview || process.env.NODE_ENV === 'production',
    partitioned: embeddedPreview,
    priority: 'high',
    path: '/',
    maxAge: exp ? Math.max(1, exp - Math.floor(Date.now() / 1000)) : SESSION_SECONDS,
  })
}

export function createAppAuth() {
  return {
    async login(email: string, password: string) {
      const payload = await getPayloadClient()
      const result = await payload.login({
        collection: 'users',
        overrideAccess: false,
        data: { email, password },
      })
      if (!result.token || !result.user || result.user.collection !== 'users') {
        throw new Error('Invalid email or password.')
      }
      await setSessionCookie(result.token, result.exp)
      return {
        user: toAppUser(result.user as unknown as Record<string, unknown>),
        token: result.token,
      }
    },

    async logout() {
      const store = await cookies()
      const embeddedPreview = isEmbeddedPreviewRuntime()
      store.set(APP_SESSION_COOKIE, '', {
        httpOnly: true,
        sameSite: embeddedPreview ? 'none' : 'lax',
        secure: embeddedPreview || process.env.NODE_ENV === 'production',
        partitioned: embeddedPreview,
        priority: 'high',
        path: '/',
        maxAge: 0,
      })
    },

    async currentUser(request?: Request): Promise<AppUser | null> {
      const user = await this.payloadUser(request)
      return user ? toAppUser(user as unknown as Record<string, unknown>) : null
    },

    async payloadUser(request?: Request): Promise<(User & { collection: 'users' }) | null> {
      const cookieToken = (await cookies()).get(APP_SESSION_COOKIE)?.value
      const authorization = request?.headers.get('authorization')
      const headerToken =
        authorization?.startsWith('JWT ') || authorization?.startsWith('Bearer ')
          ? authorization.slice(authorization.indexOf(' ') + 1)
          : null
      const payload = await getPayloadClient()
      const tokens = [
        ...new Set([cookieToken, headerToken].filter((token): token is string => !!token)),
      ]

      for (const token of tokens) {
        try {
          const authHeaders = new Headers({ Authorization: `JWT ${token}` })
          const { user } = await payload.auth({ headers: authHeaders })
          if (!user || user.collection !== 'users') continue
          const hydratedUser = await payload.findByID({
            collection: 'users',
            id: user.id,
            overrideAccess: false,
            user,
            depth: 0,
          })
          return { ...hydratedUser, collection: 'users' }
        } catch {
          // Try the preview JWT when a stale browser cookie cannot be validated.
        }
      }

      return null
    },
  }
}

export const appAuth = createAppAuth()
