import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import prisma from "@/lib/db"
import { normalizeConfederationLogoUrl } from "@/lib/confederations"

interface PageProps {
  params: { slug: string }
}

interface ConfederationDetail {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  foundedAt: string | null
  purpose?: string | null
  currentPresident?: string | null
  officialStatement?: string | null
  officialStatementDate?: string | null
  clubs: { id: string; name: string; slug: string }[]
}

function formatDate(input?: string | null) {
  if (!input) return "—"
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return "—"
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date)
}

function getAcronym(name: string) {
  const normalized = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")

  return normalized.slice(0, 3).toUpperCase() || "CF"
}

async function getConfed(slug: string): Promise<ConfederationDetail> {
  const confed = await prisma.confederation.findUnique({
    where: { slug },
    include: {
      clubs: {
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  })

  if (!confed) {
    notFound()
  }

  return {
    id: confed.id,
    name: confed.name,
    slug: confed.slug,
    logoUrl: normalizeConfederationLogoUrl(confed.logoUrl),
    foundedAt: confed.foundedAt?.toISOString() ?? null,
    purpose: confed.purpose,
    currentPresident: confed.currentPresident,
    officialStatement: confed.officialStatement,
    officialStatementDate: confed.officialStatementDate?.toISOString() ?? null,
    clubs: confed.clubs,
  }
}

export default async function ConfederacaoDetalhePage({ params }: PageProps) {
  const confed = await getConfed(params.slug)
  const founded = formatDate(confed.foundedAt)
  const statementDate = formatDate(confed.officialStatementDate)
  const acronym = getAcronym(confed.name)
  const statementParagraphs = confed.officialStatement?.split(/\n{2,}/).filter(Boolean) ?? []

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="container mx-auto px-4 pb-24 pt-16 md:pt-20">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
          <Link
            href="/confederacoes"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            Voltar para confederações
          </Link>

          <section className="rounded-[32px] border border-white/70 bg-white/95 px-8 py-10 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-[28px] bg-slate-900/5 ring-1 ring-inset ring-slate-200">
              {confed.logoUrl ? (
                <div className="relative h-20 w-20">
                  <Image src={confed.logoUrl} alt={`Logotipo de ${confed.name}`} fill sizes="80px" className="object-contain" />
                </div>
              ) : (
                <span className="text-xl font-semibold text-slate-700">{acronym}</span>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Confederação</span>
                <h1 className="font-heading text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
                  {confed.name}
                </h1>
              </div>

              {confed.purpose && <p className="text-base text-slate-600 md:max-w-3xl">{confed.purpose}</p>}

              <dl className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Fundação</dt>
                  <dd className="text-base text-slate-600">{founded}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Presidente atual</dt>
                  <dd className="text-base text-slate-600">{confed.currentPresident ?? "—"}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">Último comunicado</dt>
                  <dd className="text-base text-slate-600">{statementDate}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Comunicado oficial</span>
            <h2 className="text-2xl font-semibold text-slate-900">Último comunicado na íntegra</h2>
            <p className="text-sm text-slate-500">
              Publicado em {statementDate}. Acompanhe abaixo o posicionamento completo divulgado pela entidade.
            </p>
          </div>

          <article className="space-y-4 rounded-[32px] border border-white/70 bg-white/95 px-8 py-10 text-base leading-relaxed text-slate-600 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)]">
            {statementParagraphs.length > 0 ? (
              statementParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p className="text-slate-400">Esta confederação ainda não publicou comunicado oficial.</p>
            )}
          </article>
        </section>

        {confed.clubs?.length ? (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Clubes em destaque</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {confed.clubs.map((club) => (
                <li key={club.id}>
                  <Link
                    href={`/clubes/${club.slug}`}
                    prefetch={false}
                    className="block rounded-2xl border border-white/70 bg-white/95 px-5 py-3 text-sm font-medium text-slate-600 shadow-[0_12px_32px_-20px_rgba(15,23,42,0.4)] transition hover:-translate-y-0.5 hover:text-slate-900 hover:shadow-[0_18px_40px_-18px_rgba(15,23,42,0.45)]"
                  >
                    {club.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        </div>
      </main>
    </div>
  )
}
