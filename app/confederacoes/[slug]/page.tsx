import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { ensureImage } from "@/lib/ensureImage";

interface PageProps {
  params: { slug: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getConfed(slug: string) {
  const res = await fetch(`${baseUrl}/api/confederacoes/${slug}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Confederação não encontrada");
  }
  return res.json();
}

export default async function ConfederacaoDetalhePage({ params }: PageProps) {
  const confed = await getConfed(params.slug);
  const heroImage = ensureImage(
    "https://images.unsplash.com/photo-1511519984179-62e3b6aa3a36?auto=format&fit=crop&w=1920&q=80&fm=webp",
    "confederacao-detalhe",
    "stadium@1920"
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow">
            <Image
              src={heroImage}
              alt={confed.name}
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>
            <h1>{confed.name}</h1>
            <p className="text-muted-foreground">
              Clubes: {confed.clubs.map((c: any) => c.name).join(', ')}
            </p>
          </div>
      </main>
      <Footer />
    </div>
  );
}
