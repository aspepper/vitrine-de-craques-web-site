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
  } catch (error) {
    const { errorId } = await logApiError(req, error, 'AO VERIFICAR PG')
    const err = error as { [key: string]: unknown }

    const responseBody: Record<string, unknown> = {
      ok: false,
      errorId,
      name: typeof err.name === 'string' ? err.name : null,
      code: typeof err.code === 'string' ? err.code : null,
      message: typeof err.message === 'string' ? err.message : String(error),
    }

    if (process.env.NODE_ENV !== 'production' && typeof err.stack === 'string') {
      responseBody.stack = err.stack
    }

    return new Response(JSON.stringify(responseBody), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    })
  }
}
