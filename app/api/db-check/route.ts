// Impede o Next de tentar exportar/rodar isso no build:
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export async function GET() {
  // Se não houver DATABASE_URL no AMBIENTE (build, por exemplo), não falhe o build:
  if (!process.env.DATABASE_URL) {
    return new Response(
      JSON.stringify({ ok: false, error: 'NO_DATABASE_URL_AT_BUILD_OR_RUNTIME' }),
      { status: 200, headers: { 'content-type': 'application/json' } }
    )
  }

  // Instancie o Prisma dentro do handler (lazy) para evitar side-effects no parse do módulo
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    const r = await prisma.$queryRaw`SELECT 1 as ok`
    return Response.json({ ok: true, r })
  } catch (e: any) {
    console.error('DB-ERROR', e)
    return new Response(
      JSON.stringify({ ok: false, error: String(e) }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    )
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}
