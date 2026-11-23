import { cookies } from 'next/headers'
import { exchangeGoogleCodeForProfile, upsertGoogleAccount } from '@/lib/google-auth'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error')

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  if (oauthError) {
    console.error('Google OAuth error returned from provider:', oauthError)
    return Response.redirect(`${siteUrl}/?auth_error=${encodeURIComponent(oauthError)}`, 302)
  }

  if (!code || !state) {
    return Response.redirect(`${siteUrl}/?auth_error=missing_code_or_state`, 302)
  }

  const cookieStore = await cookies()
  const expectedState = cookieStore.get('oauth_state')?.value

  if (!expectedState || expectedState !== state) {
    return Response.redirect(`${siteUrl}/?auth_error=invalid_state_csrf`, 302)
  }

  // Clear the state cookie
  cookieStore.set('oauth_state', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  })

  try {
    const profile = await exchangeGoogleCodeForProfile(code)
    await upsertGoogleAccount(profile)

    // Redirect to home root where PixelWorldApp auto-detects user session
    return Response.redirect(`${siteUrl}/`, 302)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google authentication failed'
    console.error('Google OAuth callback error:', err)
    return Response.redirect(
      `${siteUrl}/?auth_error=${encodeURIComponent(message)}`,
      302,
    )
  }
}
