export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ ok: false, error: 'NO_DATABASE_URL_AT_RUNTIME' }, { status: 200 })
    }

    // import dinâmico para carregar o client certo no SWA
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const r: any = await prisma.$queryRaw`SELECT 1 AS ok`
    await prisma.$disconnect()

    return Response.json({ ok: true, r })
  } catch (err: any) {
    // Isso aparece no Log Stream do SWA
    console.error('DB-ERROR', err)
    return new Response(
      JSON.stringify({
        ok: false,
        name: err?.name ?? null,
        code: err?.code ?? null,
        message: String(err?.message ?? err),
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }
}
