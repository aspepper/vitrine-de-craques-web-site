import { Client } from 'pg'
import { logApiError } from '@/lib/error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ ok: false, error: 'NO_DATABASE_URL' })
    }

    // Neon + pooler + TLS
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // TLS; ok para Neon
    })
    await client.connect()
    const r = await client.query('select 1 as ok')
    await client.end()
    return Response.json({ ok: true, rows: r.rows })
  } catch (e: any) {
    await logApiError(req, e, 'AO VERIFICAR PG')
    return new Response(
      JSON.stringify({
        ok: false,
        name: e?.name ?? null,
        code: e?.code ?? null,
        message: String(e?.message ?? e),
      }),
      { status: 500, headers: { 'content-type': 'application/json' } },
    )
  }
}
