import { NextResponse } from 'next/server'

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
