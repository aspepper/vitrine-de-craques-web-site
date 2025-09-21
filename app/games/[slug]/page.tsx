import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ensureImage } from "@/lib/ensureImage"
import { sampleGames } from "@/lib/sample-games"

interface PageProps {
  params: { slug: string }
}

interface GameAuthor {
  name: string | null
  profile: { displayName: string | null } | null
}

interface Game {
  id: string
  title: string | null
  slug: string
  category: string | null
  excerpt: string | null
  content: string | null
  coverImage: string | null
  date: string
  author: GameAuthor | null
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

async function getGame(slug: string): Promise<Game> {
  const res = await fetch(`${baseUrl}/api/games/${slug}`, { cache: "no-store" })
  if (!res.ok) {
    throw new Error("Game não encontrado")
  }
  return (await res.json()) as Game
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

function getAuthorName(author: GameAuthor | null) {
  return author?.profile?.displayName ?? author?.name ?? "Equipe Vitrine"
}

const fallbackGames = new Map(
  sampleGames.map((game) => [
    game.slug,
    {
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
    } satisfies Game,
  ])
)

export default async function GameDetalhePage({ params }: PageProps) {
  let game: Game | null = null

  if (process.env.DATABASE_URL) {
    try {
      game = await getGame(params.slug)
    } catch (error) {
      console.error(error)
    }
  }

  if (!game) {
    game = fallbackGames.get(params.slug) ?? null
  }

  if (!game) {
    notFound()
  }

  const heroImage = ensureImage(
    game.coverImage ??
      "https://images.unsplash.com/photo-1511519984179-62e3b6aa3a36?auto=format&fit=crop&w=1600&q=80&fm=webp",
    game.slug,
    "cover-image"
  )

  const contentParagraphs = (game.content ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-20 pt-10">
        <div className="mx-auto w-full max-w-5xl space-y-10">
          <Link
            href="/games"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            Voltar para games
          </Link>

          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Seleção editorial</p>
            <h1 className="text-3xl font-semibold text-slate-900">Games</h1>
          </header>

          <article className="space-y-10">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.85)]">
            <Image
              src={heroImage}
              alt={game.title ?? "Imagem do jogo"}
              width={1600}
              height={900}
              className="h-72 w-full object-cover md:h-[420px]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          </div>

          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                {game.category ?? "Game"}
              </span>
              <span className="text-sm font-medium text-slate-500">{formatDateTime(game.date)}</span>
            </div>
            <h2 className="mt-6 text-3xl font-semibold text-slate-900 md:text-4xl">{game.title ?? "Jogo sem título"}</h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">{game.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>Por {getAuthorName(game.author)}</span>
          </div>
            <Button
              asChild
              className="mt-8 bg-emerald-400 text-slate-900 hover:bg-emerald-300"
            >
              <a href="#conteudo">Ler mais</a>
            </Button>
          </section>

          {contentParagraphs.length > 0 ? (
            <section id="conteudo" className="space-y-6 text-base leading-relaxed text-slate-600">
              {contentParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </section>
          ) : null}
          </article>
        </div>
      </main>
    </div>
  )
}
