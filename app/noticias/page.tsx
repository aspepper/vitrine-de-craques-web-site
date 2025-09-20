import Image from "next/image";
import Link from "next/link";

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
  }));

  const hasFetchedNews = items.length > 0;
  const isFallbackActive = !hasFetchedNews && loadError;
  const displayedNews = hasFetchedNews ? items : isFallbackActive ? fallbackItems : [];
  const showEmptyState = !hasFetchedNews && !loadError;
  const showLoadErrorMessage = isFallbackActive;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <header className="mb-12 space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
            Atualizações oficiais
          </p>
          <h1 className="text-3xl font-semibold text-slate-900">Notícias</h1>
          <p className="max-w-3xl text-base text-slate-600">
            Acompanhe as histórias mais recentes sobre atletas, bastidores e decisões estratégicas que
            movimentam a comunidade Vitrine de Craques.
          </p>
          {showLoadErrorMessage ? (
            <p className="text-sm font-medium text-amber-600">
              Não foi possível carregar as notícias em tempo real. Exibindo os dados disponíveis no momento.
            </p>
          ) : null}
        </header>

        {showEmptyState ? (
          <div className="rounded-3xl border border-dashed border-slate-300/80 bg-white/60 p-12 text-center shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)]">
            <p className="text-lg font-semibold italic text-slate-900">Nenhuma notícia encontrada</p>
            <p className="mt-2 text-sm text-slate-500">
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

              return (
                <article
                  key={news.id}
                  className="flex h-full flex-col justify-between rounded-[32px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] backdrop-blur transition-shadow hover:shadow-[0_30px_80px_-32px_rgba(15,23,42,0.35)]"
                >
                  <div className="space-y-5">
                    <div className="flex items-start gap-4">
                      <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-3xl bg-slate-900/90 shadow-[0_12px_24px_-18px_rgba(15,23,42,0.45)]">
                        <Image
                          src={coverImage}
                          alt={news.title}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <span className="inline-flex rounded-full bg-cyan-300/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-800">
                          {news.category ?? "Atualizações"}
                        </span>
                        <h2 className="text-lg font-semibold italic text-slate-900">{news.title}</h2>
                        <p className="text-xs font-medium text-slate-500">
                          {`${formatPublishedAt(news.publishedAt)} · ${getAuthorName(news.author)}`}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-slate-600">{excerpt}</p>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button
                      asChild
                      size="sm"
                      className="bg-emerald-500 px-6 text-sm font-semibold italic text-white hover:bg-emerald-500/90"
                    >
                      <Link href={`/noticias/${news.slug}`}>Ver completo</Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {hasFetchedNews && totalPages > 1 ? (
          <nav className="mt-12 flex flex-col gap-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium italic text-slate-600">
              Página {page} de {totalPages}
            </span>
            <div className="flex items-center gap-3">
              {page > 1 ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="border border-slate-200/80 bg-white/80 px-5 text-sm font-semibold text-slate-700 hover:bg-white"
                >
                  <Link href={`/noticias?page=${page - 1}`}>Anterior</Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="cursor-not-allowed border border-slate-200/80 bg-white/60 px-5 text-sm font-semibold text-slate-400"
                >
                  Anterior
                </Button>
              )}

              {page < totalPages ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="border border-slate-200/80 bg-white/80 px-5 text-sm font-semibold text-slate-700 hover:bg-white"
                >
                  <Link href={`/noticias?page=${page + 1}`}>Próxima</Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  className="cursor-not-allowed border border-slate-200/80 bg-white/60 px-5 text-sm font-semibold text-slate-400"
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
