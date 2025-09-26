import Image from "next/image";
import { Calendar, ChevronDown, Filter, Hash, MapPin, PlayCircle } from "lucide-react";

import ApiError from "@/components/ApiError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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

  const trendingHashtags = [
    { label: "#basebrasileira", views: "1.2M" },
    { label: "#talentos", views: "856K" },
    { label: "#jogosdafinal", views: "612K" },
  ];

  const quickFilters = ["Categoria", "Estado", "Hashtags"];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 pb-16 pt-4 lg:px-8">
        <aside className="hidden w-72 shrink-0 flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/5 dark:bg-white/10 dark:text-slate-100 dark:shadow-[0_30px_90px_-45px_rgba(15,23,42,0.85)] lg:flex">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-300">
              <Filter className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Filtros rápidos</p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-200/80">Refine as recomendações do feed</p>
            </div>
          </div>

          <form className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              {quickFilters.map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-600 transition hover:-translate-y-0.5 hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 dark:bg-transparent dark:text-emerald-200",
                    index === 0 && "min-w-[156px] justify-center px-6 py-3 text-sm"
                  )}
                >
                  {item === "Categoria" && <PlayCircle className="h-4 w-4" aria-hidden />}
                  {item === "Estado" && <MapPin className="h-4 w-4" aria-hidden />}
                  {item === "Hashtags" && <Hash className="h-4 w-4" aria-hidden />}
                  <span>{item}</span>
                </button>
              ))}
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Categoria
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
                <span>Todos</span>
                <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Estado
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
                <span>Selecione</span>
                <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              Hashtag
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
                <Hash className="h-4 w-4 text-slate-400" aria-hidden />
                <span className="text-xs uppercase tracking-[0.14em] text-slate-400">Digite uma hashtag</span>
              </div>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Idade mínima
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
                  14 anos
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Idade máxima
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] dark:border-white/15 dark:bg-white/5 dark:text-slate-100">
                  22 anos
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Data inicial
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    type="date"
                    className="bg-white pl-11 pr-5 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] dark:bg-white/5 dark:text-slate-100"
                    aria-label="Data inicial"
                  />
                </div>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                Data final
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
                  <Input
                    type="date"
                    className="bg-white pl-11 pr-5 text-sm text-slate-600 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.5)] dark:bg-white/5 dark:text-slate-100"
                    aria-label="Data final"
                  />
                </div>
              </label>
            </div>

            <Button className="h-12 w-full rounded-2xl bg-emerald-500 text-sm font-semibold text-white shadow-[0_18px_32px_-18px_rgba(34,197,94,0.8)] transition hover:-translate-y-0.5 hover:bg-emerald-500/90">
              Aplicar filtros
            </Button>
          </form>

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-100">
            <p className="font-semibold">Dica</p>
            <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-100/80">
              Ajuste os filtros para encontrar talentos e conteúdos que combinam com o que você procura.
            </p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
          <div className="flex w-full justify-center overflow-hidden">
            <div className="relative flex h-[calc(100vh-200px)] w-full max-w-[560px] justify-center">
              <div className="flex h-full w-full max-w-[460px] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-black dark:shadow-[0_40px_120px_-40px_rgba(15,23,42,0.85)]">
                {initialVideos.length > 0 ? (
                  <FeedClient initialVideos={initialVideos} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-slate-600 dark:text-slate-200">
                    {loadError ? (
                      <>
                        <p className="font-semibold text-slate-900 dark:text-white">Não foi possível carregar o feed.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Tente novamente em instantes enquanto verificamos a conexão com o banco de dados.
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-200">Nenhum vídeo disponível no momento.</p>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          <aside className="hidden w-full max-w-xs shrink-0 flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/5 dark:bg-white/10 dark:text-slate-100 dark:shadow-[0_30px_90px_-45px_rgba(15,23,42,0.85)] lg:flex">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-white dark:border-white/20 dark:bg-transparent">
                  <Image src="/brand/logo.svg" alt="Vitrine de Craques" width={48} height={48} className="h-full w-full object-cover p-2" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Vitrine de Craques</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Histórias de quem vive o futebol</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Descubra atletas em ascensão, jogadas marcantes e bastidores do futebol brasileiro em um feed pensado para
                conectar talentos e oportunidades.
              </p>
              <Button className="w-full rounded-2xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white/10 dark:text-white dark:hover:bg-white/20">
                Seguir perfil
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-black/40">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Tendências</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                {trendingHashtags.map((trend) => (
                  <li key={trend.label} className="flex items-center justify-between">
                    <span>{trend.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-500">{trend.views} views</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-100">
              <p className="font-semibold">Dica</p>
              <p className="mt-1 text-xs text-emerald-700 opacity-80 dark:text-emerald-200 dark:opacity-100">
                Use hashtags relevantes e vídeos em formato vertical para alcançar mais olhares do recrutamento.
              </p>
            </div>
          </aside>
        </section>
      </main>
      <ApiError />
    </div>
  );
}
