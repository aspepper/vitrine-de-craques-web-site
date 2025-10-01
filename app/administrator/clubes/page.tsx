import { cookies, headers } from 'next/headers'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { isAdminRole } from '@/lib/admin-auth'
import prisma from '@/lib/db'
import { ClubManagementClient } from './ClubManagementClient'

export const dynamic = 'force-dynamic'

interface ClubsResponse {
  items: Array<{
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

export default async function AdministratorClubsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    throw new Error('Unauthorized')
  }

  const cookieStore = cookies()
  const host = headers().get('host')
  const baseUrl = resolveBaseUrl(host)

  const response = await fetch(`${baseUrl}/api/admin/clubes?limit=12`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao carregar clubes.')
  }

  const data = (await response.json()) as ClubsResponse

  const confederations = await prisma.confederation.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="space-y-6 text-slate-100">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Cadastro de clubes</h2>
        <p className="text-sm text-slate-300">
          Gerencie os clubes cadastrados, faça upload de brasões e mantenha os dados institucionais atualizados.
        </p>
      </header>

      <ClubManagementClient initialData={data} confederations={confederations} />
    </div>
  )
}
