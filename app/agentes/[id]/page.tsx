import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { UserRound } from "lucide-react";

import { FollowButton } from "@/components/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { getFollowInfo } from "@/lib/follow";
import { parseInterestedAthletes } from "@/lib/profile-interests";

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

interface AgentProfile {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  data: unknown;
  areaAtuacao: string | null;
  portfolio: string | null;
  site: string | null;
  registroCbf: string | null;
  registroFifa: string | null;
  cidade: string | null;
  uf: string | null;
  telefone: string | null;
  whatsapp: string | null;
  ddd: string | null;
  emailClube: string | null;
  redesSociais: string | null;
  userId: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    email: string | null;
  } | null;
}

async function getAgent(id: string): Promise<AgentProfile | null> {
  const res = await fetch(`${baseUrl}/api/agentes/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

type InfoValue =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string }
  | { type: "list"; value: Array<{ label: string; href?: string }> };

type InfoItem = {
  label: string;
  content: InfoValue;
};

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

function ensureUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (/^www\./i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  if (/[.]/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}

function splitSocialLinks(value: string | null): string[] {
  if (!value) return [];
  return value
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function buildInfoItems(profile: AgentProfile) {
  const location = [profile.cidade, profile.uf].filter((part) => part && part.trim().length > 0).join(" - ");
  const siteUrl = profile.site?.trim() ? ensureUrl(profile.site) : null;
  const portfolioUrl = profile.portfolio?.trim() ? ensureUrl(profile.portfolio) : null;
  const phone = formatPhone(profile.ddd, profile.telefone, null);
  const whatsapp = formatPhone(profile.ddd, null, profile.whatsapp);
  const email = profile.emailClube?.trim() || profile.user?.email?.trim() || null;
  const socialLinks = splitSocialLinks(profile.redesSociais);

  const infoItems: InfoItem[] = [];

  if (profile.areaAtuacao?.trim()) {
    infoItems.push({
      label: "Área de atuação",
      content: { type: "text", value: profile.areaAtuacao.trim() },
    });
  }

  if (profile.registroCbf?.trim()) {
    infoItems.push({
      label: "Registro CBF",
      content: { type: "text", value: profile.registroCbf.trim() },
    });
  }

  if (profile.registroFifa?.trim()) {
    infoItems.push({
      label: "Registro FIFA",
      content: { type: "text", value: profile.registroFifa.trim() },
    });
  }

  if (location) {
    infoItems.push({
      label: "Localização",
      content: { type: "text", value: location },
    });
  }

  if (siteUrl) {
    infoItems.push({
      label: "Site oficial",
      content: { type: "link", value: profile.site!.trim(), href: siteUrl },
    });
  }

  if (portfolioUrl) {
    infoItems.push({
      label: "Portfólio",
      content: { type: "link", value: profile.portfolio!.trim(), href: portfolioUrl },
    });
  }

  if (email) {
    infoItems.push({
      label: "E-mail",
      content: { type: "link", value: email, href: `mailto:${email}` },
    });
  }

  if (phone) {
    const digits = phone.replace(/\D/g, "");
    const telHref = digits.length === 11 ? `tel:+55${digits}` : `tel:${digits}`;
    infoItems.push({
      label: "Telefone",
      content: { type: "link", value: phone, href: telHref },
    });
  }

  if (whatsapp) {
    const digits = whatsapp.replace(/\D/g, "");
    const waNumber = digits.length === 11 ? `55${digits}` : digits;
    infoItems.push({
      label: "WhatsApp",
      content: { type: "link", value: whatsapp, href: `https://wa.me/${waNumber}` },
    });
  }

  if (socialLinks.length > 0) {
    infoItems.push({
      label: socialLinks.length > 1 ? "Redes sociais" : "Rede social",
      content: {
        type: "list",
        value: socialLinks.map((entry) => {
          const href = /^https?:\/\//i.test(entry) || /^www\./i.test(entry) || /[.]/.test(entry)
            ? ensureUrl(entry) ?? undefined
            : undefined;
          return { label: entry, href };
        }),
      },
    });
  }

  return infoItems;
}

export default async function AgenteDetalhePage({ params }: { params: { id: string } }) {
  noStore();

  const profile = await getAgent(params.id);
  if (!profile) {
    notFound();
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
  const loginRedirectTo = `/login?callbackUrl=/agentes/${params.id}`;
  const followersLabel = new Intl.NumberFormat("pt-BR").format(followerCount);
  const displayName = profile.displayName?.trim() || profile.user?.name || "Agente";
  const avatarUrl = profile.avatarUrl ?? profile.user?.image ?? null;
  const infoItems = buildInfoItems(profile);
  const interestedAthletes = parseInterestedAthletes(profile.data);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-10">
          <Link
            href="/agentes"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            Voltar para agentes
          </Link>

          <Card className="overflow-hidden rounded-[32px] border-slate-200/60 bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.35)]">
            <CardContent className="flex flex-col gap-8 p-8 sm:p-12">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:gap-10 sm:text-left">
                <Avatar className="h-32 w-32 border-4 border-white/90 bg-slate-100 text-2xl font-semibold text-slate-700 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.45)]">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                  <AvatarFallback className="text-2xl font-semibold uppercase tracking-[0.16em] text-slate-600">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex w-full flex-col items-center gap-4 sm:items-start">
                  <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold text-slate-900">{displayName}</h1>
                    <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Agente</p>
                  </div>

                  {profile.bio ? (
                    <p className="max-w-2xl text-sm text-slate-600 sm:text-base">{profile.bio}</p>
                  ) : null}

                  {infoItems.length > 0 ? (
                    <div className="grid w-full gap-4 sm:grid-cols-2">
                      {infoItems.slice(0, 4).map((item) => (
                        <InfoCard key={item.label} item={item} />
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex w-full max-w-[220px] flex-col items-center gap-3 sm:items-end">
                  {!targetUserId || isOwnProfile ? (
                    <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      {followersLabel} seguidores
                    </p>
                  ) : (
                    <>
                      <FollowButton
                        targetUserId={targetUserId}
                        initialIsFollowing={isFollowing}
                        initialFollowerCount={followerCount}
                        canInteract={canInteract}
                        loginRedirectTo={loginRedirectTo}
                        appearance="light"
                      />
                      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                        {followersLabel} seguidores
                      </p>
                    </>
                  )}
                </div>
              </div>

              {infoItems.length > 4 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {infoItems.slice(4).map((item) => (
                    <InfoCard key={item.label} item={item} />
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <section className="space-y-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-slate-900">Atletas de interesse</h2>
              <p className="text-sm text-slate-600">
                Talentos monitorados e salvos pelo agente dentro da Vitrine de Craques.
              </p>
            </div>

            {interestedAthletes.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {interestedAthletes.map((athlete) => (
                  <Card
                    key={athlete.id ?? athlete.name}
                    className="rounded-3xl border-slate-200 bg-white/95 shadow-[0_26px_60px_-45px_rgba(15,23,42,0.35)]"
                  >
                    <CardContent className="flex items-center gap-4 p-6">
                      <Avatar className="h-14 w-14 border border-slate-200 bg-slate-100">
                        {athlete.avatarUrl ? <AvatarImage src={athlete.avatarUrl} alt={athlete.name} /> : null}
                        <AvatarFallback className="bg-slate-900/5 text-slate-600">
                          <UserRound className="h-6 w-6" aria-hidden />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-col gap-1">
                        <p className="truncate text-base font-semibold text-slate-900">{athlete.name}</p>
                        {athlete.position ? (
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            {athlete.position}
                          </p>
                        ) : null}
                        {athlete.club ? (
                          <p className="truncate text-sm text-slate-600">{athlete.club}</p>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="rounded-3xl border-dashed border-slate-200 bg-white/70">
                <CardContent className="p-10 text-center text-sm text-slate-500 sm:text-base">
                  Nenhum atleta de interesse foi adicionado ainda.
                </CardContent>
              </Card>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function InfoCard({ item }: { item: InfoItem }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-slate-50/70 p-5 shadow-[0_12px_36px_-28px_rgba(15,23,42,0.35)]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
      <div className="mt-2 text-sm text-slate-700">
        {item.content.type === "text" ? (
          <span>{item.content.value}</span>
        ) : item.content.type === "link" ? (
          <Link
            href={item.content.href}
            target={item.content.href.startsWith("http") ? "_blank" : undefined}
            rel={item.content.href.startsWith("http") ? "noreferrer" : undefined}
            className="text-sm font-medium text-emerald-600 underline-offset-4 hover:underline"
          >
            {item.content.value}
          </Link>
        ) : (
          <ul className="space-y-2">
            {item.content.value.map((entry) => (
              <li key={entry.label}>
                {entry.href ? (
                  <Link
                    href={entry.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-emerald-600 underline-offset-4 hover:underline"
                  >
                    {entry.label}
                  </Link>
                ) : (
                  <span>{entry.label}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
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
