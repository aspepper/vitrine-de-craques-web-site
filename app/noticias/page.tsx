import Link from "next/link";

import { SafeImage } from "@/components/media/SafeMedia";
import { ArticleActionBar } from "@/components/ArticleActionBar";
import { Button } from "@/components/ui/button";
import { ensureImage } from "@/lib/ensureImage";
import { sampleNews } from "@/lib/sample-news";

interface PageProps {
  searchParams: { page?: string };
}

interface NewsAuthor {
  name: string | null;
  profile: { displayName: string | null } | null;
}

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  coverImage: string | null;
  publishedAt: string;
  author: NewsAuthor | null;
  likesCount?: number;
  savesCount?: number;
}

interface NewsResponse {
  items: NewsItem[];
  page: number;
  total: number;
  totalPages: number;
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

const PAGE_SIZE = 21;

async function getNews(page: number): Promise<NewsResponse> {
  const res = await fetch(`${baseUrl}/api/noticias?page=${page}&limit=${PAGE_SIZE}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Falha ao carregar notícias");
  }

  return (await res.json()) as NewsResponse;
}

function formatPublishedAt(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getAuthorName(author: NewsAuthor | null) {
  return author?.profile?.displayName ?? author?.name ?? "Equipe Vitrine";
}

export default async function NoticiasPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;

  let items: NewsItem[] = [];
  let totalPages = 1;
  let loadError = false;

  if (process.env.DATABASE_URL) {
    try {
      const data = await getNews(page);
      items = data.items;
      totalPages = Math.max(1, data.totalPages);
    } catch (error) {
      console.error(error);
      loadError = true;
    }
  } else {
    loadError = true;
  }

  const fallbackItems: NewsItem[] = sampleNews.map((news) => ({
    id: news.slug,
    title: news.title,
    slug: news.slug,
    excerpt: news.excerpt,
    content: news.content,
    category: news.category,
    coverImage: news.coverImage,
    publishedAt: news.publishedAt,
    author: {
      name: news.author.name,
      profile: {
        displayName: news.author.profile.displayName,
      },
    },
    likesCount: 0,
    savesCount: 0,
  }));

  const hasFetchedNews = items.length > 0;
  const isFallbackActive = !hasFetchedNews && loadError;
  const displayedNews = hasFetchedNews ? items : isFallbackActive ? fallbackItems : [];
  const showEmptyState = !hasFetchedNews && !loadError;
  const showLoadErrorMessage = isFallbackActive;

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors">
      <main className="container mx-auto flex flex-1 flex-col gap-12 px-4 pb-24 pt-10 md:pt-12">
        <header className="space-y-6 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Atualizações oficiais
          </p>
          <h1 className="font-heading text-[44px] font-semibold leading-tight text-foreground md:text-[56px]">
            Notícias
          </h1>
            <p className="mx-auto max-w-3xl text-base text-muted-foreground md:mx-0">
              Acompanhe as histórias mais recentes sobre atletas, bastidores e decisões estratégicas que
              movimentam a comunidade Vitrine de Craques.
            </p>
          {showLoadErrorMessage ? (
            <p className="text-sm font-medium text-warning">
              Não foi possível carregar as notícias em tempo real. Exibindo os dados disponíveis no momento.
            </p>
          ) : null}
        </header>

        {showEmptyState ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-12 text-center shadow-lg">
            <p className="text-lg font-semibold italic text-foreground">Nenhuma notícia encontrada</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Assim que novas histórias forem publicadas pelos nossos jornalistas credenciados, elas aparecerão por aqui.
            </p>
          </div>
        ) : (
          <section className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {displayedNews.map((news) => {
              const coverImage = ensureImage(
                news.coverImage ?? "stadium.jpg",
                news.slug,
                "news-cover"
              );
              const excerpt = news.excerpt ?? news.content?.slice(0, 220)?.concat("...") ?? "";
              const actionBarId = news.slug || news.id;
              const likesCount = typeof news.likesCount === "number" ? news.likesCount : 0;
              const savesCount = typeof news.savesCount === "number" ? news.savesCount : 0;

              return (
                <article
                  key={news.id}
                  className="flex h-full flex-col justify-between rounded-[32px] border border-border/80 bg-card/90 p-6 shadow-lg backdrop-blur transition-shadow hover:shadow-xl"
                >
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-3xl bg-foreground/90 shadow-lg">
                        <SafeImage
                          src={coverImage}
                          alt={news.title}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <span className="inline-flex rounded-full bg-secondary/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-secondary-foreground">
                          {news.category ?? "Atualizações"}
                        </span>
                        <h2 className="text-lg font-semibold italic text-foreground">{news.title}</h2>
                        <p className="text-xs font-medium text-muted-foreground">
                          {`${formatPublishedAt(news.publishedAt)} · ${getAuthorName(news.author)}`}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <ArticleActionBar
                      itemId={actionBarId}
                      itemSlug={news.slug}
                      itemType="news"
                      shareUrl={`${baseUrl}/noticias/${news.slug}`}
                      commentHref={`/noticias/${news.slug}`}
                      metrics={{ likes: likesCount, saves: savesCount }}
                    />
                    <div className="flex justify-end">
                      <Button
                        asChild
                        size="sm"
                        className="bg-primary px-6 text-sm font-semibold italic text-primary-foreground hover:bg-primary/90"
                      >
                        <Link href={`/noticias/${news.slug}`}>Ver completo</Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {hasFetchedNews && totalPages > 1 ? (
          <nav className="mt-12 flex flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium italic text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-3">
              {page > 1 ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="border border-border/80 bg-card/80 px-5 text-sm font-semibold text-foreground hover:bg-card"
                >
                  <Link href={`/noticias?page=${page - 1}`}>Anterior</Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="cursor-not-allowed border border-border/80 bg-card/60 px-5 text-sm font-semibold text-muted-foreground"
                >
                  Anterior
                </Button>
              )}

              {page < totalPages ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="border border-border/80 bg-card/80 px-5 text-sm font-semibold text-foreground hover:bg-card"
                >
                  <Link href={`/noticias?page=${page + 1}`}>Próxima</Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="cursor-not-allowed border border-border/80 bg-card/60 px-5 text-sm font-semibold text-muted-foreground"
                >
                  Próxima
                </Button>
              )}
            </div>
          </nav>
        ) : null}
      </main>
    </div>
  );
}
