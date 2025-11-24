import Link from "next/link"
import { notFound } from "next/navigation"
import { CommentItemType } from "@prisma/client"

import { SafeImage } from "@/components/media/SafeMedia"
import { ArticleInteractive } from "@/components/articles/ArticleInteractive"
import { ensureImage } from "@/lib/ensureImage"
import { sampleGames } from "@/lib/sample-games"
import { fetchCommentThreads } from "@/lib/comments"
import type { CommentThread } from "@/types/comments"

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
  likesCount: number
  savesCount: number
  commentsCount: number
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
      likesCount: 0,
      savesCount: 0,
      commentsCount: 0,
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
      "/stadium.jpg",
    game.slug,
    "cover-image"
  )

  const contentParagraphs = (game.content ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const articleBody = contentParagraphs.length > 0 ? (
    <section className="space-y-6 text-base leading-relaxed text-muted-foreground">
      {contentParagraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </section>
  ) : (
    <section className="text-base leading-relaxed text-muted-foreground">
      <p>{game.content ?? "Conteúdo indisponível no momento."}</p>
    </section>
  )

  const initialComments: CommentThread[] = process.env.DATABASE_URL
    ? await fetchCommentThreads(CommentItemType.GAME, game.slug)
    : []

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors">
      <main className="container mx-auto flex-grow px-4 pb-20 pt-10">
        <div className="mx-auto w-full max-w-5xl space-y-10">
          <Link
            href="/games"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <span aria-hidden>←</span>
            Voltar para games
          </Link>

          <header className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">Seleção editorial</p>
            <h1 className="text-3xl font-semibold text-foreground">Games</h1>
          </header>

          <article className="space-y-10">
            <div className="relative overflow-hidden rounded-3xl bg-foreground shadow-xl transition-colors">
              <SafeImage
                src={heroImage}
                alt={game.title ?? "Imagem do jogo"}
                width={1600}
                height={900}
                className="h-72 w-full object-cover md:h-[420px]"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
            </div>

            <section className="rounded-3xl border border-border bg-card p-8 shadow-lg transition-colors">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {game.category ?? "Game"}
                </span>
                <span className="text-sm font-medium text-muted-foreground">{formatDateTime(game.date)}</span>
              </div>
              <h2 className="mt-6 text-3xl font-semibold text-foreground md:text-4xl">{game.title ?? "Jogo sem título"}</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{game.excerpt}</p>
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>Por {getAuthorName(game.author)}</span>
              </div>
              <div className="mt-8 space-y-8">
                <ArticleInteractive
                  articleSlug={game.slug}
                  shareUrl={`${baseUrl}/games/${game.slug}`}
                  itemType="game"
                  storageKeyPrefix="vitrine:games:comments"
                  initialComments={initialComments}
                  initialMetrics={{
                    likes: game.likesCount,
                    saves: game.savesCount,
                    comments: game.commentsCount,
                  }}
                  labels={{
                    commentDescription: "Compartilhe descobertas e memórias sobre este game.",
                    emptyStateMessage: "Seja o primeiro a comentar este game e iniciar a conversa.",
                  }}
                >
                  {articleBody}
                </ArticleInteractive>
              </div>
            </section>
          </article>
        </div>
      </main>
    </div>
  )
}
