import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { FollowButton } from "@/components/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { getFollowInfo } from "@/lib/follow";
import type { Role } from "@prisma/client";

const roleLabel: Partial<Record<Role, string>> = {
  ATLETA: "Atleta",
  AGENTE: "Agente",
  CLUBE: "Clube",
  TORCEDOR: "Torcedor",
  IMPRENSA: "Imprensa",
  RESPONSAVEL: "Responsável",
  ADMINISTRADOR: "Administrador",
  SUPER: "Super",
  MODERADOR: "Moderador",
};

interface PageProps {
  params: { id: string };
}

export default async function PerfilPublicoPage({ params }: PageProps) {
  noStore();

  const profile = await prisma.profile.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!profile) {
    notFound();
  }

  if (profile.role === "ATLETA") {
    redirect(`/atletas/${profile.id}`);
  }

  if (profile.role === "AGENTE") {
    redirect(`/agentes/${profile.id}`);
  }

  const session = await getServerSession(authOptions);
  const viewerId = session?.user?.id ?? null;
  const targetUserId = profile.userId ?? null;

  let followerCount = 0;
  let isFollowing = false;
  if (targetUserId && process.env.DATABASE_URL) {
    const info = await getFollowInfo(targetUserId, viewerId ?? undefined);
    followerCount = info.followerCount;
    isFollowing = info.isFollowing;
  }

  const isOwnProfile = Boolean(viewerId && targetUserId && viewerId === targetUserId);
  const canInteract = Boolean(viewerId && targetUserId && viewerId !== targetUserId);
  const loginRedirectTo = `/login?callbackUrl=/perfis/${params.id}`;
  const followersLabel = new Intl.NumberFormat("pt-BR").format(followerCount);
  const followersText = followerCount === 1 ? "seguidor" : "seguidores";
  const displayName = profile.displayName?.trim() || profile.user?.name || "Perfil";
  const avatarUrl = profile.avatarUrl ?? profile.user?.image ?? null;
  const role = profile.role ? roleLabel[profile.role] ?? profile.role : "Perfil";

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            Início
          </Link>

          <Card className="overflow-hidden rounded-[32px] border-slate-200/60 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
            <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
              <Avatar className="h-32 w-32 border-4 border-white/90 bg-slate-100 text-2xl font-semibold text-slate-700 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.45)]">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                <AvatarFallback className="text-2xl font-semibold uppercase tracking-[0.16em] text-slate-600">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex w-full flex-col items-center gap-3">
                <div>
                  <h1 className="text-3xl font-semibold text-slate-900">{displayName}</h1>
                  <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">{role}</p>
                </div>
                {!targetUserId || isOwnProfile ? (
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                    {followersLabel} {followersText}
                  </p>
                ) : (
                  <FollowButton
                    targetUserId={targetUserId}
                    initialIsFollowing={isFollowing}
                    initialFollowerCount={followerCount}
                    canInteract={canInteract}
                    loginRedirectTo={loginRedirectTo}
                    appearance="light"
                  />
                )}
              </div>

              {profile.bio ? (
                <p className="max-w-xl text-sm text-slate-600">{profile.bio}</p>
              ) : null}

              {profile.site ? (
                <Link
                  href={profile.site}
                  className="text-sm font-medium text-emerald-600 underline-offset-4 hover:underline"
                >
                  {profile.site}
                </Link>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(2, "");
}
