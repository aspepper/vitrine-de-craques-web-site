'use client'

import { ErrorContent } from '@/components/error/ErrorContent'

type ErrorProps = { error: Error & { digest?: string }; reset: () => void }

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <html lang="pt-BR">
      <body>
        <ErrorContent error={error} reset={reset} />
      </body>
    </html>
  )
}
