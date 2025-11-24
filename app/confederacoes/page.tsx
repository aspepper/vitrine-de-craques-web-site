import Link from "next/link"

import { SafeImage } from "@/components/media/SafeMedia"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/db"
import { normalizeConfederationLogoUrl } from "@/lib/confederations"

interface PageProps {
  searchParams: { page?: string }
}

interface Confederation {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  foundedAt: string | null
  purpose?: string | null
  currentPresident?: string | null
  officialStatementDate?: string | null
}

interface ConfederationsResponse {
  items: Confederation[]
  totalPages: number
  page: number
  total: number
}

const PAGE_SIZE = 12

function formatDate(input?: string | null) {
  if (!input) return "—"
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) {
    return "—"
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
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

async function getConfeds(page: number, limit: number): Promise<ConfederationsResponse> {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 50) : PAGE_SIZE
  const total = await prisma.confederation.count()
  const totalPages = Math.max(1, Math.ceil(total / safeLimit))
  const safePage = Number.isFinite(page) && page > 0 ? Math.min(Math.floor(page), totalPages) : 1
  const skip = (safePage - 1) * safeLimit

  const confederations = await prisma.confederation.findMany({
    skip,
    take: safeLimit,
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      foundedAt: true,
      purpose: true,
      currentPresident: true,
      officialStatementDate: true,
    },
  })

  const items: Confederation[] = confederations.map((confed) => ({
    id: confed.id,
    name: confed.name,
    slug: confed.slug,
    logoUrl: normalizeConfederationLogoUrl(confed.logoUrl),
    foundedAt: confed.foundedAt?.toISOString() ?? null,
    purpose: confed.purpose,
    currentPresident: confed.currentPresident,
    officialStatementDate: confed.officialStatementDate?.toISOString() ?? null,
  }))

  return {
    items,
    page: safePage,
    total,
    totalPages,
  }
}

export default async function ConfederacoesPage({ searchParams }: PageProps) {
  const requestedPage = Number(searchParams.page) || 1
  const { items, totalPages, page } = await getConfeds(requestedPage, PAGE_SIZE)

  return (
    <div className="min-h-screen bg-background transition-colors">
      <main className="container mx-auto flex flex-col gap-12 px-4 pb-24 pt-10 md:pt-12">
        <header className="space-y-6 text-center md:text-left">
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Instituições
            </span>
            <h1 className="font-heading text-[44px] font-semibold leading-tight text-foreground md:text-[56px]">
              Confederações
            </h1>
            <p className="mx-auto text-base text-muted-foreground md:mx-0 md:max-w-2xl md:text-left">
              Conheça as entidades que estruturam o futebol brasileiro, acompanhe os dados oficiais e leia os últimos
              comunicados publicados por cada confederação.
            </p>
          </div>
        </header>

          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {items.map((confed) => {
              const founded = formatDate(confed.foundedAt)
              const lastStatement = formatDate(confed.officialStatementDate)
              const acronym = getAcronym(confed.name)

              return (
                <Link
                  key={confed.id}
                  href={`/confederacoes/${confed.slug}`}
                  prefetch={false}
                  className="group"
                >
                  <article className="flex h-full flex-col gap-6 rounded-[32px] border border-border/80 bg-card/90 px-8 py-10 text-center shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_32px_72px_-32px_rgba(15,23,42,0.45)]">
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[24px] bg-muted ring-1 ring-inset ring-border/70">
                      {confed.logoUrl ? (
                        <div className="relative h-16 w-16">
                          <SafeImage
                            src={confed.logoUrl}
                            alt={`Logotipo de ${confed.name}`}
                            fill
                            sizes="64px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-lg font-semibold text-foreground">{acronym}</span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-lg font-semibold text-foreground">{confed.name}</h2>
                      {confed.purpose && (
                        <p className="text-sm text-muted-foreground [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] overflow-hidden">
                          {confed.purpose}
                        </p>
                      )}
                    </div>

                    <dl className="grid gap-4 text-sm text-muted-foreground">
                      <div className="space-y-1">
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">Fundação</dt>
                        <dd>{founded}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">Presidente</dt>
                        <dd>{confed.currentPresident ?? "—"}</dd>
                      </div>
                      <div className="space-y-1">
                        <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground/80">Último comunicado</dt>
                        <dd>{lastStatement}</dd>
                      </div>
                    </dl>
                  </article>
                </Link>
              )
            })}

            {items.length === 0 && (
              <div className="col-span-full rounded-[32px] border border-dashed border-border/70 bg-card/90 p-12 text-center text-muted-foreground shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
                Nenhuma confederação encontrada.
              </div>
            )}
          </section>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              {page > 1 ? (
                <Button
                  asChild
                  size="md"
                  variant="ghost"
                  className="border border-border/70 bg-card/80 px-8 text-foreground hover:bg-card"
                >
                  <Link href={`/confederacoes?page=${page - 1}`} prefetch={false}>
                    Anterior
                  </Link>
                </Button>
              ) : (
                <Button disabled size="md" variant="ghost" className="border border-border/50 bg-muted px-8 text-muted-foreground">
                  Anterior
                </Button>
              )}

              <span className="text-sm font-medium text-muted-foreground">
                Página {page} de {totalPages}
              </span>

              {page < totalPages ? (
                <Button
                  asChild
                  size="md"
                  variant="ghost"
                  className="border border-border/70 bg-card/80 px-8 text-foreground hover:bg-card"
                >
                  <Link href={`/confederacoes?page=${page + 1}`} prefetch={false}>
                    Próxima
                  </Link>
                </Button>
              ) : (
                <Button disabled size="md" variant="ghost" className="border border-border/50 bg-muted px-8 text-muted-foreground">
                  Próxima
                </Button>
              )}
            </div>
          )}
      </main>
    </div>
  )
}
