import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { CommentItemType, VideoBlockAppealStatus, VideoVisibilityStatus } from "@prisma/client";

import { SafeVideo } from "@/components/media/SafeMedia";
import { PlayerBackLink } from "@/components/player/BackLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoEngagementPanel } from "@/components/player/VideoEngagementPanel";
import { VideoAppealForm } from "@/components/player/VideoAppealForm";
import prisma from "@/lib/db";
import { fetchCommentThreads } from "@/lib/comments";
import { parseInterestedAthletes } from "@/lib/profile-interests";
import { sampleVideos } from "@/lib/sample-videos";
import { authOptions } from "@/lib/auth";
import { isAdminRole } from "@/lib/admin-auth";

type AgentInfo = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

type CommentInfo = {
  id: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string | null;
};

type VideoDetails = {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  likesCount: number;
  interestedAgents: AgentInfo[];
  comments: CommentInfo[];
  ownerId: string | null;
  visibilityStatus: VideoVisibilityStatus;
  blockReason: string | null;
  blockedAt: string | null;
  blockAppealStatus: VideoBlockAppealStatus | null;
  blockAppealMessage: string | null;
  blockAppealResponse: string | null;
  blockAppealAt: string | null;
  blockAppealResolvedAt: string | null;
};

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "AG";
}

function mapSampleVideo(id: string): VideoDetails | null {
  const sample = sampleVideos.find((video) => video.id === id);
  if (!sample) {
    return null;
  }

  return {
    id: sample.id,
    title: sample.title,
    description: sample.description,
    videoUrl: sample.videoUrl,
    likesCount: sample.likesCount,
    interestedAgents: sample.interestedAgents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      avatarUrl: agent.avatarUrl ?? null,
    })),
    comments: sample.comments.map((comment) => ({
      id: comment.id,
      authorName: comment.authorName,
      authorAvatarUrl: comment.authorAvatarUrl ?? null,
      content: comment.content,
      createdAt: comment.createdAt,
    })),
    ownerId: null,
    visibilityStatus: VideoVisibilityStatus.PUBLIC,
    blockReason: null,
    blockedAt: null,
    blockAppealStatus: null,
    blockAppealMessage: null,
    blockAppealResponse: null,
    blockAppealAt: null,
    blockAppealResolvedAt: null,
  } satisfies VideoDetails;
}

async function fetchAgentsFromInterestTable(videoId: string): Promise<AgentInfo[] | null> {
  try {
    const existenceResult = await prisma.$queryRaw<
      { exists: boolean }[]
    >`SELECT to_regclass('public."VideoInterest"') IS NOT NULL AS exists`;

    const tableExists = existenceResult[0]?.exists ?? false;
    if (!tableExists) {
      return null;
    }

    const rows = await prisma.$queryRaw<
      {
        id: string;
        displayName: string | null;
        name: string | null;
        avatarUrl: string | null;
      }[]
    >`
      SELECT
        p.id,
        p."displayName" AS "displayName",
        u.name AS name,
        p."avatarUrl" AS "avatarUrl"
      FROM "VideoInterest" vi
      JOIN "Profile" p ON p.id = vi."profileId"
      LEFT JOIN "User" u ON u.id = p."userId"
      WHERE vi."videoId" = ${videoId}
      ORDER BY COALESCE(p."displayName", u.name)
    `;

    return rows.map((row) => ({
      id: row.id,
      name: row.displayName?.trim() || row.name?.trim() || "Agente",
      avatarUrl: row.avatarUrl ?? null,
    }));
  } catch (error) {
    console.error("Erro ao consultar tabela de interesses de vídeo", error);
    return null;
  }
}

async function fetchVideoComments(videoId: string): Promise<CommentInfo[]> {
  try {
    const threads = await fetchCommentThreads(CommentItemType.VIDEO, videoId);

    return threads.map((thread) => ({
      id: thread.id,
      authorName: thread.authorName,
      authorAvatarUrl: thread.authorAvatarUrl,
      content: thread.content,
      createdAt: thread.createdAt,
    } satisfies CommentInfo));
  } catch (error) {
    console.error("Erro ao consultar comentários de vídeo", error);
    return [];
  }
}

async function fetchInterestedAgents(videoId: string, athleteUserId: string): Promise<AgentInfo[]> {
  const fromTable = await fetchAgentsFromInterestTable(videoId);
  if (fromTable && fromTable.length > 0) {
    return fromTable;
  }

  const agentProfiles = await prisma.profile.findMany({
    where: { role: "AGENTE" },
    select: {
      id: true,
      displayName: true,
      avatarUrl: true,
      data: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return agentProfiles
    .map((profile) => {
      const interestedAthletes = parseInterestedAthletes(profile.data ?? null);
      const hasInterest = interestedAthletes.some((athlete) => {
        if (!athlete.id) return false;
        return athlete.id === videoId || athlete.id === athleteUserId;
      });

      if (!hasInterest) {
        return null;
      }

      const displayName = profile.displayName?.trim() || profile.user?.name?.trim() || "Agente";

      return {
        id: profile.id,
        name: displayName,
        avatarUrl: profile.avatarUrl ?? null,
      } satisfies AgentInfo;
    })
    .filter((agent): agent is AgentInfo => Boolean(agent));
}

async function fetchVideoDetails(
  id: string,
  options?: { viewerId?: string | null; canModerate?: boolean },
): Promise<VideoDetails | null> {
  const viewerId = options?.viewerId ?? null;
  const canModerate = options?.canModerate ?? false;
  const databaseConfigured = Boolean(process.env.DATABASE_URL);

  if (!databaseConfigured) {
    return mapSampleVideo(id);
  }

  try {
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!video) {
      return mapSampleVideo(id);
    }

    if (
      video.visibilityStatus === VideoVisibilityStatus.BLOCKED &&
      video.userId !== viewerId &&
      !canModerate
    ) {
      return null;
    }

    const interestedAgents = await fetchInterestedAgents(video.id, video.userId);

    const comments = await fetchVideoComments(video.id);

    return {
      id: video.id,
      title: video.title,
      description: video.description ?? null,
      videoUrl: video.videoUrl,
      likesCount: video.likesCount ?? 0,
      interestedAgents,
      comments,
      ownerId: video.user?.id ?? null,
      visibilityStatus: video.visibilityStatus,
      blockReason: video.blockReason ?? null,
      blockedAt: video.blockedAt ? video.blockedAt.toISOString() : null,
      blockAppealStatus: video.blockAppealStatus ?? null,
      blockAppealMessage: video.blockAppealMessage ?? null,
      blockAppealResponse: video.blockAppealResponse ?? null,
      blockAppealAt: video.blockAppealAt ? video.blockAppealAt.toISOString() : null,
      blockAppealResolvedAt: video.blockAppealResolvedAt
        ? video.blockAppealResolvedAt.toISOString()
        : null,
    } satisfies VideoDetails;
  } catch (error) {
    console.error("Erro ao carregar detalhes do vídeo", error);
    return mapSampleVideo(id);
  }
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;
  const viewerRole = session?.user?.role ?? null;
  const canModerate = viewerRole ? isAdminRole(viewerRole) : false;
  const headersList = headers();
  const referer = headersList.get("referer");
  const host = headersList.get("host");

  let backHref = "/";
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererPath = `${refererUrl.pathname}${refererUrl.search}${refererUrl.hash}`;
      if (!host || refererUrl.host === host) {
        backHref = refererPath || "/";
      }
    } catch {
      backHref = "/";
    }
  }

  const backLabel = backHref === "/" ? "Voltar para destaques" : "Voltar";
  const backLinkClasses =
    "inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground";

  const video = await fetchVideoDetails(params.id, { viewerId, canModerate });

  if (!video) {
    notFound();
  }

  const isOwner = Boolean(video.ownerId && video.ownerId === viewerId);
  const isBlocked = video.visibilityStatus === VideoVisibilityStatus.BLOCKED;
  const blockJustification = video.blockReason ?? "Sem justificativa informada.";
  const blockedAtLabel = video.blockedAt
    ? new Date(video.blockedAt).toLocaleString("pt-BR")
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <PlayerBackLink fallbackHref={backHref} label={backLabel} className={backLinkClasses} />

          <div className="flex flex-col gap-12 lg:flex-row">
            <div className="mx-auto w-full max-w-sm flex-shrink-0">
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[36px] border border-border/70 bg-black shadow-[0_32px_96px_-48px_rgba(15,23,42,0.75)]">
                <SafeVideo
                  key={video.id}
                  src={video.videoUrl}
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                  fallbackAlt={video.title}
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-8">
              <VideoEngagementPanel
                videoId={video.id}
                title={video.title}
                description={video.description}
                initialLikes={video.likesCount}
                initialComments={video.comments}
              />

              {isBlocked ? (
                <div className="space-y-4">
                  <div className="space-y-2 rounded-3xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
                    <p className="font-semibold">Vídeo indisponível publicamente</p>
                    <p>
                      Este vídeo foi bloqueado pela moderação
                      {blockedAtLabel ? ` em ${blockedAtLabel}` : ''}. Motivo:
                      {' '}
                      <span className="font-medium">{blockJustification}</span>
                    </p>
                    {!isOwner && canModerate ? (
                      <p className="text-xs text-amber-800 dark:text-amber-200">
                        Você possui permissões administrativas. Analise este caso na área de administração.
                      </p>
                    ) : null}
                  </div>

                  {isOwner ? (
                    <VideoAppealForm
                      videoId={video.id}
                      status={video.blockAppealStatus}
                      initialMessage={video.blockAppealMessage}
                      blockReason={blockJustification}
                      appealAt={video.blockAppealAt}
                      response={video.blockAppealResponse}
                      resolvedAt={video.blockAppealResolvedAt}
                    />
                  ) : null}
                </div>
              ) : null}

              <Card className="border-border/60 bg-card/80 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.65)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Agentes interessados
                  </CardTitle>
                  <CardDescription>
                    Quem marcou este atleta como interesse dentro da plataforma.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {video.interestedAgents.length > 0 ? (
                    <ul className="grid gap-4 sm:grid-cols-2">
                      {video.interestedAgents.map((agent) => {
                        const initials = initialsFromName(agent.name);
                        return (
                          <li
                            key={agent.id}
                            className="flex items-center gap-4 rounded-3xl border border-border/60 bg-background/40 px-4 py-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.7)] backdrop-blur"
                          >
                            <Avatar className="h-12 w-12">
                              {agent.avatarUrl ? <AvatarImage src={agent.avatarUrl} alt={agent.name} /> : null}
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{agent.name}</span>
                              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Agente</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-border/60 bg-background/30 px-6 py-8 text-center text-muted-foreground">
                      Nenhum agente sinalizou interesse neste atleta ainda.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
