import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import YouTubePlayer from "@/components/YouTubePlayer";
import prisma from "@/lib/prisma";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import AlbumCard from "@/components/AlbumCard";

export default async function Home() {
  const latestVideos = await prisma.video.findMany({
    take: 4,
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  const trendingAthletes = await prisma.user.findMany({
    where: { role: 'ATHLETE' },
    take: 4,
    include: { profile: { include: { athlete: true } } }
  });

  const recentNews = await prisma.article.findMany({
    where: { published: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: { author: true }
  });

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    Mostre seu Talento. Conquiste o Mundo.
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    A Vitrine de Craques é a sua ponte para o sucesso. Publique seus vídeos, seja visto por olheiros e clubes, e dê o primeiro passo na sua carreira profissional.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/auth/register?role=athlete">
                      Sou Atleta/Guardião
                    </Link>
                  </Button>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/feeds">
                      Ver Craques
                    </Link>
                  </Button>
                </div>
              </div>
              <YouTubePlayer videoId="gXWXKjR-qII" />
            </div>
          </div>
        </section>
        
        <section id="latest-videos" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Últimos Vídeos</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Veja as jogadas mais recentes enviadas pelos nossos talentos.
                </p>
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-12">
              {latestVideos.map(video => (
                <Card key={video.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <video src="https://placehold.co/300x400.mp4" className="w-full h-auto" poster="https://placehold.co/300x400/16a34a/white?text=Play" muted loop playsInline />
                    <div className="p-4">
                      <h3 className="font-bold text-lg">{video.title}</h3>
                      <p className="text-sm text-muted-foreground">por {video.author.name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="trending-athletes" className="w-full py-12 md:py-24 lg:py-32 bg-surface">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Talentos em Destaque</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Estes são os atletas que estão chamando a atenção na plataforma.
                </p>
              </div>
            </div>
            <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-12">
              {trendingAthletes.map(athlete => (
                <AlbumCard
                  key={athlete.id}
                  href={`/athletes/${athlete.id}`} // In a real app, this would be a slug
                  imageUrl={athlete.image ?? `https://placehold.co/400x500/0B0F10/FFFFFF/png?text=${athlete.name?.charAt(0)}`}
                  name={athlete.name ?? "Atleta"}
                  details={[
                    athlete.profile?.athlete?.position ?? "Posição",
                    `${athlete.profile?.athlete?.city ?? "Cidade"}, ${athlete.profile?.athlete?.state ?? "UF"}`
                  ]}
                />
              ))}
            </div>
             <div className="text-center mt-12">
                <Button asChild variant="outline">
                  <Link href="/athletes">Ver todos os atletas <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
          </div>
        </section>

        <section id="news" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Notícias e Artigos</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Fique por dentro das últimas novidades do mundo do futebol de base.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3 gap-8 pt-12">
              {recentNews.map(article => (
                <Card key={article.id}>
                  <CardHeader>
                    <CardTitle>{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">{article.summary}</p>
                    <Button variant="link" asChild className="p-0 mt-4">
                      <Link href={`/news/${article.id}`}>Ler mais</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
