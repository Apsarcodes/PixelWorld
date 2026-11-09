import { appAuth } from '@/lib/app-auth'

export async function GET(request: Request) {
  return Response.json({ user: await appAuth.currentUser(request) })
}
