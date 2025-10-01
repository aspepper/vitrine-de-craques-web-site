import { cookies, headers } from 'next/headers'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { isAdminRole } from '@/lib/admin-auth'
import { VideoModerationClient } from './VideoModerationClient'

export const dynamic = 'force-dynamic'

interface VideosResponse {
  items: Array<{
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

export default async function AdministratorVideosPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    throw new Error('Unauthorized')
  }

  const cookieStore = cookies()
  const host = headers().get('host')
  const baseUrl = resolveBaseUrl(host)

  const response = await fetch(`${baseUrl}/api/admin/videos?limit=12`, {
    headers: { cookie: cookieStore.toString() },
    cache: 'no-store',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Falha ao carregar vídeos.')
  }

  const data = (await response.json()) as VideosResponse

  return (
    <div className="space-y-6 text-slate-100">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Moderação de vídeos</h2>
        <p className="text-sm text-slate-300">
          Revise bloqueios, contestações e o status de publicação dos vídeos enviados pelos usuários.
        </p>
      </header>

      <VideoModerationClient initialData={data} />
    </div>
  )
}
