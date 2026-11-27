import { cookies } from 'next/headers'
import { generateOAuthState, getGoogleAuthorizationUrl } from '@/lib/google-auth'
import { isEmbeddedPreviewRuntime } from '@/lib/app-auth'

export async function GET(request: Request) {
  const state = generateOAuthState()
  const cookieStore = await cookies()
  const embeddedPreview = isEmbeddedPreviewRuntime()

  // Derive origin from the incoming request so that whether the request originates from
  // https://pixelword.in, https://www.pixelword.in, or http://localhost:3000,
  // the exact matching redirect URI is passed to Google.
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const origin = host ? `${proto}://${host}` : undefined

  // Store state in a short-lived HTTP-only cookie for CSRF validation
  cookieStore.set('oauth_state', state, {
    httpOnly: true,
    sameSite: embeddedPreview ? 'none' : 'lax',
    secure: embeddedPreview || process.env.NODE_ENV === 'production',
    partitioned: embeddedPreview,
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  })

  if (origin) {
    cookieStore.set('oauth_origin', origin, {
      httpOnly: true,
      sameSite: embeddedPreview ? 'none' : 'lax',
      secure: embeddedPreview || process.env.NODE_ENV === 'production',
      partitioned: embeddedPreview,
      path: '/',
      maxAge: 10 * 60,
    })
  }

  const authUrl = getGoogleAuthorizationUrl(state, origin)

  return Response.redirect(authUrl, 302)
}
