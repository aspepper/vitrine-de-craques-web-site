import { cookies, headers } from 'next/headers'
import { getServerSession } from 'next-auth'
import { Role } from '@prisma/client'

import { authOptions } from '@/lib/auth'
import { isAdminRole } from '@/lib/admin-auth'
import { UserManagementClient } from './UserManagementClient'

export const dynamic = 'force-dynamic'

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

function resolveBaseUrl(host: string | null) {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '')
  }
  if (!host) {
    return 'http://localhost:3000'
  }
  return `http://${host}`
}

export default async function AdministratorUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    throw new Error('Unauthorized')
  }

  const cookieStore = cookies()
  const host = headers().get('host')
  const baseUrl = resolveBaseUrl(host)

  const response = await fetch(`${baseUrl}/api/admin/users?limit=20`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao carregar usuários.')
  }

  const data = (await response.json()) as UsersResponse

  const roleOptions = Object.values(Role).map((role) => ({ value: role, label: role }))

  return (
    <div className="space-y-6 text-slate-100">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Gestão de usuários</h2>
        <p className="text-sm text-slate-300">
          Cadastre novos usuários, aplique bloqueios e visualize atividades recentes na plataforma.
        </p>
      </header>

      <UserManagementClient initialData={data} roles={roleOptions} />
    </div>
  )
}
