import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="relative min-h-screen">
      {/* BACKGROUND otimizado */}
      <div className="pointer-events-none absolute inset-0 -z-10 md:fixed">
        <Image
          src="/stadium.jpg"   // ou stadium@1920.webp
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* Overlays: clareia topo e funde com o footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-72 -z-10 bg-gradient-to-b from-transparent to-[#0B1E3A]/70" />
      

      <main className="relative z-10 space-y-16">
        {/* HERO / BANNER */}
        <section className="container pt-2 md:pt-4">
          <div
            className="
              rounded-[28px]
              ring-1 ring-black/10
              shadow-[0_8px_32px_rgba(0,0,0,0.25)]
              p-6 md:p-8
              bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.92))]
              backdrop-blur-[2px]
            "
          >
            {/* Topo do banner: texto à esquerda e vídeo à direita */}
            <div className="grid gap-8 md:grid-cols-[1fr,560px] items-start">
              {/* Texto + CTAs */}
              <div>
                {/* Título display menor */}
                <h1
                  className="
                    mb-4
                    font-heading italic font-extrabold
                    text-[34px] md:text-[48px] leading-tight
                  "
                >
                  Descubra talentos do Futebol
                </h1>

                <p className="mb-8 max-w-[62ch] text-[17px] md:text-[18px] leading-relaxed text-foreground/90">
                  Vídeos 9:16 com moderação ativa, consentimento destacado (ECA/LGPD) e
                  conexão ética entre atletas, famílias, clubes e agentes licenciados.
                </p>

                {/* CTAs principais */}
                <div className="flex flex-wrap gap-4">
                  <Button
                    asChild
                    className="h-14 rounded-full px-8 text-[16px] font-semibold shadow-sm"
                  >
                    <Link href="/cadastro">Registrar</Link>
                  </Button>

                  <Button
                    asChild
                    variant="ghost"
                    className="
                      h-14 rounded-full px-8 text-[16px] font-semibold
                      bg-white/90 text-foreground
                      border border-black/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]
                      hover:bg-white
                    "
                  >
                    <Link href="/feed">Explorar vídeos</Link>
                  </Button>
                </div>
              </div>

              {/* Vídeo MAIS ALTO */}
              <div
                className="
                  relative w-full aspect-[16/9]
                  overflow-hidden rounded-[28px]
                  ring-1 ring-black/10
                  shadow-[0_8px_32px_rgba(0,0,0,0.18)]
                  bg-black/90
                  self-start md:-mt-2
                "
              >
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/gOEPufmLuGs?si=M4-9z1_ZeSvm21Fn&modestbranding=1&rel=0&playsinline=1"
                  title="Vitrine de Craques — vídeo de apresentação"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Faixa de chips ocupando toda a largura do banner */}
            <div className="mt-8 w-full">
              <div className="flex w-full flex-wrap items-center justify-between gap-4">
                <span
                  className="
                    h-11 inline-flex items-center rounded-full px-5
                    bg-white/90 text-foreground/90
                    border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.05)]
                    whitespace-nowrap
                  "
                >
                  Upload de até 10s
                </span>
                <span
                  className="
                    h-11 inline-flex items-center rounded-full px-5
                    bg-white/90 text-foreground/90
                    border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.05)]
                    whitespace-nowrap
                  "
                >
                  Autoplay por visibilidade
                </span>
                <span
                  className="
                    h-11 inline-flex items-center rounded-full px-5
                    bg-white/90 text-foreground/90
                    border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.05)]
                    whitespace-nowrap
                  "
                >
                  Denunciar conteúdo
                </span>
                <span
                  className="
                    h-11 inline-flex items-center rounded-full px-5
                    bg-white/90 text-foreground/90
                    border border-black/10 shadow-[0_1px_0_rgba(0,0,0,0.05)]
                    whitespace-nowrap
                  "
                >
                  Filtros por clube/estado
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* DESTAQUES */}
        <section className="container space-y-6">
          <h2 className="text-h2">Destaques</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="rounded-2xl shadow-lg">
                <div className="h-32 rounded-t-2xl bg-muted" />
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Card {i}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* PRINCIPAIS NOTÍCIAS */}
        <section className="container space-y-6">
          <h2 className="text-h2">Principais notícias</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="rounded-2xl shadow-lg">
                <div className="h-32 rounded-t-2xl bg-muted" />
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Título notícia {i}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* GAMES */}
        <section className="container space-y-6 pb-16">
          <h2 className="text-h2">Games</h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="rounded-2xl shadow-lg">
                <div className="h-32 rounded-t-2xl bg-muted" />
                <CardContent className="p-4">
                  <p className="text-sm font-medium">Como zerar o Minecraft?</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
