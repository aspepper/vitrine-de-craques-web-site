import { NextResponse } from 'next/server'
import { errorResponse } from '@/lib/error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: Request) {
  try {
    return NextResponse.json({
      ok: true,
      hasDB: Boolean(process.env.DATABASE_URL),
      host: process.env.NEXTAUTH_URL ?? null,
      // só para confirmar que o processo enxerga as chaves (sem mostrar valores)
      seen: Object.keys(process.env).filter((k) =>
        [
          'DATABASE_URL',
          'NEXTAUTH_URL',
          'AUTH_TRUST_HOST',
          'NEXTAUTH_SECRET',
        ].includes(k),
      ),
    })
  } catch (error) {
    return errorResponse(req, error, 'AO VERIFICAR SAÚDE')
  }
}
