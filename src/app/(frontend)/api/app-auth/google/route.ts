import { cookies } from 'next/headers'
import { generateOAuthState, getGoogleAuthorizationUrl } from '@/lib/google-auth'
import { isEmbeddedPreviewRuntime } from '@/lib/app-auth'

export async function GET() {
  const state = generateOAuthState()
  const cookieStore = await cookies()
  const embeddedPreview = isEmbeddedPreviewRuntime()

  // Store state in a short-lived HTTP-only cookie for CSRF validation
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    sameSite: embeddedPreview ? 'none' : 'lax',
    secure: embeddedPreview || process.env.NODE_ENV === 'production',
    partitioned: embeddedPreview,
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  })

  const authUrl = getGoogleAuthorizationUrl(state)

  return Response.redirect(authUrl, 302)
}
