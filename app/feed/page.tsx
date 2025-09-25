import Image from "next/image";
import Link from "next/link";
import {
  Bookmark,
  CirclePlay,
  Compass,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

import ApiError from "@/components/ApiError";
import { Button } from "@/components/ui/button";
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

  const primaryNavigation = [
    { label: "Para você", href: "/feed", icon: CirclePlay },
    { label: "Explorar", href: "/explorar", icon: Compass },
    { label: "Seguindo", href: "/feed/seguindo", icon: Users },
    { label: "Mensagens", href: "/mensagens", icon: MessageSquare },
    { label: "Itens salvos", href: "/favoritos", icon: Bookmark },
  ];

  const secondaryNavigation = [
    { label: "Configurações", href: "/configuracoes", icon: Settings },
  ];

  const trendingHashtags = [
    { label: "#basebrasileira", views: "1.2M" },
    { label: "#talentos", views: "856K" },
    { label: "#jogosdafinal", views: "612K" },
  ];

  const actionButtons = [
    { label: "Curtir", icon: "/icons/icon-like.svg" },
    { label: "Comentar", icon: "/icons/icon-comment.svg" },
    { label: "Salvar", icon: "/icons/icon-save.svg" },
    { label: "Compartilhar", icon: "/icons/icon-share.svg" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 pb-16 pt-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 flex-col justify-between rounded-3xl border border-white/5 bg-white/10 p-6 backdrop-blur lg:flex">
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2">
              <Image src="/icons/icon-tiktok.svg" alt="Feed" width={32} height={32} className="opacity-80" />
              <div>
                <p className="text-sm font-medium text-slate-300">Feed Personalizado</p>
                <p className="text-xs text-slate-500">Recomendações inteligentes para você</p>
              </div>
            </div>

            <nav className="space-y-4">
              <div className="space-y-1">
                {primaryNavigation.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition hover:bg-white/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>

              <div className="space-y-1 border-t border-white/10 pt-4">
                {secondaryNavigation.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition hover:bg-white/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-slate-200">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </nav>
          </div>

          <Button className="h-12 w-full rounded-2xl bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-500/90">
            Enviar meu vídeo
          </Button>
        </aside>

        <section className="flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
          <div className="flex w-full justify-center overflow-hidden">
            <div className="relative flex h-[calc(100vh-220px)] w-full max-w-[520px] justify-center">
              <div className="flex h-full w-full max-w-[440px] flex-col overflow-hidden rounded-[32px] border border-white/10 bg-black shadow-[0_40px_120px_-40px_rgba(15,23,42,0.85)]">
                {initialVideos.length > 0 ? (
                  <FeedClient initialVideos={initialVideos} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-slate-200">
                    {loadError ? (
                      <>
                        <p className="font-semibold text-white">Não foi possível carregar o feed.</p>
                        <p className="text-xs text-slate-400">
                          Tente novamente em instantes enquanto verificamos a conexão com o banco de dados.
                        </p>
                      </>
                    ) : (
                      <p>Nenhum vídeo disponível no momento.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-20 items-end justify-end pb-16 pr-2 md:flex">
                <div className="pointer-events-auto flex flex-col items-center gap-5 rounded-3xl bg-black/40 px-3 py-5 text-xs text-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.95)]">
                  {actionButtons.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 transition hover:scale-105 hover:bg-white/20"
                    >
                      <Image src={action.icon} alt={action.label} width={28} height={28} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="hidden w-full max-w-xs shrink-0 flex-col gap-6 rounded-3xl border border-white/5 bg-white/10 p-6 backdrop-blur lg:flex">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border border-white/20">
                  <Image src="/icons/icon-tiktok.svg" alt="Canal" width={48} height={48} className="h-full w-full object-cover p-2" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Vitrine de Craques</p>
                  <p className="text-xs text-slate-400">Histórias de quem vive o futebol</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-300">
                Descubra atletas em ascensão, jogadas marcantes e bastidores do futebol brasileiro em um feed pensado para
                conectar talentos e oportunidades.
              </p>
              <Button className="w-full rounded-2xl bg-white/10 text-xs font-semibold text-white hover:bg-white/20">
                Seguir perfil
              </Button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Tendências</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                {trendingHashtags.map((trend) => (
                  <li key={trend.label} className="flex items-center justify-between">
                    <span>{trend.label}</span>
                    <span className="text-xs text-slate-500">{trend.views} views</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <p className="font-semibold">Dica</p>
              <p className="mt-1 text-xs text-emerald-200">
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
