'use client'

import { useCallback, useMemo, useState } from 'react'
import { Role } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface UsersResponse {
  items: Array<{
    id: string
    name: string | null
    email: string | null
    status: string
    blockedReason: string | null
    blockedAt: string | null
    lastWebLoginAt: string | null
    lastAppLoginAt: string | null
    createdAt: string
    profile: { id: string; role: Role; displayName: string | null } | null
  }>
  page: number
  total: number
  totalPages: number
}

interface RoleOption {
  value: Role
  label: string
}

interface UserManagementClientProps {
  initialData: UsersResponse
  roles: RoleOption[]
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Ativo',
  BLOCKED: 'Bloqueado',
}

export function UserManagementClient({ initialData, roles }: UserManagementClientProps) {
  const [users, setUsers] = useState(initialData.items)
  const [page, setPage] = useState(initialData.page)
  const [totalPages, setTotalPages] = useState(initialData.totalPages)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [newUserRole, setNewUserRole] = useState<Role>(roles[0]?.value ?? 'TORCEDOR')
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')

  const [blockUserId, setBlockUserId] = useState<string | null>(null)
  const [blockReason, setBlockReason] = useState('')
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)

  const fetchUsers = useCallback(async (targetPage: number, term: string) => {
    setLoading(true)
    setFeedback(null)
    setError(null)

    const params = new URLSearchParams({ page: String(targetPage), limit: '20' })
    if (term.trim()) {
      params.set('search', term.trim())
    }

    try {
      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!response.ok) {
        throw new Error('Não foi possível carregar os usuários.')
      }

      const data = (await response.json()) as UsersResponse
      setUsers(data.items)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar usuários.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearchSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      await fetchUsers(1, search)
    },
    [fetchUsers, search],
  )

  const handleCreateUser = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setFeedback(null)
      setError(null)

      if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
        setError('Preencha todos os campos obrigatórios.')
        return
      }

      try {
        const response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newUserName,
            email: newUserEmail,
            password: newUserPassword,
            role: newUserRole,
          }),
        })

        if (!response.ok) {
          const data = (await response.json()) as { error?: unknown }
          throw new Error('Não foi possível criar o usuário.' + (data?.error ? ' Verifique os dados informados.' : ''))
        }

        setFeedback('Usuário criado com sucesso.')
        setCreateOpen(false)
        setNewUserName('')
        setNewUserEmail('')
        setNewUserPassword('')
        await fetchUsers(1, search)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar usuário.')
      }
    },
    [fetchUsers, newUserEmail, newUserName, newUserPassword, newUserRole, search],
  )

  const openBlockDialog = useCallback((userId: string) => {
    setBlockUserId(userId)
    setBlockReason('')
    setBlockDialogOpen(true)
  }, [])

  const handleBlockUser = useCallback(async () => {
    if (!blockUserId) {
      return
    }

    if (!blockReason.trim()) {
      setError('Informe um motivo para o bloqueio.')
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${blockUserId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: blockReason }),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: unknown }
        throw new Error(data?.error ? String(data.error) : 'Erro ao bloquear o usuário.')
      }

      setFeedback('Usuário bloqueado com sucesso.')
      setBlockDialogOpen(false)
      await fetchUsers(page, search)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao bloquear usuário.')
    }
  }, [blockReason, blockUserId, fetchUsers, page, search])

  const handleUnblockUser = useCallback(
    async (userId: string) => {
      try {
        const response = await fetch(`/api/admin/users/${userId}/block`, { method: 'DELETE' })
        if (!response.ok) {
          const data = (await response.json()) as { error?: unknown }
          throw new Error(data?.error ? String(data.error) : 'Erro ao desbloquear usuário.')
        }
        setFeedback('Usuário desbloqueado com sucesso.')
        await fetchUsers(page, search)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao desbloquear usuário.')
      }
    },
    [fetchUsers, page, search],
  )

  const paginationButtons = useMemo(() => {
    return (
      <div className="flex items-center gap-2">
        <Button disabled={loading || page <= 1} onClick={() => fetchUsers(page - 1, search)} variant="outline" size="sm">
          Anterior
        </Button>
        <span className="text-xs text-muted-foreground">
          Página {page} de {totalPages}
        </span>
        <Button
          disabled={loading || page >= totalPages}
          onClick={() => fetchUsers(page + 1, search)}
          variant="outline"
          size="sm"
        >
          Próxima
        </Button>
      </div>
    )
  }, [fetchUsers, loading, page, search, totalPages])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-surface/80 p-4 text-foreground shadow-soft md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md items-center gap-2">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, e-mail ou perfil"
            className="bg-surface text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" disabled={loading} size="sm">
            Buscar
          </Button>
        </form>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Novo usuário</Button>
          </DialogTrigger>
          <DialogContent className="bg-surface text-foreground">
            <DialogHeader>
              <DialogTitle>Criar usuário</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleCreateUser}>
              <div className="space-y-1">
                <Label htmlFor="new-user-name">Nome</Label>
                <Input
                  id="new-user-name"
                  value={newUserName}
                  onChange={(event) => setNewUserName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-user-email">E-mail</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  value={newUserEmail}
                  onChange={(event) => setNewUserEmail(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-user-password">Senha provisória</Label>
                <Input
                  id="new-user-password"
                  type="password"
                  value={newUserPassword}
                  onChange={(event) => setNewUserPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new-user-role">Perfil</Label>
                <select
                  id="new-user-role"
                  className="w-full rounded-lg border border-border/60 bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70"
                  value={newUserRole}
                  onChange={(event) => setNewUserRole(event.target.value as Role)}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {feedback ? <p className="text-sm text-success">{feedback}</p> : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-surface/80 shadow-soft">
        <table className="min-w-full divide-y divide-border/60 text-left text-sm text-muted-foreground">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Usuário</th>
              <th className="px-4 py-3">E-mail</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Último acesso</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {users.map((user) => {
              const roleLabel = user.profile?.role ?? '—'
              const statusLabel = STATUS_LABEL[user.status] ?? user.status
              const lastLogin = user.lastWebLoginAt || user.lastAppLoginAt
              return (
                <tr key={user.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{user.profile?.displayName ?? user.name ?? 'Usuário'}</div>
                    {user.blockedReason ? (
                      <p className="text-xs text-warning">Motivo: {user.blockedReason}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{user.email ?? '—'}</td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">{roleLabel}</td>
                  <td className="px-4 py-3 text-xs font-medium text-foreground">{statusLabel}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {lastLogin ? new Date(lastLogin).toLocaleString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.status === 'BLOCKED' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-success/80 text-success"
                        onClick={() => handleUnblockUser(user.id)}
                        disabled={loading}
                      >
                        Desbloquear
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-error/70 text-error"
                        onClick={() => openBlockDialog(user.id)}
                        disabled={loading}
                      >
                        Bloquear
                      </Button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-border/60 bg-surface/70 px-4 py-3 text-xs text-muted-foreground">
          <span>{users.length} usuários listados</span>
          {paginationButtons}
        </div>
      </div>

      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent className="bg-surface text-foreground">
          <DialogHeader>
            <DialogTitle>Bloquear usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Descreva o motivo do bloqueio. O usuário receberá esta informação.</p>
            <Textarea
              value={blockReason}
              onChange={(event) => setBlockReason(event.target.value)}
              minLength={10}
              rows={4}
              placeholder="Detalhe a razão do bloqueio."
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setBlockDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleBlockUser}>
              Confirmar bloqueio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
