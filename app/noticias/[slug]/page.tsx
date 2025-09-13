import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { ensureImage } from "@/lib/ensureImage";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";

interface PageProps {
  params: { slug: string };
}

export default async function NoticiaDetalhePage({ params }: PageProps) {
  const article = await prisma.news.findUnique({ where: { slug: params.slug } });

  if (!article) {
    notFound();
  }

  const heroImage = ensureImage(
    "placeholders/hero-placeholder.webp",
    "noticia-detalhe",
    "hero-placeholder"
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <article className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold font-heading">{article.title}</h1>
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow">
            <Image
              src={heroImage}
              alt={article.title}
              fill
              loading="lazy"
              className="object-cover"
            />
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground">
            {article.content}
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
