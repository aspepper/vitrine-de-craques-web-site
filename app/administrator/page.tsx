import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { isAdminRole } from '@/lib/admin-auth'
import { getAdminDashboardSummary } from '@/lib/admin-dashboard'
import prisma from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export default async function AdministratorDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    throw new Error('Unauthorized')
  }

  const summary = await getAdminDashboardSummary()

  const pendingAppeals = await prisma.video.findMany({
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
    <div className="space-y-8 text-slate-100">
      <header className="space-y-2">
        <h2 className="text-3xl font-semibold text-white">Visão geral</h2>
        <p className="text-sm text-slate-300">Resumo atualizado com os principais indicadores da plataforma.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label} className="border-white/10 bg-white/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-slate-300">{card.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-white">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Distribuição por perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {summary.roleDistribution.length > 0 ? (
              <ul className="space-y-2 text-sm text-slate-200">
                {summary.roleDistribution.map((entry) => (
                  <li key={entry.role} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2">
                    <span>{entry.role}</span>
                    <span className="font-semibold text-white">{entry.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-300">Nenhum perfil cadastrado.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Contestação de vídeos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingAppeals.length > 0 ? (
              pendingAppeals.map((appeal) => (
                <div key={appeal.id} className="space-y-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
                  <p className="text-base font-semibold text-white">{appeal.title}</p>
                  <p className="text-xs text-slate-300">
                    Enviado por {appeal.user.profile?.displayName ?? appeal.user.email} em{' '}
                    {appeal.blockAppealAt ? new Date(appeal.blockAppealAt).toLocaleString('pt-BR') : '—'}
                  </p>
                  <p className="text-xs text-slate-300">Motivo do bloqueio: {appeal.blockReason ?? 'Sem justificativa informada.'}</p>
                  <p className="text-sm text-slate-200">Contestação: {appeal.blockAppealMessage ?? 'Sem detalhes.'}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-300">Nenhuma contestação pendente no momento.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
