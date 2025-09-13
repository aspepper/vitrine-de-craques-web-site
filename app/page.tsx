import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="space-y-16">
      <section className="container pt-6">
        <div className="relative min-h-[300px] overflow-hidden rounded-xl">
          <Image
            src="/placeholders/Video-Promocional-Youtube-560x315.svg"
            alt="Campo de futebol"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 max-w-xl p-8 text-white">
            <h1 className="mb-4 text-h1">Descubra talentos do Futebol</h1>
            <p className="mb-6 text-body">
              Vídeos 918 com moderação ativa, comercialização ética (SCA/LDPE) e
              conteúdo direto entre atletas, familiares, clubes e agentes
              licenciados.
            </p>
            <div className="flex gap-4">
              {session ? (
                <>
                  <Button>Ativos</Button>
                  <Button variant="ghost" className="bg-white text-black">
                    Explorar Vitrine
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="secondary">
                    <Link href="/cadastro">Registrar</Link>
                  </Button>
                  <Button variant="ghost" className="bg-white text-black">
                    Explorar Vitrine
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="container space-y-6">
        <h2 className="text-h2">Destaques</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="h-32 bg-muted" />
              <CardContent className="p-4">
                <p className="text-sm font-medium">Card {i}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container space-y-6">
        <h2 className="text-h2">Principais notícias</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i}>
              <div className="h-32 bg-muted" />
              <CardContent className="p-4">
                <p className="text-sm font-medium">Título notícia {i}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container space-y-6 pb-16">
        <h2 className="text-h2">Games</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <div className="h-32 bg-muted" />
              <CardContent className="p-4">
                <p className="text-sm font-medium">Como zerar o Minecraft?</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
