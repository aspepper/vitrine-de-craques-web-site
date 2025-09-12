import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { HERO_PLACEHOLDER } from "@/lib/heroImage";

interface PageProps {
  params: { slug: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getNews(slug: string) {
  const res = await fetch(`${baseUrl}/api/noticias/${slug}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Notícia não encontrada");
  }
  return res.json();
}

export default async function NoticiaDetalhePage({ params }: PageProps) {
  const article = await getNews(params.slug);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <article className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold font-heading">{article.title}</h1>
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow">
            <Image
              src={HERO_PLACEHOLDER}
              alt={article.title}
              fill
              loading="lazy"
              className="object-cover"
            />
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground">{article.content}</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
