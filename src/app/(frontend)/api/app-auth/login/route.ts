import { appAuth, isEmbeddedPreviewRuntime } from '@/lib/app-auth'

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as Record<string, unknown>
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
    const password = typeof input.password === 'string' ? input.password : ''

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    const result = await appAuth.login(email, password)
    return Response.json({
      user: result.user,
      previewToken: isEmbeddedPreviewRuntime() ? result.token : undefined,
    })
  } catch {
    return Response.json({ error: 'Invalid email or password.' }, { status: 401 })
  }
}
