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
    "https://images.unsplash.com/photo-1511519984179-62e3b6aa3a36?auto=format&fit=crop&w=1920&q=80&fm=webp",
    "noticia-detalhe",
    "stadium@1920"
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <article className="mx-auto max-w-3xl">
          <h1>{article.title}</h1>
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow">
            <Image
              src={heroImage}
              alt={article.title}
              fill
              loading="lazy"
              className="object-cover"
            />
          </div>
          <p className="text-muted-foreground">{article.content}</p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
