import { cookies } from 'next/headers'
import {
  exchangeGoogleCodeForProfile,
  upsertGoogleAccount,
  getGoogleRedirectUri,
  getSiteUrl,
} from '@/lib/google-auth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error')

  const cookieStore = await cookies()
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
  const requestOrigin = host ? `${proto}://${host}` : undefined
  const cookieOrigin = cookieStore.get('oauth_origin')?.value
  const origin = cookieOrigin || requestOrigin || getSiteUrl()

  if (oauthError) {
    console.error('Google OAuth error returned from provider:', oauthError)
    return Response.redirect(`${origin}/?auth_error=${encodeURIComponent(oauthError)}`, 302)
  }

  if (!code || !state) {
    return Response.redirect(`${origin}/?auth_error=missing_code_or_state`, 302)
  }

  const expectedState = cookieStore.get('oauth_state')?.value

  if (!expectedState || expectedState !== state) {
    console.error('OAuth state CSRF validation failed:', { expectedState, receivedState: state })
    return Response.redirect(`${origin}/?auth_error=invalid_state_csrf`, 302)
  }

  // Clear state and origin cookies
  cookieStore.set('oauth_state', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })
  cookieStore.set('oauth_origin', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })

  try {
    const redirectUri = getGoogleRedirectUri(origin)
    const profile = await exchangeGoogleCodeForProfile(code, redirectUri)
    await upsertGoogleAccount(profile)

    // Redirect to home root where PixelWorldApp auto-detects user session
    return Response.redirect(`${origin}/`, 302)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google authentication failed'
    console.error('Google OAuth callback error:', err)
    return Response.redirect(
      `${origin}/?auth_error=${encodeURIComponent(message)}`,
      302,
    )
  }
}
