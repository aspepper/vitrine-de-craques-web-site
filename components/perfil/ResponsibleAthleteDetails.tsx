"use client"

import { Calendar, FileText, UserRound } from "lucide-react"

interface ResponsibleAthleteDetailsProps {
  athleteName?: string | null
  birthDate?: string | null
  gender?: string | null
  sport?: string | null
  modality?: string | null
  notes?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return null
  const normalized = value.trim()
  if (!normalized) return null
  const parts = normalized.split(/[\\/-]/)
  if (parts.length === 3) {
    const [day, month, year] = parts
    if (day.length === 4) {
      return `${month.padStart(2, "0")}/${year.padStart(4, "0")}`
    }
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year.padStart(4, "0")}`
  }

  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return normalized
  return date.toLocaleDateString("pt-BR")
}

export function ResponsibleAthleteDetails({
  athleteName,
  birthDate,
  gender,
  sport,
  modality,
  notes,
}: ResponsibleAthleteDetailsProps) {
  if (!athleteName && !sport && !modality && !notes && !birthDate) {
    return null
  }

  const formattedBirth = formatDate(birthDate)

  return (
    <article className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_28px_80px_-48px_rgba(99,102,241,0.55)]">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <UserRound className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold text-slate-900">Atleta acompanhado</h3>
          {athleteName ? (
            <p className="text-sm text-slate-500">{athleteName}</p>
          ) : null}
        </div>
      </header>
      <dl className="grid gap-3 text-sm text-slate-600 md:grid-cols-2">
        {formattedBirth ? (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3">
            <Calendar className="h-4 w-4 text-indigo-500" aria-hidden />
            <div>
              <dt className="text-xs uppercase tracking-[0.28em] text-slate-400">Nascimento</dt>
              <dd className="font-medium text-slate-800">{formattedBirth}</dd>
            </div>
          </div>
        ) : null}
        {gender ? (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 text-xs font-semibold uppercase">
              {gender.slice(0, 2)}
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.28em] text-slate-400">Gênero</dt>
              <dd className="font-medium text-slate-800">{gender}</dd>
            </div>
          </div>
        ) : null}
        {sport ? (
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 md:col-span-2">
            <FileText className="h-4 w-4 text-indigo-500" aria-hidden />
            <div>
              <dt className="text-xs uppercase tracking-[0.28em] text-slate-400">Esporte</dt>
              <dd className="font-medium text-slate-800">
                {sport}
                {modality ? ` • Modalidade: ${modality}` : ""}
              </dd>
            </div>
          </div>
        ) : null}
        {notes ? (
          <div className="md:col-span-2">
            <dt className="text-xs uppercase tracking-[0.28em] text-slate-400">Observações</dt>
            <dd className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
              {notes}
            </dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}
