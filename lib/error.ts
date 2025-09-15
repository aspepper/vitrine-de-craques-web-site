import { NextResponse } from 'next/server'
import { telemetryClient } from './app-insights'

export async function logApiError(
  request: Request,
  error: unknown,
  context: string,
) {
  console.error(`===== ERRO ${context} =====`)
  console.error('Timestamp:', new Date().toISOString())
  console.error(
    'Request Body:',
    await request
      .clone()
      .json()
      .catch(() => 'Corpo da requisição inválido'),
  )
  console.error('Erro completo:', error)
  console.error('===================================')
  if (telemetryClient) {
    telemetryClient.trackException({
      exception: error instanceof Error ? error : new Error(String(error)),
      properties: { context },
    })
  }
}

export async function errorResponse(
  request: Request,
  error: unknown,
  context: string,
) {
  await logApiError(request, error, context)
  return NextResponse.json(
    {
      message:
        'Ocorreu um erro no servidor. Por favor, tente novamente mais tarde.',
    },
    { status: 500 },
  )
}
