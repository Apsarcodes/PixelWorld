import 'server-only'

import crypto from 'crypto'
import { cookies } from 'next/headers'
import { jwtSign } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import type { User } from '@/payload-types'
import { isOwnerEmail } from '@/constants/auth'

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
  role: 'admin' | 'user'
  company?: string | null
  onboardingGoal?: string | null
}

function toAppUser(user: Record<string, unknown>): AppUser {
  const email = String(user.email ?? '').toLowerCase().trim()
  const isAdmin = user.role === 'admin' || isOwnerEmail(email)
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
    role: isAdmin ? 'admin' : 'user',
    company: typeof user.company === 'string' ? user.company : null,
    onboardingGoal: typeof user.onboardingGoal === 'string' ? user.onboardingGoal : null,
  }
}

async function setSessionCookie(token: string, exp?: number) {
  const store = await cookies()
  const embeddedPreview = isEmbeddedPreviewRuntime()
  const options = {
    httpOnly: true,
    sameSite: embeddedPreview ? ('none' as const) : ('lax' as const),
    secure: embeddedPreview || process.env.NODE_ENV === 'production',
    partitioned: embeddedPreview,
    priority: 'high' as const,
    path: '/',
    maxAge: exp ? Math.max(1, exp - Math.floor(Date.now() / 1000)) : SESSION_SECONDS,
  }
  store.set(APP_SESSION_COOKIE, token, options)
  store.set('payload-token', token, options)
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
      const emailLower = email.toLowerCase().trim()
      if (isOwnerEmail(emailLower) && (result.user as any).role !== 'admin') {
        try {
          await payload.update({
            collection: 'users',
            id: result.user.id,
            overrideAccess: true,
            data: { role: 'admin' },
          })
          ;(result.user as any).role = 'admin'
        } catch {
          // Ignore
        }
      }
      await setSessionCookie(result.token, result.exp)
      return {
        user: toAppUser(result.user as unknown as Record<string, unknown>),
        token: result.token,
      }
    },

    async issueSessionForUser(user: { id: string | number; email: string; [key: string]: unknown }) {
      const secret =
        process.env.PAYLOAD_SECRET || 'dev_insecure_payload_secret_must_be_changed_in_prod_32bytes'
      const emailLower = String(user.email ?? '').toLowerCase().trim()
      const userRole = user.role === 'admin' || isOwnerEmail(emailLower) ? 'admin' : 'user'
      const { exp, token } = await jwtSign({
        fieldsToSign: { id: user.id, collection: 'users', email: user.email, role: userRole },
        secret,
        tokenExpiration: SESSION_SECONDS,
      })
      await setSessionCookie(token, exp)
      return {
        user: toAppUser({ ...user, role: userRole }),
        token,
      }
    },

    async logout() {
      const store = await cookies()
      const embeddedPreview = isEmbeddedPreviewRuntime()
      const clearOptions = {
        httpOnly: true,
        sameSite: embeddedPreview ? ('none' as const) : ('lax' as const),
        secure: embeddedPreview || process.env.NODE_ENV === 'production',
        partitioned: embeddedPreview,
        priority: 'high' as const,
        path: '/',
        maxAge: 0,
      }
      store.set(APP_SESSION_COOKIE, '', clearOptions)
      store.set('payload-token', '', clearOptions)
      store.delete(APP_SESSION_COOKIE)
      store.delete('payload-token')
    },

    async currentUser(request?: Request): Promise<AppUser | null> {
      const user = await this.payloadUser(request)
      if (!user) return null
      const email = String(user.email ?? '').toLowerCase().trim()
      if (isOwnerEmail(email) && (user as any).role !== 'admin') {
        try {
          const payload = await getPayloadClient()
          await payload.update({
            collection: 'users',
            id: user.id,
            overrideAccess: true,
            data: { role: 'admin' },
          })
          ;(user as any).role = 'admin'
        } catch {
          // Ignore
        }
      }
      return toAppUser(user as unknown as Record<string, unknown>)
    },

    async payloadUser(request?: Request): Promise<(User & { collection: 'users' }) | null> {
      let payload
      try {
        payload = await getPayloadClient()
      } catch {
        return null
      }
      const cookieStore = await cookies()
      const cookieToken =
        cookieStore.get(APP_SESSION_COOKIE)?.value || cookieStore.get('payload-token')?.value
      const authorization = request?.headers.get('authorization')
      const headerToken =
        authorization?.startsWith('JWT ') || authorization?.startsWith('Bearer ')
          ? authorization.slice(authorization.indexOf(' ') + 1)
          : null
      const tokens = [
        ...new Set([cookieToken, headerToken].filter((token): token is string => !!token)),
      ]

      for (const token of tokens) {
        try {
          let user: (User & { collection: 'users' }) | null = null
          try {
            const authHeaders = new Headers({ Authorization: `JWT ${token}` })
            const authRes = await payload.auth({ headers: authHeaders })
            if (authRes?.user && authRes.user.collection === 'users') {
              user = authRes.user as any
            }
          } catch {
            // fallback to direct verification below
          }

          if (!user) {
            const secret =
              process.env.PAYLOAD_SECRET ||
              'dev_insecure_payload_secret_must_be_changed_in_prod_32bytes'
            const [headerB64, payloadB64, signatureB64] = token.split('.')
            if (headerB64 && payloadB64 && signatureB64) {
              const expectedSig = crypto
                .createHmac('sha256', secret)
                .update(`${headerB64}.${payloadB64}`)
                .digest('base64url')
              if (signatureB64 === expectedSig) {
                const decoded = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'))
                const now = Math.floor(Date.now() / 1000)
                if ((!decoded.exp || decoded.exp > now) && decoded.collection === 'users' && decoded.id) {
                  const fetched = await payload.findByID({
                    collection: 'users',
                    id: decoded.id as string | number,
                    overrideAccess: true,
                    depth: 0,
                  })
                  if (fetched) {
                    user = { ...fetched, collection: 'users' } as any
                  }
                }
              }
            }
          }

          if (!user || user.collection !== 'users') continue

          const hydratedUser = await payload.findByID({
            collection: 'users',
            id: user.id,
            overrideAccess: false,
            user,
            depth: 0,
          })
          return { ...(hydratedUser || user), collection: 'users' }
        } catch {
          // Token invalid or expired
        }
      }

      return null
    },
  }
}

export const appAuth = createAppAuth()
