import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/db";
import { parseInterestedAthletes } from "@/lib/profile-interests";
import { sampleVideos } from "@/lib/sample-videos";

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
};

const numberFormatter = new Intl.NumberFormat("pt-BR");
const commentDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

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
    const existenceResult = await prisma.$queryRaw<
      { exists: boolean }[]
    >`SELECT to_regclass('public."VideoComment"') IS NOT NULL AS exists`;

    const tableExists = existenceResult[0]?.exists ?? false;
    if (!tableExists) {
      return [];
    }

    const rows = await prisma.$queryRaw<
      {
        id: string;
        content: string | null;
        createdAt: Date | null;
        displayName: string | null;
        name: string | null;
        avatarUrl: string | null;
      }[]
    >`
      SELECT
        vc.id,
        vc."content" AS "content",
        vc."createdAt" AS "createdAt",
        p."displayName" AS "displayName",
        u.name AS name,
        p."avatarUrl" AS "avatarUrl"
      FROM "VideoComment" vc
      LEFT JOIN "Profile" p ON p.id = vc."profileId"
      LEFT JOIN "User" u ON u.id = p."userId"
      WHERE vc."videoId" = ${videoId}
      ORDER BY vc."createdAt" DESC
    `;

    return rows
      .map((row) => {
        const authorName = row.displayName?.trim() || row.name?.trim() || "Agente";
        const content = row.content?.trim();
        if (!content) {
          return null;
        }

        return {
          id: row.id,
          authorName,
          authorAvatarUrl: row.avatarUrl ?? null,
          content,
          createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
        } satisfies CommentInfo;
      })
      .filter((comment): comment is CommentInfo => Boolean(comment));
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

async function fetchVideoDetails(id: string): Promise<VideoDetails | null> {
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
    } satisfies VideoDetails;
  } catch (error) {
    console.error("Erro ao carregar detalhes do vídeo", error);
    return mapSampleVideo(id);
  }
}

export default async function PlayerPage({ params }: { params: { id: string } }) {
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

  const video = await fetchVideoDetails(params.id);

  if (!video) {
    notFound();
  }

  const formattedLikes = numberFormatter.format(video.likesCount);
  const formattedCommentsCount = numberFormatter.format(video.comments.length);

  return (
    <div className="flex min-h-screen flex-col bg-background transition-colors">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <Link
            href={backHref}
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <span aria-hidden>←</span>
            {backLabel}
          </Link>

          <div className="flex flex-col gap-12 lg:flex-row">
            <div className="mx-auto w-full max-w-sm flex-shrink-0">
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[36px] border border-border/70 bg-black shadow-[0_32px_96px_-48px_rgba(15,23,42,0.75)]">
                <video
                  key={video.id}
                  src={video.videoUrl}
                  controls
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-8">
              <Card className="border-border/60 bg-card/80 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.65)] backdrop-blur">
                <CardHeader className="space-y-4">
                  <span className="inline-flex rounded-full bg-secondary/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-secondary-foreground">
                    Vídeo do atleta
                  </span>
                  <CardTitle className="font-heading text-4xl font-semibold leading-tight text-foreground">
                    {video.title}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
                    <span>{formattedLikes} curtidas</span>
                    <span aria-hidden className="text-muted-foreground/60">
                      •
                    </span>
                    <span>{formattedCommentsCount} comentários</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-base leading-relaxed text-foreground/90">
                  {video.description ? (
                    <p>{video.description}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      Este vídeo ainda não possui uma descrição detalhada.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/80 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.65)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    Comentários
                  </CardTitle>
                  <CardDescription>
                    Feedbacks publicados por agentes e clubes que assistiram ao conteúdo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {video.comments.length > 0 ? (
                    <ul className="flex flex-col gap-4">
                      {video.comments.map((comment) => {
                        const initials = initialsFromName(comment.authorName);
                        const commentDate = comment.createdAt ? new Date(comment.createdAt) : null;
                        const formattedDate = commentDate ? commentDateFormatter.format(commentDate) : null;

                        return (
                          <li
                            key={comment.id}
                            className="flex gap-4 rounded-3xl border border-border/60 bg-background/40 px-5 py-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.7)] backdrop-blur"
                          >
                            <Avatar className="h-12 w-12">
                              {comment.authorAvatarUrl ? (
                                <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} />
                              ) : null}
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 flex-col gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-medium text-foreground">{comment.authorName}</span>
                                {formattedDate ? (
                                  <span className="text-xs text-muted-foreground">{formattedDate}</span>
                                ) : null}
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/90">{comment.content}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-border/60 bg-background/30 px-6 py-8 text-center text-muted-foreground">
                      Nenhum comentário foi registrado para este vídeo até o momento.
                    </div>
                  )}
                </CardContent>
              </Card>

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
