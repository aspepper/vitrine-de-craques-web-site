import type { ReactNode } from "react";

import { type Role } from "@prisma/client";
import { MapPin, Phone, UserRound } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { FavoriteTeamCard, type FavoriteTeamInfo } from "@/components/perfil/FavoriteTeamCard";
import {
  FollowConnectionsDialog,
  type FollowConnectionProfile,
} from "@/components/perfil/FollowConnectionsDialog";
import { NewsManager, type NewsManagerItem } from "@/components/perfil/NewsManager";
import { ResponsibleAthleteDetails } from "@/components/perfil/ResponsibleAthleteDetails";
import { VideoManager, type VideoManagerItem } from "@/components/perfil/VideoManager";
import { ProfileAvatarUploader } from "@/components/perfil/ProfileAvatarUploader";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  type InterestedAthlete,
  parseInterestedAthletes,
} from "@/lib/profile-interests";

const roleLabels: Record<Role, string> = {
  ATLETA: "Atleta",
  AGENTE: "Agente",
  CLUBE: "Clube",
  TORCEDOR: "Torcedor",
  IMPRENSA: "Imprensa",
  RESPONSAVEL: "Responsável",
};

function getRoleLabel(role: Role | null | undefined) {
  if (!role) return "Perfil";
  return roleLabels[role] ?? "Perfil";
}

function formatPhone(ddd?: string | null, phone?: string | null, whatsapp?: string | null) {
  const raw = (whatsapp ?? "").trim();
  const combined = raw || `${ddd ?? ""}${phone ?? ""}`;
  const digits = combined.replace(/\D/g, "");
  if (!digits) return null;

  const trimmed = digits.length > 11 && digits.startsWith("55") ? digits.slice(-11) : digits;
  if (trimmed.length <= 2) {
    return trimmed;
  }

  const areaCode = trimmed.slice(0, 2);
  const number = trimmed.slice(2);

  if (number.length === 9) {
    return `(${areaCode}) ${number.slice(0, 5)}-${number.slice(5)}`;
  }

  if (number.length === 8) {
    return `(${areaCode}) ${number.slice(0, 4)}-${number.slice(4)}`;
  }

  return `(${areaCode}) ${number}`;
}

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { user: true, favoriteClub: true },
  });

  const interestedAthletes = parseInterestedAthletes(profile?.data ?? null);
  const phone = profile ? formatPhone(profile.ddd, profile.telefone, profile.whatsapp) : null;
  const location = profile
    ? [profile.cidade, profile.uf].filter((part) => part && part.trim().length > 0).join(" - ")
    : null;

  const contactSegments = [location, profile?.user?.email ?? profile?.representanteEmail, phone].filter(
    (segment): segment is string => Boolean(segment && segment.length > 0),
  );
  const hasContactCards = Boolean(location || phone);

  let followersConnections: FollowConnectionProfile[] = [];
  let followingConnections: FollowConnectionProfile[] = [];

  if (profile) {
    const [followersData, followingData] = await Promise.all([
      prisma.follow.findMany({
        where: { followingId: profile.userId },
        orderBy: { createdAt: "desc" },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              profile: {
                select: {
                  displayName: true,
                  role: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
      prisma.follow.findMany({
        where: { followerId: profile.userId },
        orderBy: { createdAt: "desc" },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              profile: {
                select: {
                  displayName: true,
                  role: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const mapToConnection = (
      user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
        profile: {
          displayName: string | null;
          role: Role | null;
          avatarUrl: string | null;
        } | null;
      },
      createdAt: Date,
    ): FollowConnectionProfile => {
      const profileData = user.profile;
      const displayName = profileData?.displayName ?? user.name ?? user.email ?? "Perfil sem nome";
      const avatarUrl = profileData?.avatarUrl ?? user.image ?? null;
      const roleLabel = profileData?.role ? getRoleLabel(profileData.role) : "Perfil";

      return {
        userId: user.id,
        displayName,
        avatarUrl,
        roleLabel,
        since: createdAt.toISOString(),
      };
    };

    followersConnections = followersData.map((entry) =>
      mapToConnection(entry.follower, entry.createdAt),
    );
    followingConnections = followingData.map((entry) =>
      mapToConnection(entry.following, entry.createdAt),
    );
  }

  let newsItems: NewsManagerItem[] = [];
  if (profile?.role === "IMPRENSA") {
    const news = await prisma.news.findMany({
      where: { authorId: profile.userId },
      orderBy: { updatedAt: "desc" },
    });
    newsItems = news.map((item) => ({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt ?? null,
      content: item.content ?? null,
      category: item.category ?? null,
      coverImage: item.coverImage ?? null,
      likesCount: item.likesCount ?? 0,
      publishedAt: item.publishedAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      slug: item.slug,
    }));
  }

  let videoItems: VideoManagerItem[] = [];
  if (profile && (profile.role === "ATLETA" || profile.role === "RESPONSAVEL")) {
    const videos = await prisma.video.findMany({
      where: { userId: profile.userId },
      orderBy: { createdAt: "desc" },
    });
    videoItems = videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description ?? null,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl ?? null,
      likesCount: video.likesCount ?? 0,
      createdAt: video.createdAt.toISOString(),
    }));
  }

  const favoriteTeam: FavoriteTeamInfo | null = profile?.favoriteClub
    ? {
        id: profile.favoriteClub.id,
        clube: profile.favoriteClub.clube,
        sigla: profile.favoriteClub.sigla,
        apelido: profile.favoriteClub.apelido,
        mascote: profile.favoriteClub.mascote,
        divisao: profile.favoriteClub.divisao,
        cidade: profile.favoriteClub.cidade,
        estado: profile.favoriteClub.estado,
        fundacao: profile.favoriteClub.fundacao ?? null,
        maiorIdolo: profile.favoriteClub.maiorIdolo,
      }
    : null;

  const responsibleAthlete = profile?.role === "RESPONSAVEL"
    ? {
        athleteName: profile.atletaNome,
        birthDate: profile.atletaNascimento,
        gender: profile.atletaGenero,
        sport: profile.atletaEsporte,
        modality: profile.atletaModalidade,
        notes: profile.atletaObservacoes,
      }
    : null;

  const interestedContent = interestedAthletes.length > 0
    ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {interestedAthletes.map((athlete) => (
            <article
              key={athlete.id ?? athlete.name}
              className="group relative overflow-hidden rounded-[28px] bg-slate-900 p-6 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.9)] transition-transform duration-300 hover:-translate-y-1 dark:bg-slate-800/80 dark:shadow-[0_32px_70px_-40px_rgba(2,6,23,0.9)]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white">
                <UserRound aria-hidden className="h-8 w-8" />
              </div>
              <div className="mt-6 flex flex-col gap-2 text-white">
                <h3 className="font-heading text-xl font-semibold italic leading-tight">{athlete.name}</h3>
                {athlete.position ? (
                  <p className="text-sm uppercase tracking-[0.24em] text-white/60">{athlete.position}</p>
                ) : null}
                {athlete.club ? <p className="text-sm text-white/70">{athlete.club}</p> : null}
              </div>
            </article>
          ))}
        </div>
      )
    : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[4/5] rounded-[28px] bg-slate-900/90 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.9)] dark:bg-slate-800/60 dark:shadow-[0_32px_70px_-40px_rgba(2,6,23,0.85)]"
            />
          ))}
        </div>
      );

  let sectionTitle = "Conteúdos personalizados";
  let sectionDescription = "Mantenha seu perfil atualizado para desbloquear recursos exclusivos.";
  let sectionContent: ReactNode = (
    <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/90 p-8 text-center text-sm text-slate-500 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.2)] dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-900/70 dark:text-slate-200 dark:shadow-[0_36px_96px_-52px_rgba(2,6,23,0.85)]">
      Complete seu perfil para visualizar conteúdos personalizados aqui.
    </div>
  );

  if (profile) {
    switch (profile.role) {
      case "AGENTE":
      case "CLUBE":
        sectionTitle = "Atletas de interesse";
        sectionDescription =
          "Acompanhe os talentos monitorados e selecionados para oportunidades especiais dentro da Vitrine.";
        sectionContent = interestedContent;
        break;
      case "IMPRENSA":
        sectionTitle = "Seus artigos";
        sectionDescription = "Crie, edite e acompanhe o engajamento das suas publicações.";
        sectionContent = <NewsManager initialNews={newsItems} />;
        break;
      case "ATLETA":
        sectionTitle = "Seus vídeos";
        sectionDescription = "Gerencie suas publicações e acompanhe o total de curtidas.";
        sectionContent = (
          <div className="rounded-[32px] border border-slate-100/70 bg-white/95 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] dark:border-white/5 dark:bg-slate-900/80 dark:shadow-[0_40px_120px_-52px_rgba(2,6,23,0.8)]">
            <VideoManager initialVideos={videoItems} />
          </div>
        );
        break;
      case "RESPONSAVEL":
        sectionTitle = "Conteúdos do atleta";
        sectionDescription = "Atualize os vídeos e mantenha os dados do atleta sempre em destaque.";
        sectionContent = (
          <div className="rounded-[32px] border border-slate-100/70 bg-white/95 p-8 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.45)] dark:border-white/5 dark:bg-slate-900/80 dark:shadow-[0_40px_120px_-52px_rgba(2,6,23,0.8)]">
            <VideoManager initialVideos={videoItems} />
          </div>
        );
        break;
      case "TORCEDOR":
        sectionTitle = "Seu time do coração";
        sectionDescription = "Informações atualizadas sobre o clube que você acompanha.";
        sectionContent = favoriteTeam ? (
          <FavoriteTeamCard team={favoriteTeam} />
        ) : (
          <div className="rounded-[28px] border border-dashed border-slate-200 bg-slate-50/90 p-8 text-center text-sm text-slate-500 shadow-[0_18px_60px_-40px_rgba(15,23,42,0.2)] dark:border-slate-700 dark:bg-gradient-to-br dark:from-slate-900/90 dark:via-slate-900/80 dark:to-slate-900/70 dark:text-slate-200 dark:shadow-[0_36px_96px_-52px_rgba(2,6,23,0.85)]">
            Escolha um clube do coração para visualizar os detalhes aqui.
          </div>
        );
        break;
      default:
        break;
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
      <main className="container flex flex-col gap-16 pb-24 pt-20">
        {profile ? (
          <>
            <section className="relative overflow-hidden rounded-[32px] border border-slate-100/60 bg-white/95 px-8 py-12 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.45)] dark:border-white/5 dark:bg-gradient-to-br dark:from-slate-950/90 dark:via-slate-900/90 dark:to-slate-950/90 dark:shadow-[0_40px_120px_-48px_rgba(2,6,23,0.85)] md:px-12">
              <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl dark:bg-emerald-500/10" aria-hidden />
              <div className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl dark:bg-cyan-500/10" aria-hidden />

              <div className="relative flex flex-col gap-10">
                <span className="inline-flex w-fit items-center rounded-full bg-emerald-100/80 px-5 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700 dark:bg-slate-900/70 dark:text-emerald-200">
                  {getRoleLabel(profile.role)}
                </span>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                    <ProfileAvatarUploader
                      displayName={profile.displayName}
                      initialAvatarUrl={profile.avatarUrl ?? profile.user?.image ?? undefined}
                    />

                    <div className="flex max-w-2xl flex-col gap-4">
                      <h1 className="font-heading text-[40px] font-semibold italic leading-tight text-slate-900 dark:text-white md:text-[48px]">
                        {profile.displayName ?? "Perfil sem nome"}
                      </h1>
                      {contactSegments.length > 0 ? (
                        <p className="text-base leading-relaxed text-slate-500 dark:text-slate-300">
                          {contactSegments.map((segment, index) => (
                            <span key={segment}>
                              {segment}
                              {index < contactSegments.length - 1 ? <span className="px-2 text-slate-300 dark:text-slate-600">|</span> : null}
                            </span>
                          ))}
                        </p>
                      ) : (
                        <p className="text-base leading-relaxed text-slate-400 dark:text-slate-500">
                          Nenhuma informação de contato foi cadastrada ainda.
                        </p>
                      )}

                      <FollowConnectionsDialog
                        followers={followersConnections}
                        following={followingConnections}
                      />

                      {profile.bio ? (
                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-200">{profile.bio}</p>
                      ) : null}
                    </div>
                  </div>

                  {hasContactCards || responsibleAthlete ? (
                    <div className="flex flex-col gap-4 lg:max-w-sm">
                      {hasContactCards ? (
                        <ul className="grid gap-4 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-2">
                          {location ? (
                            <li className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-5 py-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.6)] dark:bg-slate-800/60 dark:shadow-[0_18px_48px_-30px_rgba(2,6,23,0.9)] sm:col-span-2">
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-500 dark:bg-slate-900 dark:text-emerald-300">
                                <MapPin aria-hidden className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Localização</p>
                                <p className="font-medium text-slate-700 dark:text-slate-100">{location}</p>
                              </div>
                            </li>
                          ) : null}

                          {phone ? (
                            <li className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-5 py-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.6)] dark:bg-slate-800/60 dark:shadow-[0_18px_48px_-30px_rgba(2,6,23,0.9)]">
                              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-500 dark:bg-slate-900 dark:text-emerald-300">
                                <Phone aria-hidden className="h-5 w-5" />
                              </span>
                              <div>
                                <p className="text-xs uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Contato</p>
                                <p className="font-medium text-slate-700 dark:text-slate-100">{phone}</p>
                              </div>
                            </li>
                          ) : null}
                        </ul>
                      ) : null}
                      {responsibleAthlete ? (
                        <ResponsibleAthleteDetails {...responsibleAthlete} />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-8">
              <header className="flex flex-col gap-3">
                <h2 className="font-heading text-[32px] font-semibold italic text-slate-900 dark:text-white md:text-[36px]">
                  {sectionTitle}
                </h2>
                <p className="max-w-2xl text-base text-slate-500 dark:text-slate-300">{sectionDescription}</p>
              </header>

              {sectionContent}
            </section>
          </>
        ) : (
          <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-[32px] bg-white px-8 py-16 text-center shadow-[0_32px_80px_-40px_rgba(15,23,42,0.45)] dark:border dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:shadow-[0_40px_120px_-48px_rgba(2,6,23,0.85)]">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-200">
              <UserRound aria-hidden className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <h1 className="font-heading text-[36px] font-semibold italic text-slate-900 dark:text-white">Nenhum perfil cadastrado</h1>
              <p className="text-base text-slate-500 dark:text-slate-300">
                Complete seu cadastro para liberar o acesso às informações e começar a acompanhar seus atletas de interesse.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
