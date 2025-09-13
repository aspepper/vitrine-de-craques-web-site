import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET() {
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
    await prisma.$disconnect().catch(()=>{})
  }
}
