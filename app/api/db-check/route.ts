// app/api/db-check/route.ts
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    const r = await prisma.$queryRaw`SELECT 1 AS ok`
    await prisma.$disconnect()
    return Response.json({ ok: true, r })
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        name: e?.name ?? null,
        message: String(e?.message ?? e),
        // se quiser debugar plataforma:
        platform: process.platform,
        arch: process.arch,
        openssl: process.versions?.openssl,
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }
}
