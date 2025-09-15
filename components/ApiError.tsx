'use client'

import { useEffect, useState } from 'react'

type ApiErrorState = {
  message: string
  errorId?: string
  technicalDetails?: string
}

function formatJson(value: Record<string, unknown>): string {
  try {
    return JSON.stringify(value, null, 2)
  } catch (error) {
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${String(val)}`)
      .join('\n')
  }
}

function normalizePayload(
  payload: unknown,
  fallbackMessage: string,
  additionalDetails: Record<string, unknown> = {},
): ApiErrorState {
  if (!payload || typeof payload !== 'object') {
    return {
      message: fallbackMessage,
      technicalDetails:
        Object.keys(additionalDetails).length > 0
          ? formatJson(additionalDetails)
          : undefined,
    }
  }

  const data = payload as Record<string, unknown>
  const rawMessage = data.message
  const message =
    typeof rawMessage === 'string' && rawMessage.trim().length > 0
      ? rawMessage
      : fallbackMessage

  const errorId =
    typeof data.errorId === 'string' && data.errorId.trim().length > 0
      ? data.errorId
      : undefined

  const stack =
    typeof data.stack === 'string' && data.stack.trim().length > 0
      ? data.stack.trim()
      : undefined

  const detailKeys = [
    'name',
    'code',
    'platform',
    'arch',
    'openssl',
    'details',
    'diagnostics',
  ]

  const detailPayload: Record<string, unknown> = { ...additionalDetails }

  for (const key of detailKeys) {
    const value = data[key]
    if (value !== undefined && value !== null && value !== '') {
      detailPayload[key] = value
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (
      [
        'ok',
        'message',
        'errorId',
        'stack',
        ...detailKeys,
      ].includes(key)
    ) {
      continue
    }
    if (value !== undefined) {
      detailPayload[key] = value
    }
  }

  let technicalDetails: string | undefined
  const hasExtraDetails = Object.keys(detailPayload).length > 0

  if (stack) {
    technicalDetails = `Stack trace:\n${stack}`
    if (hasExtraDetails) {
      technicalDetails += `\n\nDados adicionais:\n${formatJson(detailPayload)}`
    }
  } else if (hasExtraDetails) {
    technicalDetails = formatJson(detailPayload)
  }

  return {
    message,
    errorId,
    technicalDetails,
  }
}

export default function ApiError() {
  const [errorState, setErrorState] = useState<ApiErrorState | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch('/api/db-check', { cache: 'no-store', signal: controller.signal })
      .then(async (resp) => {
        const fallbackMessage = resp.ok
          ? 'O banco de dados retornou uma resposta inesperada.'
          : 'Não foi possível verificar o status do banco de dados.'

        let payload: unknown = null
        try {
          payload = await resp.json()
        } catch (error) {
          payload = null
        }

        const explicitFailure =
          payload &&
          typeof payload === 'object' &&
          'ok' in (payload as Record<string, unknown>) &&
          (payload as Record<string, unknown>).ok === false

        if (!resp.ok || explicitFailure) {
          setErrorState(
            normalizePayload(payload, fallbackMessage, {
              status: resp.status,
              statusText: resp.statusText,
            }),
          )
        }
      })
      .catch((error) => {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }

        if (error instanceof Error) {
          setErrorState({
            message: 'Não foi possível verificar o status do banco de dados.',
            technicalDetails: error.stack
              ? `Stack trace:\n${error.stack}`
              : `${error.name}: ${error.message}`,
          })
        } else {
          setErrorState({
            message: 'Não foi possível verificar o status do banco de dados.',
            technicalDetails: String(error),
          })
        }
      })

    return () => {
      controller.abort()
    }
  }, [])

  if (!errorState) return null

  return (
    <div className="bg-red-50 p-4 text-sm text-red-700">
      <p className="font-semibold">Houve um problema ao verificar o banco de dados.</p>
      <p className="mt-1">{errorState.message}</p>
      {errorState.errorId ? (
        <p className="mt-2 text-xs">
          Código do erro:{' '}
          <span className="font-mono">{errorState.errorId}</span>
        </p>
      ) : null}
      {errorState.technicalDetails ? (
        <details className="mt-3 space-y-2">
          <summary className="cursor-pointer text-xs font-medium text-red-600">
            Detalhes técnicos
          </summary>
          <pre className="mt-2 max-h-64 overflow-auto rounded bg-red-100/70 p-2 text-xs leading-relaxed">
            {errorState.technicalDetails}
          </pre>
        </details>
      ) : null}
    </div>
  )
}
