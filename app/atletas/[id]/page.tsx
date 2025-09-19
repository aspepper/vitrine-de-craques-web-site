import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logError } from "@/lib/error";

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getAthlete(id: string) {
  const res = await fetch(`${baseUrl}/api/atletas/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getAthleteVideos(userId: string) {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const { default: prisma } = await import("@/lib/db");

    return await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch (error) {
    await logError(error, "AO BUSCAR VÍDEOS DO ATLETA", { userId });
    return [];
  }
}

interface PageProps {
  params: { id: string };
}

type AthleteProfile = Awaited<ReturnType<typeof getAthlete>>;
type AthleteVideo = Awaited<ReturnType<typeof getAthleteVideos>>[number];

function getInitials(name?: string | null) {
  if (!name) return "AT";
  const [first, second] = name.trim().split(/\s+/);
  if (!second) {
    return first.slice(0, 2).toUpperCase();
  }
  return `${first[0]}${second[0]}`.toUpperCase();
}

function parseBirthDate(value?: string | null) {
  if (!value) return null;

  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) {
    return direct;
  }

  const parts = value.split(/[\\/-]/).map((part) => part.trim());
  if (parts.length !== 3) {
    return null;
  }

  const [first, second, third] = parts;
  const isYearFirst = first.length === 4;
  const day = Number(isYearFirst ? third : first);
  const month = Number(second);
  const year = Number(isYearFirst ? first : third);

  if (!day || !month || !year) {
    return null;
  }

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

function calculateAge(birthDate?: string | null) {
  const date = parseBirthDate(birthDate);
  if (!date) return null;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  const dayDiff = today.getDate() - date.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age >= 0 ? age : null;
}

function buildMeta(profile: AthleteProfile) {
  if (!profile) return "";

  const parts: string[] = [];

  if (profile.posicao) {
    parts.push(profile.posicao);
  }

  const age = calculateAge(profile.nascimento);
  if (age !== null) {
    parts.push(`${age} anos`);
  }

  if (profile.altura) {
    parts.push(profile.altura);
  }

  const city = profile.cidade?.trim();
  const state = profile.uf?.trim();
  if (city || state) {
    parts.push([city, state].filter(Boolean).join("/"));
  }

  return parts.join(" • ");
}

function buildDetails(profile: AthleteProfile) {
  if (!profile) return [];

  return [
    profile.perna && { label: "Perna dominante", value: profile.perna },
    profile.peso && { label: "Peso", value: profile.peso },
    profile.clube && { label: "Clube", value: profile.clube },
    profile.pais && { label: "País", value: profile.pais },
  ].filter(Boolean) as { label: string; value: string }[];
}

function formatVideoDate(video: AthleteVideo) {
  if (!video?.createdAt) return "";

  const date = new Date(video.createdAt);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AthleteVideoCard({ video, author }: { video: AthleteVideo; author?: string | null }) {
  return (
    <Link
      href={`/player/${video.id}`}
      className="group block h-full overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_35px_90px_-50px_rgba(15,23,42,0.5)]"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 90vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm font-semibold uppercase tracking-[0.12em] text-slate-200">
            Vídeo
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
      </div>
      <div className="space-y-2 px-6 pb-6 pt-5">
        <p className="text-base font-semibold text-slate-900">{video.title}</p>
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          {author ? <span>{author}</span> : <span />}
          <span>{formatVideoDate(video)}</span>
        </div>
      </div>
    </Link>
  );
}

export default async function AtletaDetalhePage({ params }: PageProps) {
  const profile = await getAthlete(params.id);
  if (!profile) {
    notFound();
  }

  const videos = profile.userId ? await getAthleteVideos(profile.userId) : [];
  const details = buildDetails(profile);
  const meta = buildMeta(profile);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="mx-auto max-w-6xl space-y-12">
          <header className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
              Perfil do Atleta
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">{profile.displayName}</h1>
            {meta && <p className="text-base text-slate-600">{meta}</p>}
          </header>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,360px),1fr]">
            <Card className="rounded-[32px] border-slate-200/60 bg-white/90 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
              <CardHeader className="items-center space-y-6 p-8 pb-0 text-center">
                <Avatar className="h-32 w-32 border-4 border-white/90 bg-slate-100 text-2xl font-semibold text-slate-700 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.45)]">
                  {profile.avatarUrl && (
                    <AvatarImage src={profile.avatarUrl} alt={profile.displayName || "Atleta"} />
                  )}
                  <AvatarFallback className="text-2xl font-semibold uppercase tracking-[0.16em] text-slate-600">
                    {getInitials(profile.displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-3">
                  <CardTitle className="text-2xl font-semibold text-slate-900">
                    {profile.displayName}
                  </CardTitle>
                  {meta && <p className="text-sm font-medium text-slate-500">{meta}</p>}
                  <Button className="bg-sky-500 px-8 text-base font-semibold text-white shadow-[0_20px_45px_-30px_rgba(14,116,144,0.9)] transition hover:bg-sky-500/90">
                    Manifestar Interesse
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                {details.length > 0 && (
                  <dl className="grid gap-5 text-left sm:grid-cols-2">
                    {details.map((detail) => (
                      <div key={detail.label} className="space-y-1">
                        <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {detail.label}
                        </dt>
                        <dd className="text-base font-medium text-slate-700">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {profile.bio ? (
                  <div className="rounded-3xl bg-slate-50/80 p-5 text-sm leading-relaxed text-slate-600">
                    {profile.bio}
                  </div>
                ) : (
                  <div className="rounded-3xl bg-slate-50/80 p-5 text-sm leading-relaxed text-slate-600">
                    Este atleta ainda não adicionou uma descrição pessoal.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col justify-between rounded-[32px] border-slate-200/60 bg-white/95 p-10 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-500">
                  Time Vitrine de Craques
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">Plano de evolução personalizada</h2>
                <p className="text-base leading-relaxed text-slate-600">
                  Acompanhe treinos, histórico e estatísticas do atleta com um painel exclusivo.
                  Compartilhe com olheiros, clubes e parceiros toda a evolução dentro e fora de campo.
                </p>
              </div>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-700">
                  Relatórios atualizados de desempenho, metas e destaques por temporada.
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-sky-700">
                  Canal direto para contatos profissionais e oportunidades de visibilidade.
                </div>
              </div>
            </Card>
          </div>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Vídeos</h2>
                <p className="text-sm text-slate-500">
                  Últimos destaques publicados pelo atleta na Vitrine de Craques.
                </p>
              </div>
              {videos.length > 0 && (
                <Link
                  href={`/player?user=${profile.userId}`}
                  className="text-sm font-semibold text-sky-600 transition hover:text-sky-700"
                >
                  Ver todos
                </Link>
              )}
            </div>

            {videos.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {videos.map((video) => (
                  <AthleteVideoCard key={video.id} video={video} author={profile.displayName} />
                ))}
              </div>
            ) : (
              <div className="rounded-[32px] border border-dashed border-slate-300/80 bg-white/70 p-10 text-center text-sm text-slate-500">
                Nenhum vídeo foi publicado por este atleta até o momento.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
