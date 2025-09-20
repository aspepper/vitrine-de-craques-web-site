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
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  date: string
  homeClubName: string
  awayClubName: string
  scoreHome: number | null
  scoreAway: number | null
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
  homeClubName: game.homeClub.name,
  awayClubName: game.awayClub.name,
  scoreHome: game.scoreHome,
  scoreAway: game.scoreAway,
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
        COALESCE(l.likes_count, 0) AS "likesCount",
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
    likesCount: 0,
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
      homeClub: { select: { name: true } },
      awayClub: { select: { name: true } },
    },
  })

  return games.map((game) => ({
    id: game.id,
    title: game.title,
    slug: game.slug,
    excerpt: game.excerpt,
    coverImage: game.coverImage,
    date: game.date.toISOString(),
    homeClubName: game.homeClub.name,
    awayClubName: game.awayClub.name,
    scoreHome: game.scoreHome,
    scoreAway: game.scoreAway,
  }))
}

export default async function HomePage() {
  const databaseConfigured = Boolean(process.env.DATABASE_URL)

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
      <div className="relative min-h-screen">
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

        <main className="relative z-10 space-y-16">
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
                    font-heading text-[34px] font-extrabold
                    italic leading-tight md:text-[48px]
                  "
                  >
                    Descubra talentos do Futebol
                  </h1>

                  <p className="mb-8 max-w-[62ch] text-[17px] leading-relaxed text-foreground/90 md:text-[18px]">
                    Vídeos 9:16 com moderação ativa, consentimento destacado
                    (ECA/LGPD) e conexão ética entre atletas, famílias, clubes e
                    agentes licenciados.
                  </p>

                  {/* CTAs principais */}
                  <div className="flex flex-wrap gap-4">
                    <Button
                      asChild
                      className="h-14 rounded-full px-8 text-[16px] font-semibold shadow-sm"
                    >
                      <Link href="/registrar-escolha-perfil">Registrar</Link>
                    </Button>

                    <Button
                      asChild
                      variant="ghost"
                      className="
                      h-14 rounded-full border border-black/10 bg-white/90
                      px-8 text-[16px]
                      font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
                      hover:bg-white
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
                "
                >
                  <iframe
                    className="absolute inset-0 h-full w-full"
                    src="https://www.youtube.com/embed/gOEPufmLuGs?si=M4-9z1_ZeSvm21Fn&modestbranding=1&rel=0&playsinline=1"
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
                  "
                  >
                    Filtros por clube/estado
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* DESTAQUES */}
          <section className="container space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-h2 section-title">Destaques</h2>
              {highlightsError ? (
                <p className="text-sm font-medium text-white/80">
                  Não foi possível carregar os vídeos em destaque agora.
                </p>
              ) : null}
            </div>
            {highlights.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
                      <Card className="overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.8)] transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_30px_80px_-36px_rgba(15,23,42,0.85)]">
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
                          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
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
              <div className="rounded-2xl border border-white/20 bg-white/80 p-8 text-center text-slate-700 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.4)]">
                <p className="font-semibold">
                  {highlightsError
                    ? 'Tente novamente em instantes. Estamos preparando os vídeos mais curtidos para você.'
                    : 'Nenhum vídeo em destaque disponível ainda.'}
                </p>
              </div>
            )}
          </section>

          {/* PRINCIPAIS NOTÍCIAS */}
          <section className="container space-y-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-h2 section-title">Principais notícias</h2>
              {newsError ? (
                <p className="text-sm font-medium text-white/80">
                  Exibindo curadoria editorial enquanto as notícias são carregadas.
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/85 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.75)] transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_36px_80px_-36px_rgba(15,23,42,0.9)]">
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
          </section>

          {/* GAMES */}
          <section className="container space-y-6 pb-16">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-h2 section-title">Games</h2>
              {gamesError ? (
                <p className="text-sm font-medium text-white/80">
                  Seleção editorial exibida enquanto sincronizamos os últimos resultados.
                </p>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
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
                    <Card className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/15 bg-slate-900/90 text-slate-100 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.8)] transition duration-200 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_36px_80px_-36px_rgba(15,23,42,0.95)]">
                      <div className="relative h-32 w-full">
                        <Image
                          src={cover}
                          alt={game.title}
                          fill
                          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 100vw"
                          className="object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200/90">
                            {formatDate(game.date, {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                      <CardContent className="flex flex-1 flex-col gap-3 p-4">
                        <h3 className="text-base font-semibold text-white line-clamp-2">
                          {game.title}
                        </h3>
                        <p className="text-sm text-slate-300 line-clamp-3">
                          {game.excerpt ?? 'Análise completa do confronto disponível no hub de games.'}
                        </p>
                        <div className="mt-auto space-y-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                          <p>
                            {game.homeClubName} x {game.awayClubName}
                          </p>
                          {game.scoreHome !== null && game.scoreAway !== null ? (
                            <p className="text-sm font-semibold text-emerald-200">
                              {game.scoreHome} x {game.scoreAway}
                            </p>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        </main>
        <ApiError />
      </div>
    )
}
