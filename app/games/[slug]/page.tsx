import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { ensureImage } from "@/lib/ensureImage";

interface PageProps {
  params: { slug: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getGame(slug: string) {
  const res = await fetch(`${baseUrl}/api/games/${slug}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Game não encontrado");
  }
  return res.json();
}

export default async function GameDetalhePage({ params }: PageProps) {
  const game = await getGame(params.slug);
  const heroImage = ensureImage(
    "placeholders/hero-placeholder.webp",
    "game-detalhe",
    "hero-placeholder"
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow">
            <Image
              src={heroImage}
              alt={game.slug}
              fill
              className="object-cover"
              loading="lazy"
            />
          </div>
          <h1 className="mb-4 text-3xl font-bold font-heading">
            {game.homeClub.name} vs {game.awayClub.name}
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Placar: {game.scoreHome} - {game.scoreAway}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
