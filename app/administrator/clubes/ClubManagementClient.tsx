'use client'

import { SafeImage } from '@/components/media/SafeMedia'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface ClubInfo {
  id: string
  name: string
  slug: string
  nickname: string | null
  stadium: string | null
  city: string | null
  state: string | null
  colors: string | null
  website: string | null
  description: string | null
  crestUrl: string | null
  foundedAt: string | null
  confederationId: string | null
  confederation: { id: string; name: string } | null
}

interface ClubsResponse {
  items: ClubInfo[]
  page: number
  total: number
  totalPages: number
}

interface ConfederationOption {
  id: string
  name: string
}

interface ClubManagementClientProps {
  initialData: ClubsResponse
  confederations: ConfederationOption[]
}

export function ClubManagementClient({ initialData, confederations }: ClubManagementClientProps) {
  const [clubs, setClubs] = useState(initialData.items)
  const [page, setPage] = useState(initialData.page)
  const [totalPages, setTotalPages] = useState(initialData.totalPages)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editClub, setEditClub] = useState<ClubInfo | null>(null)
  const [deleteClub, setDeleteClub] = useState<ClubInfo | null>(null)

  const [formValues, setFormValues] = useState({
    name: '',
    nickname: '',
    stadium: '',
    city: '',
    state: '',
    colors: '',
    website: '',
    description: '',
    confederationId: '',
    foundedAt: '',
  })
  const [formCrest, setFormCrest] = useState<File | null>(null)

  const resetForm = useCallback(() => {
    setFormValues({
      name: '',
      nickname: '',
      stadium: '',
      city: '',
      state: '',
      colors: '',
      website: '',
      description: '',
      confederationId: '',
      foundedAt: '',
    })
    setFormCrest(null)
  }, [])

  const fetchClubs = useCallback(async (targetPage: number, term: string) => {
    setLoading(true)
    setFeedback(null)
    setError(null)

    const params = new URLSearchParams({ page: String(targetPage), limit: '12' })
    if (term.trim()) {
      params.set('search', term.trim())
    }

    try {
      const response = await fetch(`/api/admin/clubes?${params.toString()}`, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Não foi possível carregar os clubes.')
      }
      const data = (await response.json()) as ClubsResponse
      setClubs(data.items)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar clubes.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearchSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await fetchClubs(1, search)
    },
    [fetchClubs, search],
  )

  const handleOpenCreate = useCallback(() => {
    resetForm()
    setCreateOpen(true)
  }, [resetForm])

  const handleOpenEdit = useCallback(
    (club: ClubInfo) => {
      setEditClub(club)
      setFormValues({
        name: club.name,
        nickname: club.nickname ?? '',
        stadium: club.stadium ?? '',
        city: club.city ?? '',
        state: club.state ?? '',
        colors: club.colors ?? '',
        website: club.website ?? '',
        description: club.description ?? '',
        confederationId: club.confederationId ?? '',
        foundedAt: club.foundedAt ? club.foundedAt.slice(0, 10) : '',
      })
      setFormCrest(null)
    },
    [],
  )

  const handleCreateClub = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setFeedback(null)
      setError(null)

      if (!formValues.name.trim()) {
        setError('Informe o nome do clube.')
        return
      }

      const formData = new FormData()
      formData.set('name', formValues.name)
      formData.set('nickname', formValues.nickname)
      formData.set('stadium', formValues.stadium)
      formData.set('city', formValues.city)
      formData.set('state', formValues.state)
      formData.set('colors', formValues.colors)
      formData.set('website', formValues.website)
      formData.set('description', formValues.description)
      formData.set('confederationId', formValues.confederationId)
      formData.set('foundedAt', formValues.foundedAt)
      if (formCrest) {
        formData.set('crest', formCrest)
      }

      try {
        const response = await fetch('/api/admin/clubes', {
          method: 'POST',
          body: formData,
        })
        if (!response.ok) {
          throw new Error('Não foi possível criar o clube.')
        }
        setFeedback('Clube criado com sucesso.')
        setCreateOpen(false)
        resetForm()
        await fetchClubs(1, search)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar clube.')
      }
    },
    [fetchClubs, formCrest, formValues, resetForm, search],
  )

  const handleUpdateClub = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (!editClub) {
        return
      }

      setFeedback(null)
      setError(null)

      const formData = new FormData()
      Object.entries(formValues).forEach(([key, value]) => {
        formData.set(key, value)
      })
      if (formCrest) {
        formData.set('crest', formCrest)
      }

      try {
        const response = await fetch(`/api/admin/clubes/${editClub.id}`, {
          method: 'PATCH',
          body: formData,
        })
        if (!response.ok) {
          throw new Error('Não foi possível atualizar o clube.')
        }
        setFeedback('Clube atualizado com sucesso.')
        setEditClub(null)
        resetForm()
        await fetchClubs(page, search)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao atualizar clube.')
      }
    },
    [editClub, fetchClubs, formCrest, formValues, page, resetForm, search],
  )

  const handleDeleteClub = useCallback(
    async (club: ClubInfo) => {
      setFeedback(null)
      setError(null)
      try {
        const response = await fetch(`/api/admin/clubes/${club.id}`, { method: 'DELETE' })
        if (!response.ok) {
          throw new Error('Não foi possível remover o clube.')
        }
        setFeedback('Clube removido com sucesso.')
        setDeleteClub(null)
        await fetchClubs(page, search)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao remover clube.')
      }
    },
    [fetchClubs, page, search],
  )

  const paginationButtons = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <Button disabled={loading || page <= 1} onClick={() => fetchClubs(page - 1, search)} variant="outline" size="sm">
          Anterior
        </Button>
        <span className="text-xs text-slate-300">
          Página {page} de {totalPages}
        </span>
        <Button
          disabled={loading || page >= totalPages}
          onClick={() => fetchClubs(page + 1, search)}
          variant="outline"
          size="sm"
        >
          Próxima
        </Button>
      </div>
    )
  }, [fetchClubs, loading, page, search, totalPages])

  const renderFormFields = (isEditing: boolean) => (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="club-name">Nome</Label>
        <Input
          id="club-name"
          value={formValues.name}
          onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="club-nickname">Apelido</Label>
        <Input
          id="club-nickname"
          value={formValues.nickname}
          onChange={(event) => setFormValues((prev) => ({ ...prev, nickname: event.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="club-stadium">Estádio</Label>
        <Input
          id="club-stadium"
          value={formValues.stadium}
          onChange={(event) => setFormValues((prev) => ({ ...prev, stadium: event.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="club-city">Cidade</Label>
        <Input
          id="club-city"
          value={formValues.city}
          onChange={(event) => setFormValues((prev) => ({ ...prev, city: event.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="club-state">Estado</Label>
        <Input
          id="club-state"
          value={formValues.state}
          onChange={(event) => setFormValues((prev) => ({ ...prev, state: event.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="club-colors">Cores</Label>
        <Input
          id="club-colors"
          value={formValues.colors}
          onChange={(event) => setFormValues((prev) => ({ ...prev, colors: event.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="club-website">Site</Label>
        <Input
          id="club-website"
          value={formValues.website}
          onChange={(event) => setFormValues((prev) => ({ ...prev, website: event.target.value }))}
          placeholder="https://"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="club-founded">Fundação</Label>
        <Input
          id="club-founded"
          type="date"
          value={formValues.foundedAt}
          onChange={(event) => setFormValues((prev) => ({ ...prev, foundedAt: event.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="club-confederation">Confederação</Label>
        <select
          id="club-confederation"
          className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm"
          value={formValues.confederationId}
          onChange={(event) => setFormValues((prev) => ({ ...prev, confederationId: event.target.value }))}
        >
          <option value="">Sem vínculo</option>
          {confederations.map((confed) => (
            <option key={confed.id} value={confed.id}>
              {confed.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="club-description">Descrição</Label>
        <Textarea
          id="club-description"
          rows={3}
          value={formValues.description}
          onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="club-crest">Brasão</Label>
        <Input
          id="club-crest"
          type="file"
          accept="image/*"
          onChange={(event) => setFormCrest(event.target.files?.[0] ?? null)}
        />
        {isEditing && editClub?.crestUrl ? (
          <p className="text-xs text-slate-300">Brasão atual: {editClub.crestUrl}</p>
        ) : null}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-surface/80 p-4 text-foreground md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, cidade ou estado"
          />
          <Button type="submit" disabled={loading} size="sm">
            Buscar
          </Button>
        </form>

        <Button size="sm" onClick={handleOpenCreate}>
          Novo clube
        </Button>
      </div>

      {feedback ? <p className="text-sm text-success">{feedback}</p> : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clubs.map((club) => (
          <div key={club.id} className="space-y-3 rounded-3xl border border-border/60 bg-surface/80 p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{club.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {club.city ? `${club.city}/${club.state ?? ''}` : 'Local não informado'}
                </p>
              </div>
              {club.crestUrl ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-border/60">
                  <SafeImage src={club.crestUrl} alt={club.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground">
                  {club.name.charAt(0)}
                </div>
              )}
            </div>
            {club.nickname ? <p className="text-xs text-foreground">Apelido: {club.nickname}</p> : null}
            {club.description ? <p className="text-xs text-muted-foreground">{club.description}</p> : null}
            <div className="text-[11px] text-muted-foreground">
              <p>Estádio: {club.stadium ?? '—'}</p>
              <p>Confederação: {club.confederation?.name ?? '—'}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => handleOpenEdit(club)}>
                Editar
              </Button>
              <Button size="sm" variant="outline" className="border-error/60 text-error" onClick={() => setDeleteClub(club)}>
                Excluir
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-3xl border border-border/60 bg-surface/80 px-4 py-3 text-xs text-muted-foreground">
        <span>{clubs.length} clubes listados</span>
        {paginationButtons}
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open)
          if (!open) {
            resetForm()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Novo clube</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleCreateClub}>
            {renderFormFields(false)}
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editClub)}
        onOpenChange={(open) => {
          if (!open) {
            setEditClub(null)
            resetForm()
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Editar clube</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateClub}>
            {renderFormFields(true)}
            <DialogFooter>
              <Button type="submit">Atualizar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteClub)} onOpenChange={(open) => (open ? null : setDeleteClub(null))}>
        <DialogContent className="bg-background text-foreground">
          <DialogHeader>
            <DialogTitle>Remover clube</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza de que deseja remover o clube <strong>{deleteClub?.name}</strong>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteClub(null)}>
              Cancelar
            </Button>
            <Button className="bg-rose-500 hover:bg-rose-600" onClick={() => deleteClub && handleDeleteClub(deleteClub)}>
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
