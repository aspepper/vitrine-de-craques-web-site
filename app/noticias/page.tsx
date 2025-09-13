import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PageProps {
  searchParams: { page?: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getNews(page: number) {
  const res = await fetch(`${baseUrl}/api/noticias?page=${page}`, { cache: "no-store" });
  return res.json();
}

export default async function NoticiasPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const { items, totalPages } = await getNews(page);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="container mx-auto flex-grow p-4">
        <h1>Notícias</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((news: any) => (
            <Link key={news.slug} href={`/noticias/${news.slug}`}>
              <Card className="hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{news.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {news.content?.slice(0, 100)}...
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          {page > 1 ? (
            <Link href={`/noticias?page=${page - 1}`}>Anterior</Link>
          ) : (
            <span />
          )}
          {page < totalPages ? (
            <Link href={`/noticias?page=${page + 1}`}>Próxima</Link>
          ) : (
            <span />
          )}
        </div>
      </main>
    </div>
  );
}
