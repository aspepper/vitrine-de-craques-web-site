import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { id: params.slug }, // Use real slug later
    include: { author: true }
  });

  if (!article || !article.published) {
    notFound();
  }

  return (
    <article className="container max-w-3xl py-12">
      <header className="text-center mb-12">
        <div className="mb-4">
          <Badge variant="secondary">{article.category}</Badge>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{article.title}</h1>
        <div className="mt-6 flex justify-center items-center gap-4">
            <Image src={article.author.image ?? `https://placehold.co/40x40/0B0F10/FFFFFF/png?text=${article.author.name?.charAt(0)}`} alt={article.author.name ?? ""} width={40} height={40} className="rounded-full" />
            <div>
                <p className="font-semibold">{article.author.name}</p>
                <time dateTime={article.createdAt.toISOString()} className="text-sm text-muted-foreground">
                    {format(new Date(article.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </time>
            </div>
        </div>
      </header>
      
      <div className="prose dark:prose-invert mx-auto">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>
    </article>
  );
}
