import { NextResponse } from 'next/server'

import { logApiError } from '@/lib/error'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

function buildErrorFromPayload(payload: Record<string, unknown>) {
  const message = typeof payload.message === 'string' ? payload.message : 'Erro desconhecido no cliente'
  const error = new Error(message)

  if (typeof payload.stack === 'string') {
    error.stack = payload.stack
  }

  return error
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const metadata: Record<string, unknown> = {}

    if (typeof body.digest === 'string') metadata.digest = body.digest
    if (typeof body.pathname === 'string') metadata.pathname = body.pathname
    if (typeof body.url === 'string') metadata.url = body.url
    if (typeof body.referrer === 'string') metadata.referrer = body.referrer
    if (typeof body.userAgent === 'string') metadata.userAgent = body.userAgent

    const error = buildErrorFromPayload(body)
    const { errorId } = await logApiError(req, error, 'CLIENT_RUNTIME_ERROR', metadata)

    return NextResponse.json({ ok: true, errorId })
  } catch (error) {
    const { errorId } = await logApiError(req, error, 'CLIENT_RUNTIME_ERROR_FALHA_PARSING')
    return NextResponse.json({ ok: false, errorId }, { status: 500 })
  }
}
