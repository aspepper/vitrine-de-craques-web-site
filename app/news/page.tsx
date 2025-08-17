import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Press Feed | Vitrine de Craques",
  description: "As últimas notícias e análises do mundo do futebol de base.",
};

export default async function NewsPage() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Press Feed</h1>
        <p className="mt-2 text-lg text-muted-foreground">Notícias, artigos e análises da nossa equipe de imprensa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map(article => (
          <Card key={article.id} className="flex flex-col">
            <CardHeader>
              <div className="mb-4">
                <Badge variant="secondary">{article.category}</Badge>
              </div>
              <CardTitle>{article.title}</CardTitle>
              <CardDescription>{article.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {/* Can add image here if available */}
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Image src={article.author.image ?? `https://placehold.co/40x40/0B0F10/FFFFFF/png?text=${article.author.name?.charAt(0)}`} alt={article.author.name ?? ""} width={24} height={24} className="rounded-full" />
                <span className="text-xs text-muted-foreground">{article.author.name}</span>
              </div>
              <time className="text-xs text-muted-foreground">
                {format(new Date(article.createdAt), "dd 'de' MMM, yyyy", { locale: ptBR })}
              </time>
            </CardFooter>
             <Link href={`/news/${article.id}`} className="p-4 bg-surface hover:bg-accent/10 text-center rounded-b-2xl">
                Ler Artigo
             </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
