import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";

const valores = [
  {
    titulo: "Paixão",
    descricao:
      "Vivemos a paixão dos torcedores, atletas, regras e tradições. Acreditamos que o respeito aos clubes e às torcidas é essencial para o futebol continuar emocionante.",
  },
  {
    titulo: "Inovação",
    descricao:
      "Tecnologia e dados conectam nossa comunidade e impulsionam novas oportunidades, sempre com transparência e responsabilidade.",
  },
  {
    titulo: "Ética",
    descricao:
      "Processos claros, justos e responsáveis definem a Vitrine. Seguimos as melhores práticas de governança para proteger quem joga e quem investe.",
  },
  {
    titulo: "Inclusão",
    descricao:
      "Nosso futebol é para todas as pessoas. Diversas e representativas, com respeito às diferentes realidades sociais e econômicas.",
  },
  {
    titulo: "Diversão",
    descricao:
      "Celebramos as histórias, conquistas e emoções do futebol. Fazemos parte desse espetáculo com alegria e gratidão.",
  },
  {
    titulo: "Segurança",
    descricao:
      "Cuidamos de dados, LGPD, contratos e recursos financeiros com rigor e controle absoluto. O futebol precisa de confiança — e nós entregamos isso em cada experiência.",
  },
];

export default function SobrePage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col gap-12">
          <header className="max-w-4xl">
            <span className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Vitrine de Craques
            </span>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900 sm:text-5xl">
              Sobre
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Somos uma plataforma que une atletas, torcidas, clubes, empresas e
              confederações para transformar o futebol com inovação,
              governança e oportunidades reais.
            </p>
          </header>

          <section className="space-y-10">
            <Card className="rounded-3xl border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
              <CardContent className="space-y-4 p-8 pt-8 sm:p-10 sm:pt-10">
                <h2 className="text-2xl font-semibold text-slate-900">Missão</h2>
                <p className="text-lg text-slate-600">
                  Propomos novas formas e oportunidades no futebol, com
                  inovação, integração e governança.
                </p>
                <p className="text-slate-600">
                  Na Vitrine de Craques, nossa missão é aproximar atletas,
                  torcidas, clubes, empresas e confederações para transformar o
                  cenário do futebol. Acreditamos no poder da governança e na
                  inovação como pilares para tornar o esporte mais acessível e
                  justo. Queremos abrir portas, conectar pessoas e potencializar
                  carreiras com oportunidades reais.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
              <CardContent className="space-y-4 p-8 pt-8 sm:p-10 sm:pt-10">
                <h2 className="text-2xl font-semibold text-slate-900">Visão</h2>
                <p className="text-lg text-slate-600">
                  Ser a maior vitrine digital de referência do Brasil — e um
                  novo padrão de segurança e ética no futebol.
                </p>
                <p className="text-slate-600">
                  Oferecer uma jornada mais confiável para descobrirmos novos
                  talentos em cada posição. Governança e seleção justa. Com
                  tecnologia, dados e acompanhamento em tempo real,
                  democratizamos a visibilidade e a chance de desenvolver os
                  atletas do futuro.
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
              <CardContent className="space-y-8 p-8 pt-8 sm:p-10 sm:pt-10">
                <div className="max-w-3xl space-y-4">
                  <h2 className="text-2xl font-semibold text-slate-900">Valores</h2>
                  <p className="text-slate-600">
                    O futebol que acreditamos é plural, transparente — e cada
                    valor tem uma prática concreta no dia a dia.
                  </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  {valores.map((valor) => (
                    <Card
                      key={valor.titulo}
                      className="h-full rounded-2xl border-none bg-white shadow-[0_25px_80px_-50px_rgba(15,23,42,0.65)]"
                    >
                      <CardContent className="space-y-3 p-6 pt-6">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {valor.titulo}
                        </h3>
                        <p className="text-slate-600">{valor.descricao}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
              <CardContent className="flex flex-col gap-6 p-8 pt-8 sm:flex-row sm:items-center sm:justify-between sm:p-10 sm:pt-10">
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Acompanhe nosso desenvolvimento
                  </h2>
                  <p className="max-w-2xl text-slate-600">
                    Atualizamos sempre. Cada nova funcionalidade, parceria e
                    conquista é compartilhada com você. Fique por dentro das
                    novidades no nosso blog.
                  </p>
                </div>
                <Link
                  href="/noticias"
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_25px_70px_-35px_rgba(16,185,129,0.7)] transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  Acesse o blog
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

