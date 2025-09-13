import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ensureImage } from "@/lib/ensureImage";

interface PageProps {
  searchParams: { page?: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getAgents(page: number) {
  const res = await fetch(`${baseUrl}/api/agentes?page=${page}`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function AgentesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const { items, totalPages } = await getAgents(page);
  const heroImage = ensureImage(
    "placeholders/hero-placeholder.webp",
    "agentes-grid",
    "hero-placeholder"
  );
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1 className="mb-6 text-2xl font-bold font-heading">Agentes</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((agent: any) => (
            <Link key={agent.id} href={`/agentes/${agent.id}`}>
              <Card className="overflow-hidden hover:shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                    <Image
                      src={agent.avatarUrl || heroImage}
                      alt={agent.displayName || "Agente"}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg">
                    {agent.displayName || "Agente"}
                  </CardTitle>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          {page > 1 ? (
            <Link href={`/agentes?page=${page - 1}`}>Anterior</Link>
          ) : (
            <span />
          )}
          {page < totalPages ? (
            <Link href={`/agentes?page=${page + 1}`}>Próxima</Link>
          ) : (
            <span />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
