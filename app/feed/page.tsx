import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getServerSession } from "next-auth";
import { Filter } from "lucide-react";

import { FollowButton } from "@/components/FollowButton";
import ApiError from "@/components/ApiError";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { logError } from "@/lib/error";
import { getFollowInfo } from "@/lib/follow";
import { buildVideoWhere } from "@/lib/video-filter-where";
import { buildVideoQueryString, parseVideoFilters } from "@/lib/video-filters";
import { FeedClient, type FeedVideo } from "./FeedClient";
import { FeedFilters } from "./FeedFilters";

interface FeedPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function FeedPage({
  searchParams = {},
}: FeedPageProps) {
  noStore();

  let initialVideos: FeedVideo[] = [];
  let loadError = false;
  let prisma: typeof import("@/lib/db").default | null = null;

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;

  const filters = parseVideoFilters(searchParams);
  const queryString = buildVideoQueryString(filters);

  if (process.env.DATABASE_URL) {
    try {
      const { default: db } = await import("@/lib/db");
      prisma = db;
      initialVideos = await prisma.video.findMany({
        take: 6,
        where: buildVideoWhere(filters),
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              profile: {
                select: {
                  id: true,
                  role: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
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

  let officialUserId: string | null = null;
  let officialFollowerCount = 0;
  let officialIsFollowing = false;

  if (prisma) {
    try {
      const officialUser = await prisma.user.findFirst({
        where: {
          OR: [
            { profile: { displayName: "Vitrine de Craques" } },
            { name: "Vitrine de Craques" },
            { email: "midia@vitrinecraques.com" },
            { email: "super@vitrinecraques.com" },
          ],
        },
        select: { id: true },
      });

      if (officialUser) {
        officialUserId = officialUser.id;
        const followInfo = await getFollowInfo(officialUser.id, viewerId ?? undefined);
        officialFollowerCount = followInfo.followerCount;
        officialIsFollowing = followInfo.isFollowing;
      }
    } catch (error) {
      await logError(error, "AO CARREGAR PERFIL OFICIAL", {
        scope: "FeedPage",
      });
    }
  }

  const loginRedirectTo = "/login?callbackUrl=/feed";
  const viewerIsOfficial = Boolean(viewerId && officialUserId && viewerId === officialUserId);
  const canInteractWithOfficial = Boolean(viewerId && officialUserId && viewerId !== officialUserId);

  const trendingHashtags = [
    { label: "#basebrasileira", views: "1.2M" },
    { label: "#talentos", views: "856K" },
    { label: "#jogosdafinal", views: "612K" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 pb-16 pt-4 lg:px-8">
        <aside className="hidden w-80 shrink-0 flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/5 dark:bg-white/10 dark:text-slate-100 dark:shadow-[0_30px_90px_-45px_rgba(15,23,42,0.85)] lg:flex">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 px-3 py-2 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-300">
              <Filter className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Filtros rápidos</p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-200/80">Refine as recomendações do feed</p>
            </div>
          </div>

          <FeedFilters />

          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-100">
            <p className="font-semibold">Dica</p>
            <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-100/80">
              Ajuste os filtros para encontrar talentos e conteúdos que combinam com o que você procura.
            </p>
          </div>
        </aside>

        <section className="flex flex-1 flex-col gap-6 overflow-hidden lg:flex-row">
          <div className="flex w-full justify-center overflow-hidden">
            <div className="relative flex h-[calc(100vh-200px)] w-full max-w-full justify-center lg:max-w-[560px]">
              <div className="flex h-full w-full max-w-full flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-black dark:shadow-[0_40px_120px_-40px_rgba(15,23,42,0.85)] md:max-w-[460px]">
                {initialVideos.length > 0 ? (
                  <FeedClient initialVideos={initialVideos} queryString={queryString} />
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
              {officialUserId && !viewerIsOfficial ? (
                <FollowButton
                  targetUserId={officialUserId}
                  initialIsFollowing={officialIsFollowing}
                  initialFollowerCount={officialFollowerCount}
                  canInteract={canInteractWithOfficial}
                  loginRedirectTo={loginRedirectTo}
                  appearance="light"
                  showFollowerCount={false}
                  className="w-full [&>button]:w-full"
                />
              ) : viewerIsOfficial ? (
                <Button
                  className="w-full rounded-2xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                  disabled
                >
                  {viewerIsOfficial ? "Seu perfil" : "Seguir perfil"}
                </Button>
              ) : viewerId ? (
                <Button
                  className="w-full rounded-2xl bg-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-400 dark:hover:bg-white/10"
                  disabled
                >
                  Seguir perfil
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full rounded-2xl bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-500/90 dark:bg-emerald-500 dark:hover:bg-emerald-500/80"
                >
                  <Link href={loginRedirectTo}>Seguir perfil</Link>
                </Button>
              )}
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
