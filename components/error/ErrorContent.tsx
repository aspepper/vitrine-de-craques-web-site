'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export type ErrorContentProps = {
  error: Error & { digest?: string }
  reset?: () => void
}

const buildClientMetadata = (error: Error & { digest?: string }, pathname: string) => ({
  message: error?.message,
  stack: error?.stack,
  digest: error?.digest,
  pathname,
  url: typeof window !== 'undefined' ? window.location.href : undefined,
  referrer: typeof document !== 'undefined' ? document.referrer : undefined,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
})

export function ErrorContent({ error, reset }: ErrorContentProps) {
  const pathname = usePathname()

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    const payload = buildClientMetadata(error, pathname)

    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    }).catch((loggingError) => {
      console.error('Falha ao registrar erro no servidor', loggingError)
    })

    return () => controller.abort()
  }, [error, pathname])

  useEffect(() => {
    console.error('Erro não tratado na interface', error)
  }, [error])

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-16 text-white">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72">
          <Image
            src="/mascotes-bola-murcha.png"
            alt="Ilustração dos mascotes tristes com uma bola murcha"
            fill
            sizes="(max-width: 640px) 16rem, 18rem"
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Ops! Algo deu errado</p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Site fora do ar por problemas técnicos
          </h1>
          <p className="text-base text-slate-200 sm:text-lg">
            Nossa equipe já foi avisada e está trabalhando para resolver o mais rápido possível. Tente novamente em alguns
            instantes.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {reset ? (
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg transition hover:bg-emerald-400"
            >
              Tentar novamente
            </button>
          ) : null}
          <Link
            href="/"
            className="rounded-full border border-slate-600 px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-slate-400 hover:text-white"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </section>
  )
}
