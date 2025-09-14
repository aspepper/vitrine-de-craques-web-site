export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return new Response(
      JSON.stringify({ ok: false, error: 'NO_DATABASE_URL_AT_RUNTIME' }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  }

  const { PrismaClient } = await import('@prisma/client') // import lazy
  const prisma = new PrismaClient()
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`
    return Response.json({ ok: true, r })
  } catch (e: any) {
    console.error('DB-ERROR', e)
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500, headers: { 'content-type': 'application/json' }
    })
  } finally {
    await prisma.$disconnect().catch(()=>{})
  }
}
