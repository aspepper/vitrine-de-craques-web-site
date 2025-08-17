import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Games e Dicas | Vitrine de Craques",
  description: "Dicas de jogos, lançamentos e artigos especiais.",
};

export default async function GamesPage() {
  const games = await prisma.game.findMany();

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Games & Dicas</h1>
        <p className="mt-2 text-lg text-muted-foreground">Dicas de jogos, lançamentos e artigos por celebridades do esporte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {games.map(game => (
          <Card key={game.id} className="overflow-hidden">
            <CardHeader className="p-0">
              <div className="aspect-video relative">
                <Image 
                  src={game.imageUrl ?? "https://placehold.co/600x400/0EA5E9/FFFFFF/png?text=Game"} 
                  alt={game.title} 
                  fill 
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                    <Badge variant="info">{game.tag}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle>{game.title}</CardTitle>
              <p className="text-muted-foreground mt-2 line-clamp-3">{game.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={game.ctaUrl} target="_blank">Ver Mais</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
