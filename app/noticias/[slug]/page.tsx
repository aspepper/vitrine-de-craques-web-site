import Image from "next/image";
import { notFound } from "next/navigation";

import prisma from "@/lib/db";
import { ensureImage } from "@/lib/ensureImage";
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
}

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
  };
}

async function fetchArticle(slug: string): Promise<ArticleData | null> {
  if (!process.env.DATABASE_URL) {
    return mapSampleArticle(slug);
  }

  try {
    const article = await prisma.news.findUnique({
      where: { slug },
      include: {
        author: {
          include: {
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

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <article className="mx-auto w-full max-w-6xl space-y-8 rounded-[40px] border border-slate-200/70 bg-white/90 p-8 shadow-[0_40px_120px_-50px_rgba(15,23,42,0.35)] backdrop-blur">
          <header className="space-y-6">
            <span className="inline-flex rounded-full bg-cyan-300/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-800">
              {article.category ?? "Atualizações"}
            </span>
            <h1 className="text-4xl font-semibold italic text-slate-900">{article.title}</h1>
            {article.excerpt ? (
              <p className="text-base italic text-slate-600">{article.excerpt}</p>
            ) : null}
            <p className="text-sm font-medium text-slate-500">
              {`${formatPublishedAt(article.publishedAt)} · ${article.authorName}`}
            </p>
          </header>

          <div className="relative h-[420px] w-full overflow-hidden rounded-[32px] bg-slate-900/80 shadow-[0_40px_80px_-45px_rgba(15,23,42,0.5)]">
            <Image src={heroImage} alt={article.title} fill className="object-cover" priority />
          </div>

          <div className="space-y-6 text-base leading-relaxed text-slate-700">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p>{article.content ?? "Conteúdo indisponível no momento."}</p>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
