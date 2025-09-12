import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";

interface PageProps {
  params: { id: string };
}

export default function GameDetalhePage({ params }: PageProps) {
  const game = {
    title: `Game ${params.id}`,
    image: "/hero/stadium.svg",
    description: "Detalhes do game. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow">
            <Image src={game.image} alt={game.title} fill className="object-cover" />
          </div>
          <h1 className="mb-4 text-3xl font-bold font-heading">{game.title}</h1>
          <p className="text-lg leading-relaxed text-muted-foreground">{game.description}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

