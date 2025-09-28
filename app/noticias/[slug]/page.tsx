import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { NewsArticleInteractive } from "@/components/news/NewsArticleInteractive";
import prisma from "@/lib/db";
import { ensureImage } from "@/lib/ensureImage";
import { getSampleNewsComments } from "@/lib/sample-news-comments";
import { sampleNews } from "@/lib/sample-news";

interface PageProps {
  params: { slug: string };
}

interface ArticleData {
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  coverImage: string | null;
  publishedAt: Date;
  authorName: string;
  likesCount: number;
  savesCount: number;
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

function formatPublishedAt(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function mapSampleArticle(slug: string): ArticleData | null {
  const sample = sampleNews.find((news) => news.slug === slug);
  if (!sample) {
    return null;
  }

  return {
    title: sample.title,
    slug: sample.slug,
    excerpt: sample.excerpt,
    content: sample.content,
    category: sample.category,
    coverImage: sample.coverImage,
    publishedAt: new Date(sample.publishedAt),
    authorName: sample.author.profile.displayName,
    likesCount: 0,
    savesCount: 0,
  };
}

async function fetchArticle(slug: string): Promise<ArticleData | null> {
  if (!process.env.DATABASE_URL) {
    return mapSampleArticle(slug);
  }

  try {
    const article = await prisma.news.findUnique({
      where: { slug },
      select: {
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        category: true,
        coverImage: true,
        publishedAt: true,
        likesCount: true,
        savesCount: true,
        author: {
          select: {
            name: true,
            profile: true,
          },
        },
      },
    });

    if (!article) {
      return mapSampleArticle(slug);
    }

    return {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      coverImage: article.coverImage,
      publishedAt: article.publishedAt,
      authorName: article.author?.profile?.displayName ?? article.author?.name ?? "Equipe Vitrine",
      likesCount: article.likesCount,
      savesCount: article.savesCount,
    };
  } catch (error) {
    console.error(error);
    return mapSampleArticle(slug);
  }
}

export default async function NoticiaDetalhePage({ params }: PageProps) {
  const article = await fetchArticle(params.slug);

  if (!article) {
    notFound();
  }

  const heroImage = ensureImage(
    article.coverImage ?? "https://images.unsplash.com/photo-1511519984179-62e3b6aa3a36?auto=format&fit=crop&w=1920&q=80&fm=webp",
    article.slug,
    "news-hero"
  );

  const paragraphs = article.content?.split(/\r?\n\r?\n/).filter(Boolean) ?? [];
  const initialComments = getSampleNewsComments(article.slug);

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <Link
            href="/noticias"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <span aria-hidden>←</span>
            Voltar para notícias
          </Link>

          <article className="w-full space-y-8 rounded-[40px] border border-border/70 bg-card/90 p-8 shadow-xl backdrop-blur">
            <header className="space-y-6">
              <span className="inline-flex rounded-full bg-secondary/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-secondary-foreground">
                {article.category ?? "Atualizações"}
              </span>
              <h1 className="text-4xl font-semibold italic text-foreground">{article.title}</h1>
              {article.excerpt ? (
                <p className="text-base italic text-muted-foreground">{article.excerpt}</p>
              ) : null}
              <p className="text-sm font-medium text-muted-foreground">
                {`${formatPublishedAt(article.publishedAt)} · ${article.authorName}`}
              </p>
            </header>

            <div className="relative h-[420px] w-full overflow-hidden rounded-[32px] bg-foreground/80 shadow-lg">
              <Image src={heroImage} alt={article.title} fill className="object-cover" priority />
            </div>

            <NewsArticleInteractive
              key={article.slug}
              articleSlug={article.slug}
              shareUrl={`${baseUrl}/noticias/${article.slug}`}
              initialComments={initialComments}
              initialMetrics={{ likes: article.likesCount, saves: article.savesCount }}
            >
              <div className="space-y-6 text-base leading-relaxed text-foreground">
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  <p>{article.content ?? "Conteúdo indisponível no momento."}</p>
                )}
              </div>
            </NewsArticleInteractive>
          </article>
        </div>
      </main>
    </div>
  );
}
