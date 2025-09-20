import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { sampleGames } from "@/lib/sample-games"

interface PageProps {
  searchParams: { page?: string }
}

interface GameAuthor {
  name: string | null
  profile: { displayName: string | null } | null
}

interface GameItem {
  id: string
  title: string | null
  slug: string
  category: string | null
  excerpt: string | null
  content?: string | null
  coverImage: string | null
  date: string
  author: GameAuthor | null
}

interface GamesResponse {
  items: GameItem[]
  page: number
  total: number
  totalPages: number
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
const PAGE_SIZE = 9

async function getGames(page: number): Promise<GamesResponse> {
  const res = await fetch(`${baseUrl}/api/games?page=${page}&limit=${PAGE_SIZE}`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Falha ao carregar jogos")
  }

  return (await res.json()) as GamesResponse
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function getAuthorName(author: GameAuthor | null) {
  return author?.profile?.displayName ?? author?.name ?? "Equipe Vitrine"
}

const fallbackGames: GameItem[] = sampleGames.map((game) => ({
  id: game.id,
  title: game.title,
  slug: game.slug,
  category: game.category,
  excerpt: game.excerpt,
  content: game.content,
  coverImage: game.coverImage,
  date: game.date,
  author: {
    name: game.author.name,
    profile: { displayName: game.author.profile.displayName },
  },
}))

export default async function GamesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1

  let items: GameItem[] = []
  let totalPages = 1
  let loadError = false

  if (process.env.DATABASE_URL) {
    try {
      const data = await getGames(page)
      items = data.items
      totalPages = Math.max(1, data.totalPages)
    } catch (error) {
      console.error(error)
      loadError = true
    }
  } else {
    loadError = true
  }

  const hasFetchedGames = items.length > 0
  const isFallbackActive = !hasFetchedGames && loadError
  const displayedGames = hasFetchedGames ? items : isFallbackActive ? fallbackGames : []
  const showEmptyState = !hasFetchedGames && !loadError
  const showLoadErrorMessage = isFallbackActive

  if (isFallbackActive) {
    totalPages = 1
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Seleção editorial</p>
          <h1 className="text-3xl font-semibold text-slate-900">Games</h1>
          <p className="max-w-3xl text-base text-slate-600">
            Aqui vamos mostrar o segredo para chegar ao fim das campanhas com repertórios sólidos, análises profundas e histórias
            contadas por especialistas da imprensa.
          </p>
          {showLoadErrorMessage ? (
            <p className="text-sm font-medium text-amber-600">
              Não foi possível carregar os jogos do banco de dados. Exibindo conteúdo editorial para demonstração.
            </p>
          ) : null}
          {showEmptyState ? (
            <p className="text-sm text-slate-500">Nenhum jogo publicado até o momento.</p>
          ) : null}
        </header>

        <section className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {displayedGames.map((game) => (
            <Link key={game.slug} href={`/games/${game.slug}`} className="group">
              <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800/60 bg-slate-900 px-7 py-8 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.7)] transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_36px_80px_-36px_rgba(15,23,42,0.85)]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    {game.category ?? "Game"}
                  </span>
                  <span className="text-xs font-medium text-slate-500/80">{formatDate(game.date)}</span>
                </div>

                <h2 className="mt-6 text-2xl font-semibold text-slate-50 transition-colors duration-200 group-hover:text-white">
                  {game.title ?? "Jogo sem título"}
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {game.excerpt ?? "História em desenvolvimento. Confira os detalhes completos em breve."}
                </p>

                <div className="mt-auto flex items-center justify-between pt-8 text-sm text-slate-500/80">
                  <span>Por {getAuthorName(game.author)}</span>
                  <span className="flex items-center gap-2 font-medium text-emerald-200 transition duration-200 group-hover:gap-3 group-hover:text-emerald-100">
                    Ler mais
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </article>
            </Link>
          ))}
        </section>

        {totalPages > 1 ? (
          <nav className="mt-12 flex items-center justify-between">
            {page > 1 ? (
              <Button asChild variant="outline">
                <Link href={`/games?page=${page - 1}`}>Anterior</Link>
              </Button>
            ) : (
              <span />
            )}
            <p className="text-sm text-slate-500">
              Página {Math.min(page, totalPages)} de {totalPages}
            </p>
            {page < totalPages ? (
              <Button asChild variant="outline">
                <Link href={`/games?page=${page + 1}`}>Próxima</Link>
              </Button>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </main>
    </div>
  )
}
