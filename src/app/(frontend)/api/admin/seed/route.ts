import { seedDatabase } from '@/scripts/seed'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key') || request.headers.get('x-seed-key')

    // Safe protection key to prevent unintended re-seeding
    if (key !== 'pixelworld_admin_init') {
      return Response.json({ error: 'Unauthorized seed trigger' }, { status: 401 })
    }

    console.log('⚡ Triggering live database seeding via admin API...')
    await seedDatabase()

    return Response.json({
      ok: true,
      message: 'PixelWorld database seeded successfully with Indian cities and canvas slots.',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Seeding failed'
    console.error('Database seed error:', error)
    return Response.json({ error: message }, { status: 500 })
  }
}
