import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { isAdminRole } from '@/lib/admin-auth'
import { getAdminDashboardSummary } from '@/lib/admin-dashboard'
import prisma from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

type PendingAppeal = {
  id: string
  title: string
  blockReason: string | null
  blockAppealAt: Date | null
  blockAppealMessage: string | null
  user: {
    email: string | null
    profile: { displayName: string | null } | null
  }
}

export default async function AdministratorDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    throw new Error('Unauthorized')
  }

  const summary = await getAdminDashboardSummary()

  const pendingAppeals: PendingAppeal[] = await prisma.video.findMany({
    where: { blockAppealStatus: 'PENDING' },
    orderBy: { blockAppealAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      blockReason: true,
      blockAppealAt: true,
      blockAppealMessage: true,
      user: {
        select: {
          email: true,
          profile: { select: { displayName: true } },
        },
      },
    },
  })

  const statCards = [
    { label: 'Usuários ativos', value: summary.activeUsers },
    { label: 'Usuários bloqueados', value: summary.blockedUsers },
    { label: 'Logados (web, 24h)', value: summary.webLoggedUsers },
    { label: 'Logados (app, 24h)', value: summary.appLoggedUsers },
    { label: 'Vídeos publicados', value: summary.totalVideos },
    { label: 'Vídeos bloqueados', value: summary.blockedVideos },
    { label: 'Novos usuários (30 dias)', value: summary.newUsersLast30Days },
    { label: 'Vídeos enviados (30 dias)', value: summary.videosCreatedLast30Days },
  ]

  return (
    <div className="space-y-8 text-foreground">
      <header className="space-y-2">
        <h2 className="text-3xl font-semibold text-foreground">Visão geral</h2>
        <p className="text-sm text-muted-foreground">Resumo atualizado com os principais indicadores da plataforma.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border-border/60 bg-surface/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-foreground">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/60 bg-surface/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Distribuição por perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.roleDistribution.length > 0 ? (
              <ul className="space-y-2 text-sm text-muted-foreground">
                {summary.roleDistribution.map((entry) => (
                  <li key={entry.role} className="flex items-center justify-between rounded-xl bg-surface/70 px-4 py-2 text-foreground">
                    <span>{entry.role}</span>
                    <span className="font-semibold text-foreground">{entry.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum perfil cadastrado.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-surface/80">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Contestação de vídeos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingAppeals.length > 0 ? (
              pendingAppeals.map((appeal) => (
                <div key={appeal.id} className="space-y-1 rounded-2xl border border-border/60 bg-surface/70 p-4 text-sm">
                  <p className="text-base font-semibold text-foreground">{appeal.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Enviado por {appeal.user.profile?.displayName ?? appeal.user.email} em{' '}
                    {appeal.blockAppealAt ? new Date(appeal.blockAppealAt).toLocaleString('pt-BR') : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Motivo do bloqueio: {appeal.blockReason ?? 'Sem justificativa informada.'}
                  </p>
                  <p className="text-sm text-foreground">
                    Contestação: {appeal.blockAppealMessage ?? 'Sem detalhes.'}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma contestação pendente no momento.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
