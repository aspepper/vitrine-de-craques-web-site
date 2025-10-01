'use client'

import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface VideoInfo {
  id: string
  title: string
  description: string | null
  visibilityStatus: string
  blockReason: string | null
  blockedAt: string | null
  blockAppealStatus: string | null
  blockAppealMessage: string | null
  blockAppealAt: string | null
  blockAppealResponse: string | null
  blockAppealResolvedAt: string | null
  createdAt: string
  user: {
    id: string
    email: string | null
    name: string | null
    profile: { displayName: string | null } | null
  } | null
}

interface VideosResponse {
  items: VideoInfo[]
  page: number
  total: number
  totalPages: number
}

interface VideoModerationClientProps {
  initialData: VideosResponse
}

const STATUS_LABEL: Record<string, string> = {
  PUBLIC: 'Publicado',
  BLOCKED: 'Bloqueado',
}

const APPEAL_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Contestação pendente',
  APPROVED: 'Contestação aprovada',
  REJECTED: 'Contestação rejeitada',
}

export function VideoModerationClient({ initialData }: VideoModerationClientProps) {
  const [videos, setVideos] = useState(initialData.items)
  const [page, setPage] = useState(initialData.page)
  const [totalPages, setTotalPages] = useState(initialData.totalPages)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'blocked' | 'appeal'>('all')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [blockVideoId, setBlockVideoId] = useState<string | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)

  const [appealVideoId, setAppealVideoId] = useState<string | null>(null)
  const [appealDecision, setAppealDecision] = useState<'approve' | 'reject'>('approve')
  const [appealResponse, setAppealResponse] = useState('')
  const [appealDialogOpen, setAppealDialogOpen] = useState(false)

  const fetchVideos = useCallback(async (targetPage: number, term: string, status: 'all' | 'blocked' | 'appeal') => {
    setLoading(true)
    setFeedback(null)
    setError(null)

    const params = new URLSearchParams({ page: String(targetPage), limit: '12' })
    if (term.trim()) {
      params.set('search', term.trim())
    }
    if (status !== 'all') {
      params.set('status', status)
    }

    try {
      const response = await fetch(`/api/admin/videos?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Não foi possível carregar os vídeos.')
      }
      const data = (await response.json()) as VideosResponse
      setVideos(data.items)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar vídeos.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearchSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await fetchVideos(1, search, statusFilter)
    },
    [fetchVideos, search, statusFilter],
  )

  const handleStatusChange = useCallback(
    async (status: 'all' | 'blocked' | 'appeal') => {
      setStatusFilter(status)
      await fetchVideos(1, search, status)
    },
    [fetchVideos, search],
  )

  const openBlockDialog = useCallback((videoId: string) => {
    setBlockVideoId(videoId)
    setBlockReason('')
    setBlockDialogOpen(true)
  }, [])

  const handleBlockVideo = useCallback(async () => {
    if (!blockVideoId) {
      return
    }
    if (!blockReason.trim()) {
      setError('Informe um motivo para o bloqueio do vídeo.')
      return
    }

    try {
      const response = await fetch(`/api/admin/videos/${blockVideoId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: blockReason }),
      })
      if (!response.ok) {
        const data = (await response.json()) as { error?: unknown }
        throw new Error(data?.error ? String(data.error) : 'Erro ao bloquear o vídeo.')
      }
      setFeedback('Vídeo bloqueado com sucesso.')
      setBlockDialogOpen(false)
      await fetchVideos(page, search, statusFilter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao bloquear vídeo.')
    }
  }, [blockReason, blockVideoId, fetchVideos, page, search, statusFilter])

  const handleUnblockVideo = useCallback(
    async (videoId: string) => {
      try {
        const response = await fetch(`/api/admin/videos/${videoId}/block`, { method: 'DELETE' })
        if (!response.ok) {
          const data = (await response.json()) as { error?: unknown }
          throw new Error(data?.error ? String(data.error) : 'Erro ao liberar o vídeo.')
        }
        setFeedback('Vídeo liberado com sucesso.')
        await fetchVideos(page, search, statusFilter)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao liberar vídeo.')
      }
    },
    [fetchVideos, page, search, statusFilter],
  )

  const openAppealDialog = useCallback((videoId: string, defaultDecision: 'approve' | 'reject' = 'approve') => {
    setAppealVideoId(videoId)
    setAppealDecision(defaultDecision)
    setAppealResponse('')
    setAppealDialogOpen(true)
  }, [])

  const handleAppealDecision = useCallback(async () => {
    if (!appealVideoId) {
      return
    }
    if (!appealResponse.trim()) {
      setError('Inclua uma resposta para o usuário.')
      return
    }

    try {
      const response = await fetch(`/api/admin/videos/${appealVideoId}/appeal-response`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: appealDecision, response: appealResponse }),
      })
      if (!response.ok) {
        const data = (await response.json()) as { error?: unknown }
        throw new Error(data?.error ? String(data.error) : 'Erro ao registrar resposta.')
      }
      setFeedback('Resposta enviada com sucesso.')
      setAppealDialogOpen(false)
      await fetchVideos(page, search, statusFilter)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao responder contestação.')
    }
  }, [appealDecision, appealResponse, appealVideoId, fetchVideos, page, search, statusFilter])

  const paginationButtons = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <Button disabled={loading || page <= 1} onClick={() => fetchVideos(page - 1, search, statusFilter)} variant="outline" size="sm">
          Anterior
        </Button>
        <span className="text-xs text-slate-300">
          Página {page} de {totalPages}
        </span>
        <Button
          disabled={loading || page >= totalPages}
          onClick={() => fetchVideos(page + 1, search, statusFilter)}
          variant="outline"
          size="sm"
        >
          Próxima
        </Button>
      </div>
    )
  }, [fetchVideos, loading, page, search, statusFilter, totalPages])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-slate-100 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título ou responsável"
            className="bg-slate-900/40 text-slate-100"
          />
          <Button type="submit" disabled={loading} size="sm">
            Buscar
          </Button>
        </form>

        <div className="flex items-center gap-2 text-xs">
          <Button
            size="sm"
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('all')}
          >
            Todos
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'blocked' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('blocked')}
          >
            Bloqueados
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'appeal' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('appeal')}
          >
            Contestações
          </Button>
        </div>
      </div>

      {feedback ? <p className="text-sm text-emerald-400">{feedback}</p> : null}
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => {
          const owner = video.user?.profile?.displayName ?? video.user?.email ?? 'Usuário'
          const statusLabel = STATUS_LABEL[video.visibilityStatus] ?? video.visibilityStatus
          const appealLabel = video.blockAppealStatus ? APPEAL_STATUS_LABEL[video.blockAppealStatus] ?? video.blockAppealStatus : null

          return (
            <div key={video.id} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_24px_96px_-64px_rgba(15,23,42,0.85)]">
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-300">{statusLabel}</p>
                <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                <p className="text-xs text-slate-300">Responsável: {owner}</p>
                <p className="text-xs text-slate-400">Enviado em {new Date(video.createdAt).toLocaleString('pt-BR')}</p>
              </div>

              {video.blockReason ? (
                <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-200">
                  Motivo do bloqueio: {video.blockReason}
                </div>
              ) : null}

              {appealLabel ? (
                <div className="rounded-2xl border border-sky-400/40 bg-sky-500/10 p-3 text-xs text-sky-200">
                  {appealLabel}
                  {video.blockAppealMessage ? (
                    <p className="mt-1 text-[11px] text-sky-100">Contestação: {video.blockAppealMessage}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {video.visibilityStatus === 'BLOCKED' ? (
                  <Button size="sm" variant="outline" className="border-emerald-400 text-emerald-300" onClick={() => handleUnblockVideo(video.id)} disabled={loading}>
                    Liberar vídeo
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" className="border-rose-400 text-rose-300" onClick={() => openBlockDialog(video.id)} disabled={loading}>
                    Bloquear vídeo
                  </Button>
                )}
                {video.blockAppealStatus === 'PENDING' ? (
                  <Button size="sm" onClick={() => openAppealDialog(video.id)}>
                    Responder contestação
                  </Button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
        <span>{videos.length} vídeos listados</span>
        {paginationButtons}
      </div>

      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent className="bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>Bloquear vídeo</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-300">Descreva o motivo do bloqueio para que o responsável seja notificado.</p>
            <Textarea
              value={blockReason}
              onChange={(event) => setBlockReason(event.target.value)}
              minLength={10}
              rows={4}
              placeholder="Justificativa do bloqueio"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBlockDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleBlockVideo}>
              Confirmar bloqueio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={appealDialogOpen} onOpenChange={setAppealDialogOpen}>
        <DialogContent className="bg-slate-950 text-slate-100">
          <DialogHeader>
            <DialogTitle>Responder contestação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 text-xs">
              <Button
                size="sm"
                variant={appealDecision === 'approve' ? 'default' : 'outline'}
                onClick={() => setAppealDecision('approve')}
              >
                Aprovar contestação
              </Button>
              <Button
                size="sm"
                variant={appealDecision === 'reject' ? 'default' : 'outline'}
                onClick={() => setAppealDecision('reject')}
              >
                Manter bloqueio
              </Button>
            </div>
            <Textarea
              value={appealResponse}
              onChange={(event) => setAppealResponse(event.target.value)}
              minLength={10}
              rows={4}
              placeholder="Mensagem para o usuário sobre a decisão"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAppealDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAppealDecision}>Enviar resposta</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
