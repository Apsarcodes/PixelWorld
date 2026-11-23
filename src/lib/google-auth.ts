import 'server-only'

import crypto from 'crypto'
import { getPayloadClient } from '@/lib/payload'
import { appAuth } from '@/lib/app-auth'

export interface GoogleUserProfile {
  email: string
  firstName: string
  lastName?: string
  picture?: string
  sub?: string
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

export function getGoogleRedirectUri(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${siteUrl.replace(/\/+$/, '')}/api/app-auth/google/callback`
}

export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function getGoogleAuthorizationUrl(state: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  if (!isGoogleOAuthConfigured()) {
    return `${siteUrl.replace(/\/+$/, '')}/?auth_error=google_oauth_credentials_missing`
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!
  const redirectUri = getGoogleRedirectUri()
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeGoogleCodeForProfile(
  code: string,
): Promise<GoogleUserProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = getGoogleRedirectUri()

  // 1. Exchange code for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    const errorBody = await tokenResponse.text()
    throw new Error(`Google token exchange failed: ${errorBody}`)
  }

  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token

  // 2. Fetch user profile with access token
  const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!userinfoResponse.ok) {
    throw new Error('Failed to fetch user information from Google.')
  }

  const userinfo = await userinfoResponse.json()

  if (!userinfo.email || !userinfo.email_verified) {
    throw new Error('Google account email is missing or unverified.')
  }

  return {
    email: userinfo.email.toLowerCase().trim(),
    firstName: userinfo.given_name || userinfo.name || 'User',
    lastName: userinfo.family_name || '',
    picture: userinfo.picture,
    sub: userinfo.sub,
  }
}

export async function upsertGoogleAccount(profile: GoogleUserProfile) {
  const payload = await getPayloadClient()
  const email = profile.email.toLowerCase().trim()
  const adminEmails = ['mohamedapsarasif761@gmail.com', 'apsarcodes@gmail.com']
  const assignedRole: 'admin' | 'user' = adminEmails.includes(email) ? 'admin' : 'user'

  // 1. Check if user already exists
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  let userDoc = existing.docs[0]

  if (!userDoc) {
    // 2. Create new user account with secure random password for OAuth accounts
    const secureRandomPassword = crypto.randomBytes(32).toString('hex') + 'Aa1!'
    userDoc = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: {
        email,
        password: secureRandomPassword,
        firstName: profile.firstName || 'User',
        lastName: profile.lastName || '',
        accountType: 'advertiser',
        role: assignedRole,
        status: 'active',
        termsAcceptedAt: new Date().toISOString(),
      },
    })
  } else if (assignedRole === 'admin' && (userDoc as any).role !== 'admin') {
    userDoc = await payload.update({
      collection: 'users',
      id: userDoc.id,
      overrideAccess: true,
      data: { role: 'admin' },
    })
  }

  // 3. Issue authentic session token and set session cookie
  const session = await appAuth.issueSessionForUser(userDoc as any)

  return {
    user: session.user,
    token: session.token,
  }
}
