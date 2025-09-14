'use client'

import { useEffect, useState } from 'react'

export default function ApiError() {
  const [erro, setErro] = useState<any>(null)

  useEffect(() => {
    fetch('/api/pg-check')
      .then(async (resp) => {
        if (!resp.ok) {
          try {
            const err = await resp.json()
            setErro(err)
          } catch (e) {
            setErro({ message: 'Erro desconhecido', stack: e instanceof Error ? e.stack : String(e) })
          }
        }
      })
      .catch((err) => {
        setErro({ name: err.name, message: err.message, stack: err.stack })
      })
  }, [])

  if (!erro) return null

  return (
    <div className="p-4 bg-red-50 text-red-700">
      <h2>Erro na Função</h2>
      <pre className="whitespace-pre-wrap">
        {erro.name ? `${erro.name}: ${erro.message}` : erro.message}
        {'\n\n'}
        {erro.stack}
      </pre>
    </div>
  )
}
