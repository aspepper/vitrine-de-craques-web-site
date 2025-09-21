import Image from "next/image";
import Link from "next/link";
import { ensureImage } from "@/lib/ensureImage";

interface PageProps {
  params: { slug: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getClub(slug: string) {
  const res = await fetch(`${baseUrl}/api/clubes/${slug}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Clube não encontrado");
  }
  return res.json();
}

export default async function ClubeDetalhePage({ params }: PageProps) {
  const club = await getClub(params.slug);
  const heroImage = ensureImage(
    "https://images.unsplash.com/photo-1511519984179-62e3b6aa3a36?auto=format&fit=crop&w=1920&q=80&fm=webp",
    "clube-detalhe",
    "stadium@1920"
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            href="/clubes"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            Voltar para clubes
          </Link>

          <div className="relative h-64 w-full overflow-hidden rounded-lg shadow">
            <Image
              src={heroImage}
              alt={club.name}
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">{club.name}</h1>
            <p className="text-muted-foreground">Confederação: {club.confederation?.name || "—"}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
