'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-4 bg-red-50 text-red-700">
      <h2>Algo deu errado</h2>
      <pre className="whitespace-pre-wrap">
        {error.name ? `${error.name}: ${error.message}` : error.message}
{`\n\n`}
{error.stack}
      </pre>
      <button className="mt-2 underline" onClick={() => reset()}>
        Tentar novamente
      </button>
    </div>
  )
}
