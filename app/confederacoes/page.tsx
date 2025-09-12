import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { HERO_PLACEHOLDER } from "@/lib/heroImage";

interface PageProps {
  searchParams: { page?: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getConfeds(page: number) {
  const res = await fetch(`${baseUrl}/api/confederacoes?page=${page}`, { cache: "no-store" });
  return res.json();
}

export default async function ConfederacoesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const { items, totalPages } = await getConfeds(page);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1 className="mb-6 text-2xl font-bold font-heading">Confederações</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((confed: any) => (
            <Link key={confed.slug} href={`/confederacoes/${confed.slug}`}>
              <Card className="overflow-hidden hover:shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                    <Image
                      src={HERO_PLACEHOLDER}
                      alt={confed.name}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg">{confed.name}</CardTitle>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          {page > 1 ? (
            <Link href={`/confederacoes?page=${page - 1}`}>Anterior</Link>
          ) : (
            <span />
          )}
          {page < totalPages ? (
            <Link href={`/confederacoes?page=${page + 1}`}>Próxima</Link>
          ) : (
            <span />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

