import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";

interface PageProps {
  params: { id: string };
}

export default function NoticiaDetalhePage({ params }: PageProps) {
  const article = {
    title: `Notícia ${params.id}`,
    image: "/hero/stadium.svg",
    content:
      "Conteúdo da notícia. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <article className="mx-auto max-w-3xl">
          <h1 className="mb-4 text-3xl font-bold font-heading">{article.title}</h1>
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow">
            <Image
              src={article.image}
              alt={article.title}
              fill
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

