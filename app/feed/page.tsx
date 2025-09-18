import Image from "next/image";

import ApiError from "@/components/ApiError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logError } from "@/lib/error";
import { FeedClient, type FeedVideo } from "./FeedClient";

export default async function FeedPage() {
  let initialVideos: FeedVideo[] = [];
  let loadError = false;

  if (process.env.DATABASE_URL) {
    try {
      const { default: prisma } = await import("@/lib/db");
      initialVideos = await prisma.video.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
    } catch (error) {
      await logError(error, "AO CARREGAR FEED INICIAL", {
        scope: "FeedPage",
        databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      });
      loadError = true;
    }
  } else {
    loadError = true;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="space-y-10">
          <header>
            <h1 className="text-3xl font-semibold text-slate-900">Feeds</h1>
          </header>

          <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
            <aside className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] backdrop-blur">
              <div className="space-y-8">
                <div>
                  <p className="text-lg font-semibold italic text-slate-900">Filtros rápidos</p>
                  <p className="mt-1 text-sm text-slate-500">Categoria, Estado, Hashtags</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Palavra
                    </Label>
                    <Input placeholder="Buscar..." className="h-12 rounded-2xl bg-white/80 text-sm" />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      Categoria
                    </Label>
                    <div className="space-y-3">
                      {[
                        "Atletas",
                        "Torcidas",
                        "Agentes",
                        "Clubes",
                      ].map((category) => (
                        <label
                          key={category}
                          className="flex items-center gap-3 text-sm font-medium text-slate-700"
                        >
                          <input
                            type="checkbox"
                            className="h-5 w-5 rounded-lg border border-slate-200 bg-white text-emerald-500 focus:ring-emerald-500"
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Estado
                      </Label>
                      <Input placeholder="Selecione" className="h-12 rounded-2xl bg-white/80 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Data Inicial
                      </Label>
                      <Input placeholder="DD/MM/AAAA" className="h-12 rounded-2xl bg-white/80 text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        Data Final
                      </Label>
                      <Input placeholder="DD/MM/AAAA" className="h-12 rounded-2xl bg-white/80 text-sm" />
                    </div>
                  </div>
                </div>

                <Button className="h-12 w-full bg-emerald-500 text-base font-semibold text-white hover:bg-emerald-500/90">
                  Filtrar
                </Button>
              </div>
            </aside>

            <section className="rounded-[32px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.25)] backdrop-blur">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                <div className="relative flex w-full justify-center">
                  <div className="absolute -left-10 top-12 hidden h-[520px] w-1 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 lg:block" />
                  <div className="relative flex h-[640px] w-full max-w-[360px] items-center justify-center rounded-[48px] bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 p-6 shadow-[0_60px_120px_-40px_rgba(15,23,42,0.7)]">
                    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[32px] bg-black ring-1 ring-white/10">
                      {initialVideos.length > 0 ? (
                        <FeedClient initialVideos={initialVideos} />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-slate-200">
                          {loadError ? (
                            <>
                              <p className="font-semibold text-white">Não foi possível carregar o feed.</p>
                              <p className="text-xs text-slate-300">
                                Tente novamente em instantes enquanto verificamos a conexão com o banco de dados.
                              </p>
                            </>
                          ) : (
                            <p>Nenhum vídeo disponível no momento.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-row justify-center gap-4 lg:flex-col lg:justify-center">
                  {[
                    {
                      label: "Comentar",
                      icon: "/icons/icon-comment.svg",
                      bg: "bg-sky-500",
                    },
                    {
                      label: "Curtir",
                      icon: "/icons/icon-like.svg",
                      bg: "bg-emerald-500",
                    },
                    {
                      label: "Salvar",
                      icon: "/icons/icon-save.svg",
                      bg: "bg-amber-500",
                    },
                    {
                      label: "Compartilhar",
                      icon: "/icons/icon-share.svg",
                      bg: "bg-rose-600",
                    },
                  ].map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className={`flex h-14 w-14 items-center justify-center rounded-full ${action.bg} shadow-[0_20px_40px_-18px_rgba(15,23,42,0.45)] transition-transform hover:scale-105`}
                      aria-label={action.label}
                    >
                      <Image src={action.icon} alt={action.label} width={28} height={28} />
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-10 text-center text-sm text-slate-500">
                Autoplay quando ≥70% visível • Pause fora do viewport
              </p>
            </section>
          </div>
        </div>
      </main>
      <ApiError />
    </div>
  );
}
