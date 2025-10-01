'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { VideoBlockAppealStatus } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface VideoAppealFormProps {
  videoId: string
  status: VideoBlockAppealStatus | null
  initialMessage: string | null
  blockReason: string | null
  appealAt: string | null
  response: string | null
  resolvedAt: string | null
}

function formatDate(input: string | null) {
  if (!input) {
    return null
  }
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date.toLocaleString('pt-BR')
}

export function VideoAppealForm({
  videoId,
  status,
  initialMessage,
  blockReason,
  appealAt,
  response,
  resolvedAt,
}: VideoAppealFormProps) {
  const [message, setMessage] = useState(initialMessage ?? '')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const appealSubmittedAt = formatDate(appealAt)
  const appealResolvedAt = formatDate(resolvedAt)

  const canSubmit = status !== 'PENDING'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!message.trim()) {
      setError('Explique brevemente por que o vídeo deve ser liberado.')
      return
    }

    setError(null)
    setFeedback(null)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}/appeal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        })

        if (!response.ok) {
          const data = (await response.json()) as { error?: string }
          throw new Error(data?.error ?? 'Não foi possível enviar a contestação.')
        }

        setFeedback('Contestação enviada para a equipe de moderação.')
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao enviar contestação.')
      }
    })
  }

  return (
    <div className="space-y-4 rounded-3xl border border-border/60 bg-background/60 p-6 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.65)]">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Seu vídeo foi bloqueado</h3>
        <p className="text-sm text-muted-foreground">
          Motivo informado pela equipe: <span className="font-medium text-foreground">{blockReason ?? 'Sem detalhes adicionais.'}</span>
        </p>
        {status === 'PENDING' && appealSubmittedAt ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            Contestação enviada em {appealSubmittedAt}. Aguarde a análise dos administradores.
          </p>
        ) : null}
        {status === 'APPROVED' && appealResolvedAt ? (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Contestação aprovada em {appealResolvedAt}. O vídeo voltará a ficar público em instantes.
          </p>
        ) : null}
        {status === 'REJECTED' && appealResolvedAt ? (
          <p className="text-sm text-rose-600 dark:text-rose-400">
            Contestação analisada em {appealResolvedAt}. O bloqueio foi mantido.
          </p>
        ) : null}
        {response ? (
          <p className="rounded-2xl border border-border/60 bg-background/80 p-3 text-sm text-foreground">
            Resposta da equipe: {response}
          </p>
        ) : null}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="appeal-message" className="text-sm font-medium text-foreground">
            Explique por que o vídeo deve ser liberado novamente
          </label>
          <Textarea
            id="appeal-message"
            name="message"
            minLength={20}
            maxLength={800}
            disabled={!canSubmit || isPending}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Descreva o contexto do vídeo e apresente argumentos para a liberação."
          />
          <p className="text-xs text-muted-foreground">Escreva pelo menos 20 caracteres.</p>
        </div>

        {error ? <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
        {feedback ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{feedback}</p> : null}

        <Button type="submit" disabled={!canSubmit || isPending} className="w-full sm:w-auto">
          {isPending ? 'Enviando...' : status === 'REJECTED' ? 'Enviar nova contestação' : 'Enviar contestação'}
        </Button>
        {!canSubmit ? (
          <p className="text-xs text-muted-foreground">
            Aguarde a análise da equipe antes de enviar outra contestação.
          </p>
        ) : null}
      </form>
    </div>
  )
}
