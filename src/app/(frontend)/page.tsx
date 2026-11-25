import { appAuth } from '@/lib/app-auth'
import PixelWorldApp from './PixelWorldApp'

export default async function HomePage() {
  const user = await appAuth.currentUser().catch(() => null)
  return <PixelWorldApp initialUser={user} />
}
