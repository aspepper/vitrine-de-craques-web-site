import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import ApiError from '@/components/ApiError'
import prisma from '@/lib/db'
import { logError } from '@/lib/error'
import { ensureImage } from '@/lib/ensureImage'
import { sampleNews } from '@/lib/sample-news'
import { sampleGames } from '@/lib/sample-games'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface HighlightCardData {
  id: string
  title: string
  videoUrl: string
  thumbnailUrl: string | null
  likesCount: number
  authorName: string | null
}

interface NewsCardData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  publishedAt: string
  authorName: string | null
}

interface GameCardData {
  id: string
  title: string | null
  slug: string
  excerpt: string | null
  coverImage: string | null
  date: string
  category: string | null
  authorName: string | null
}

function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('pt-BR', options ?? {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date))
}

const numberFormatter = new Intl.NumberFormat('pt-BR')

const fallbackNews: NewsCardData[] = sampleNews.slice(0, 4).map((news) => ({
  id: news.slug,
  title: news.title,
  slug: news.slug,
  excerpt: news.excerpt,
  coverImage: news.coverImage,
  publishedAt: news.publishedAt,
  authorName: news.author.profile.displayName ?? news.author.name,
}))

const fallbackGames: GameCardData[] = sampleGames.slice(0, 4).map((game) => ({
  id: game.id,
  title: game.title,
  slug: game.slug,
  excerpt: game.excerpt,
  coverImage: game.coverImage,
  date: game.date,
  category: game.category,
  authorName: game.author.profile.displayName ?? game.author.name,
}))

async function loadHighlights(): Promise<HighlightCardData[]> {
  const likeTableResult = await prisma.$queryRaw<
    { exists: boolean }[]
  >`SELECT to_regclass('public."VideoLike"') IS NOT NULL AS exists`
  const likeTableExists = likeTableResult[0]?.exists ?? false

  if (likeTableExists) {
    const highlightRows = await prisma.$queryRaw<
      {
        id: string
        title: string
        videoUrl: string
        thumbnailUrl: string | null
        likesCount: bigint | number
        authorName: string | null
      }[]
    >`
      SELECT
        v.id,
        v.title,
        v."videoUrl" AS "videoUrl",
        v."thumbnailUrl" AS "thumbnailUrl",
        COALESCE(l.likes_count, v."likesCount", 0) AS "likesCount",
        COALESCE(p."displayName", u.name) AS "authorName"
      FROM "Video" v
      LEFT JOIN (
        SELECT "videoId", COUNT(*) AS likes_count
        FROM "VideoLike"
        GROUP BY "videoId"
      ) l ON l."videoId" = v.id
      LEFT JOIN "User" u ON u.id = v."userId"
      LEFT JOIN "Profile" p ON p."userId" = u.id
      ORDER BY likes_count DESC, v."createdAt" DESC
      LIMIT 4
    `

    return highlightRows.map((row) => ({
      id: row.id,
      title: row.title,
      videoUrl: row.videoUrl,
      thumbnailUrl: row.thumbnailUrl,
      likesCount: Number(row.likesCount ?? 0),
      authorName: row.authorName,
    }))
  }

  const videos = await prisma.video.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
    where: { visibilityStatus: 'PUBLIC' },
    include: {
      user: {
        select: {
          name: true,
          profile: { select: { displayName: true } },
        },
      },
    },
  })

  return videos.map((video) => ({
    id: video.id,
    title: video.title,
    videoUrl: video.videoUrl,
    thumbnailUrl: video.thumbnailUrl ?? null,
    likesCount: video.likesCount,
    authorName: video.user?.profile?.displayName ?? video.user?.name ?? null,
  }))
}

async function loadLatestNews(): Promise<NewsCardData[]> {
  const news = await prisma.news.findMany({
    take: 4,
    orderBy: { publishedAt: 'desc' },
    include: {
      author: {
        select: {
          name: true,
          profile: { select: { displayName: true } },
        },
      },
    },
  })

  return news.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    coverImage: item.coverImage,
    publishedAt: item.publishedAt.toISOString(),
    authorName: item.author?.profile?.displayName ?? item.author?.name ?? null,
  }))
}

async function loadLatestGames(): Promise<GameCardData[]> {
  const games = await prisma.game.findMany({
    take: 4,
    orderBy: { date: 'desc' },
    include: {
      author: {
        select: {
          name: true,
          profile: { select: { displayName: true } },
        },
      },
    },
  })

  return games.map((game) => ({
    id: game.id,
    title: game.title,
    slug: game.slug,
    excerpt: game.excerpt,
    coverImage: game.coverImage,
    date: game.date.toISOString(),
    category: game.category ?? null,
    authorName: game.author?.profile?.displayName ?? game.author?.name ?? null,
  }))
}

export default async function HomePage() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL)
  const session = await getServerSession(authOptions)
  const isAuthenticated = Boolean(session)

  let highlights: HighlightCardData[] = []
  let latestNews: NewsCardData[] = []
  let latestGames: GameCardData[] = []
  let highlightsError = !databaseConfigured
  let newsError = !databaseConfigured
  let gamesError = !databaseConfigured

  if (databaseConfigured) {
    try {
      highlights = await loadHighlights()
      highlightsError = false
    } catch (error) {
      await logError(error, 'AO CARREGAR DESTAQUES', { scope: 'HomePage' })
      highlightsError = true
    }

    try {
      latestNews = await loadLatestNews()
      newsError = false
    } catch (error) {
      await logError(error, 'AO CARREGAR NOTICIAS HOME', { scope: 'HomePage' })
      newsError = true
    }

    try {
      latestGames = await loadLatestGames()
      gamesError = false
    } catch (error) {
      await logError(error, 'AO CARREGAR GAMES HOME', { scope: 'HomePage' })
      gamesError = true
    }
  }

  if (newsError) {
    latestNews = fallbackNews
  }

  if (gamesError) {
    latestGames = fallbackGames
  }

  return (
    <div className="relative min-h-screen font-heading">
        {/* BACKGROUND otimizado */}
        <div className="pointer-events-none absolute inset-0 -z-10 md:fixed">
          <Image
            src="/stadium.jpg" // ou stadium@1920.webp
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        {/* Overlays: clareia topo e funde com o footer */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-72 bg-gradient-to-b from-transparent to-[#0B1E3A]/70" />

        <main className="relative z-10 space-y-16 pb-16">
          {/* HERO / BANNER */}
          <section className="container pt-2 md:pt-4">
            <div
              className="
              rounded-[28px]
              bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.92))] p-6
              shadow-[0_8px_32px_rgba(0,0,0,0.25)]
              ring-1 ring-black/10
              backdrop-blur-[2px]
              md:p-8
              dark:border-white/10
              dark:bg-[linear-gradient(180deg,rgba(6,12,24,0.94),rgba(8,16,30,0.9))]
              dark:shadow-[0_28px_88px_-36px_rgba(1,5,15,0.9)]
              dark:ring-white/10
            "
            >
              {/* Topo do banner: texto à esquerda e vídeo à direita */}
              <div className="grid items-start gap-8 md:grid-cols-[1fr,560px]">
                {/* Texto + CTAs */}
                <div>
                  {/* Título display menor */}
                  <h1
                    className="
                    mb-4
                    font-heading text-[34px] font-black
                    italic leading-tight tracking-[0.01em] md:text-[48px]
                  "
                  >
                    Vitrine de Craques
                  </h1>

                  <p
                    className="
                    mb-8 max-wx-[62ch] text-[17px]
                    font-heading font-black italic leading-relaxed text-foreground/90 md:text-[18px]
                  "
                  >
                    Seu sonho começa aqui. Mostre o seu talento.
                  </p>

                  {/* CTAs principais */}
                  <div className="flex flex-wrap gap-4">
                    <Button
                      asChild
                      variant={isAuthenticated ? 'secondary' : undefined}
                      className="h-14 rounded-full px-8 text-[16px] font-semibold shadow-sm"
                    >
                      <Link href={isAuthenticated ? '/perfil' : '/registrar-escolha-perfil'}>
                        {isAuthenticated ? 'Perfil' : 'Cadastre-se'}
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="ghost"
                      className="
                      h-14 rounded-full border border-black/10 bg-white/90
                      px-8 text-[16px]
                      font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
                      hover:bg-white
                      dark:border-white/20 dark:bg-white/10
                      dark:text-foreground dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]
                      dark:hover:bg-white/20
                    "
                    >
                      <Link href="/feed">Explorar vídeos</Link>
                    </Button>
                  </div>
                </div>

                {/* Vídeo MAIS ALTO */}
                <div
                  className="
                  relative aspect-[16/9] w-full
                  self-start overflow-hidden
                  rounded-[28px] bg-black/90
                  shadow-[0_8px_32px_rgba(0,0,0,0.18)]
                  ring-1
                  ring-black/10 md:-mt-2
                  dark:bg-black
                  dark:shadow-[0_18px_64px_rgba(0,0,0,0.55)]
                  dark:ring-white/10
                "
                >
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src="https://youtu.be/pA920Ou_yDE?si=vtHWXav7bMOBl5U0"
                    title="Vitrine de Craques — vídeo de apresentação"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Faixa de chips ocupando toda a largura do banner */}
              <div className="mt-8 w-full">
                <div className="flex w-full flex-wrap items-center justify-between gap-4">
                  <span
                    className="
                    inline-flex h-11 items-center whitespace-nowrap rounded-full
                    border border-black/10
                    bg-white/90 px-5 text-foreground/90
                    shadow-[0_1px_0_rgba(0,0,0,0.05)]
                    dark:border-white/15 dark:bg-white/10
                    dark:text-foreground dark:shadow-[0_1px_0_rgba(255,255,255,0.08)]
                  "
                  >
                    Upload de até 10s
                  </span>
                  <span
                    className="
                    inline-flex h-11 items-center whitespace-nowrap rounded-full
                    border border-black/10
                    bg-white/90 px-5 text-foreground/90
                    shadow-[0_1px_0_rgba(0,0,0,0.05)]
                    dark:border-white/15 dark:bg-white/10
                    dark:text-foreground dark:shadow-[0_1px_0_rgba(255,255,255,0.08)]
                  "
                  >
                    Autoplay por visibilidade
                  </span>
                  <span
                    className="
                    inline-flex h-11 items-center whitespace-nowrap rounded-full
                    border border-black/10
                    bg-white/90 px-5 text-foreground/90
                    shadow-[0_1px_0_rgba(0,0,0,0.05)]
                    dark:border-white/15 dark:bg-white/10
                    dark:text-foreground dark:shadow-[0_1px_0_rgba(255,255,255,0.08)]
                  "
                  >
                    Denunciar conteúdo
                  </span>
                  <span
                    className="
                    inline-flex h-11 items-center whitespace-nowrap rounded-full
                    border border-black/10
                    bg-white/90 px-5 text-foreground/90
                    shadow-[0_1px_0_rgba(0,0,0,0.05)]
                    dark:border-white/15 dark:bg-white/10
                    dark:text-foreground dark:shadow-[0_1px_0_rgba(255,255,255,0.08)]
                  "
                  >
                    Filtros por clube/estado
                  </span>
                </div>

                <div className="mt-6 flex justify-center">
                  <Button
                    asChild
                    className="h-12 rounded-full bg-emerald-600 px-8 text-base font-semibold text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.8)] transition-colors hover:bg-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 dark:bg-emerald-500 dark:hover:bg-emerald-400"
                  >
                    <a
                      href="https://play.google.com/store/apps/details?id=com.vitrinedecraques.app"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Baixar app Vitrine de Craques
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* DESTAQUES */}
          <section className="container">
            <div className="rounded-[36px] border border-white/70 bg-white/92 p-8 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.65)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-h2 section-title text-slate-900">Destaques</h2>
                <div className="flex items-center gap-4">
                  {highlightsError ? (
                    <p className="text-sm font-medium text-slate-600">
                      Não foi possível carregar os vídeos em destaque agora.
                    </p>
                  ) : null}
                  <Link
                    href="/atletas"
                    className="text-sm font-semibold text-emerald-600 underline-offset-4 transition hover:text-emerald-700 hover:underline"
                  >
                    Ver mais...
                  </Link>
                </div>
              </div>
              {highlights.length > 0 ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {highlights.map((video) => {
                    const thumbnail = video.thumbnailUrl
                      ? ensureImage(video.thumbnailUrl, video.id, 'video-thumbnail')
                      : '/stadium.jpg'

                    return (
                      <Link
                        key={video.id}
                        href={`/player/${video.id}`}
                        className="group"
                      >
                      <Card className="overflow-hidden rounded-2xl border border-white/30 bg-white/90 shadow-[0_24px_72px_-44px_rgba(15,23,42,0.75)] transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_32px_84px_-40px_rgba(15,23,42,0.85)]">
                        <div className="relative h-40 overflow-hidden">
                          <Image
                            src={thumbnail}
                            alt={video.title}
                            fill
                            sizes="(min-width: 768px) 25vw, 100vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-2 left-2 flex flex-col gap-1 text-white drop-shadow">
                            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
                              {numberFormatter.format(video.likesCount)} curtidas
                            </span>
                            <span className="text-sm font-semibold leading-tight line-clamp-2">
                              {video.title}
                            </span>
                          </div>
                        </div>
                        <CardContent className="flex flex-col gap-2 p-4">
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Vídeo em destaque
                          </span>
                          <p className="text-sm text-slate-700">
                            {video.authorName ?? 'Autor desconhecido'}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
                </div>
              ) : (
                <div className="mt-8 rounded-2xl border border-dashed border-emerald-200/80 bg-white/70 p-8 text-center text-slate-600 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.4)]">
                  <p className="font-semibold">
                    {highlightsError
                      ? 'Tente novamente em instantes. Estamos preparando os vídeos mais curtidos para você.'
                      : 'Nenhum vídeo em destaque disponível ainda.'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* PRINCIPAIS NOTÍCIAS */}
          <section className="container">
            <div className="rounded-[36px] border border-white/70 bg-white/92 p-8 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.65)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-h2 section-title text-slate-900">Principais notícias</h2>
                <div className="flex items-center gap-4">
                  {newsError ? (
                    <p className="text-sm font-medium text-slate-600">
                      Exibindo curadoria editorial enquanto as notícias são carregadas.
                    </p>
                  ) : null}
                  <Link
                    href="/noticias"
                    className="text-sm font-semibold text-emerald-600 underline-offset-4 transition hover:text-emerald-700 hover:underline"
                  >
                    Ver mais...
                  </Link>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {latestNews.map((news) => {
                  const cover = news.coverImage
                    ? ensureImage(news.coverImage, news.slug, 'news-cover')
                    : '/stadium.jpg'

                  return (
                    <Link
                      key={news.id}
                      href={`/noticias/${news.slug}`}
                      className="group"
                    >
                      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/30 bg-white/90 shadow-[0_28px_72px_-44px_rgba(15,23,42,0.75)] transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_36px_88px_-40px_rgba(15,23,42,0.85)]">
                        <div className="relative h-32 w-full">
                          <Image
                            src={cover}
                            alt={news.title}
                            fill
                            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 100vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
                              {formatDate(news.publishedAt, {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <CardContent className="flex flex-1 flex-col gap-3 p-4">
                          <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
                            {news.title}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-3">
                            {news.excerpt ?? 'Conteúdo exclusivo da redação da Vitrine de Craques.'}
                          </p>
                          <p className="mt-auto text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                            {news.authorName ?? 'Equipe Vitrine'}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>

          {/* GAMES */}
          <section className="container pb-0">
            <div className="rounded-[36px] border border-white/70 bg-white/92 p-8 shadow-[0_32px_80px_-48px_rgba(15,23,42,0.65)] backdrop-blur">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-h2 section-title text-slate-900">Games</h2>
                <div className="flex items-center gap-4">
                  {gamesError ? (
                    <p className="text-sm font-medium text-slate-600">
                      Seleção editorial exibida enquanto sincronizamos os últimos resultados.
                    </p>
                  ) : null}
                  <Link
                    href="/games"
                    className="text-sm font-semibold text-emerald-600 underline-offset-4 transition hover:text-emerald-700 hover:underline"
                  >
                    Ver mais...
                  </Link>
                </div>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {latestGames.map((game) => {
                  const cover = game.coverImage
                    ? ensureImage(game.coverImage, game.slug, 'game-cover')
                    : '/stadium.jpg'

                  return (
                    <Link
                      key={game.id}
                      href={`/games/${game.slug}`}
                      className="group"
                    >
                      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/30 bg-white text-slate-900 shadow-[0_28px_72px_-44px_rgba(15,23,42,0.55)] transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_36px_88px_-40px_rgba(15,23,42,0.6)]">
                        <div className="relative h-32 w-full">
                          <Image
                            src={cover}
                            alt={game.title ?? 'Imagem do jogo'}
                            fill
                            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 100vw"
                            className="object-cover"
                          />
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                              {formatDate(game.date, {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <CardContent className="flex flex-1 flex-col gap-3 p-4">
                          <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
                            {game.title ?? 'Jogo sem título'}
                          </h3>
                          <p className="text-sm text-slate-600 line-clamp-3">
                            {game.excerpt ?? 'Análise completa do confronto disponível no hub de games.'}
                          </p>
                          <div className="mt-auto space-y-1 text-xs">
                            {game.category ? (
                              <p className="font-semibold uppercase tracking-[0.16em] text-emerald-700">
                                {game.category}
                              </p>
                            ) : null}
                            <p className="text-slate-500">
                              Por {game.authorName ?? 'Equipe Vitrine'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        </main>
        <ApiError />
      </div>
    )
}
