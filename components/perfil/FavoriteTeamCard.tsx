"use client"

import { MapPin, Shield, Sparkles, Trophy } from "lucide-react"

export interface FavoriteTeamInfo {
  id: string
  clube: string
  sigla: string
  apelido: string
  mascote: string
  divisao: string
  cidade: string
  estado: string
  fundacao: number | null
  maiorIdolo: string
}

interface FavoriteTeamCardProps {
  team: FavoriteTeamInfo
}

export function FavoriteTeamCard({ team }: FavoriteTeamCardProps) {
  return (
    <article className="flex flex-col gap-6 rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-[0_32px_90px_-48px_rgba(14,116,144,0.55)] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_36px_90px_-48px_rgba(8,47,73,0.85)]">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-600 dark:bg-sky-500/15 dark:text-sky-200">
          <Shield className="h-4 w-4" aria-hidden />
          Clube do coração
        </div>
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="font-heading text-2xl font-semibold text-slate-900 dark:text-slate-100">
            {team.clube}
          </h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-slate-500 dark:bg-slate-800/70 dark:text-slate-200">
            {team.sigla}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {team.apelido}
          {team.mascote ? ` • Mascote: ${team.mascote}` : ""}
        </p>
      </header>
      <dl className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.6)] dark:bg-slate-800/60">
          <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            <MapPin className="h-4 w-4 text-sky-500 dark:text-sky-300" aria-hidden /> Localização
          </dt>
          <dd className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
            {team.cidade} - {team.estado}
          </dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.6)] dark:bg-slate-800/60">
          <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            <Trophy className="h-4 w-4 text-emerald-500 dark:text-emerald-300" aria-hidden /> Fundação
          </dt>
          <dd className="mt-2 font-semibold text-slate-800 dark:text-slate-100">
            {team.fundacao ? `${team.fundacao}` : "Ano não informado"}
          </dd>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.6)] dark:bg-slate-800/60 md:col-span-2">
          <dt className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
            <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-300" aria-hidden /> Maior ídolo
          </dt>
          <dd className="mt-2 font-semibold text-slate-800 dark:text-slate-100">{team.maiorIdolo}</dd>
          <p className="mt-3 text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Divisão atual: {team.divisao}</p>
        </div>
      </dl>
    </article>
  )
}
