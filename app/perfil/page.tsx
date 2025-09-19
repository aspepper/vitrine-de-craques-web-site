import { type Role } from "@prisma/client";
import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

type InterestedAthlete = {
  id?: string;
  name: string;
  club?: string;
  position?: string;
  avatarUrl?: string;
};

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

function parseInterestedAthletes(data: unknown): InterestedAthlete[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const possibleList = (data as { interestedAthletes?: unknown }).interestedAthletes;
  if (!Array.isArray(possibleList)) {
    return [];
  }

  return possibleList
    .filter((item): item is InterestedAthlete => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Record<string, unknown>;
      return typeof candidate.name === "string" && candidate.name.trim().length > 0;
    })
    .map((item) => {
      const candidate = item as Record<string, unknown>;
      return {
        id: typeof candidate.id === "string" ? candidate.id : undefined,
        name: String(candidate.name),
        club: typeof candidate.club === "string" ? candidate.club : undefined,
        position: typeof candidate.position === "string" ? candidate.position : undefined,
        avatarUrl: typeof candidate.avatarUrl === "string" ? candidate.avatarUrl : undefined,
      } satisfies InterestedAthlete;
    });
}

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  const interestedAthletes = parseInterestedAthletes(profile?.data ?? null);
  const phone = profile ? formatPhone(profile.ddd, profile.telefone, profile.whatsapp) : null;
  const location = profile
    ? [profile.cidade, profile.uf].filter((part) => part && part.trim().length > 0).join(" - ")
    : null;

  const contactSegments = [location, profile?.user?.email ?? profile?.representanteEmail, phone].filter(
    (segment): segment is string => Boolean(segment && segment.length > 0),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="container flex flex-col gap-16 pb-24 pt-20">
        {profile ? (
          <>
            <section className="relative overflow-hidden rounded-[32px] bg-white px-8 py-12 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.45)] md:px-12">
              <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-emerald-200/60 blur-3xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" aria-hidden />

              <div className="relative flex flex-col gap-10">
                <span className="inline-flex w-fit items-center rounded-full bg-emerald-100/80 px-5 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">
                  {getRoleLabel(profile.role)}
                </span>

                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-500 p-[6px] shadow-[0_24px_48px_-28px_rgba(8,145,178,0.9)]">
                      <Avatar className="h-full w-full">
                        <AvatarImage alt={profile.displayName ?? "Avatar"} src={profile.avatarUrl ?? undefined} />
                        <AvatarFallback className="rounded-full bg-white/40 text-emerald-500">
                          <UserRound aria-hidden className="h-12 w-12" />
                          <span className="sr-only">{profile.displayName ?? "Perfil"}</span>
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex max-w-2xl flex-col gap-4">
                      <h1 className="font-heading text-[40px] font-semibold italic leading-tight text-slate-900 md:text-[48px]">
                        {profile.displayName ?? "Perfil sem nome"}
                      </h1>
                      {contactSegments.length > 0 ? (
                        <p className="text-base leading-relaxed text-slate-500">
                          {contactSegments.map((segment, index) => (
                            <span key={segment}>
                              {segment}
                              {index < contactSegments.length - 1 ? <span className="px-2 text-slate-300">|</span> : null}
                            </span>
                          ))}
                        </p>
                      ) : (
                        <p className="text-base leading-relaxed text-slate-400">
                          Nenhuma informação de contato foi cadastrada ainda.
                        </p>
                      )}

                      {profile.bio ? (
                        <p className="text-lg leading-relaxed text-slate-600">{profile.bio}</p>
                      ) : null}
                    </div>
                  </div>

                  <ul className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2 lg:max-w-sm">
                    {location ? (
                      <li className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-5 py-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.6)]">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-500">
                          <MapPin aria-hidden className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Localização</p>
                          <p className="font-medium text-slate-700">{location}</p>
                        </div>
                      </li>
                    ) : null}

                    {profile?.user?.email || profile?.representanteEmail ? (
                      <li className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-5 py-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.6)]">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-500">
                          <Mail aria-hidden className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">E-mail</p>
                          <p className="font-medium text-slate-700">{profile.user?.email ?? profile.representanteEmail}</p>
                        </div>
                      </li>
                    ) : null}

                    {phone ? (
                      <li className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-5 py-4 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.6)]">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-emerald-500">
                          <Phone aria-hidden className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Contato</p>
                          <p className="font-medium text-slate-700">{phone}</p>
                        </div>
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-8">
              <header className="flex flex-col gap-3">
                <h2 className="font-heading text-[32px] font-semibold italic text-slate-900 md:text-[36px]">
                  Atletas de interesse
                </h2>
                <p className="max-w-2xl text-base text-slate-500">
                  Acompanhe os talentos monitorados e selecionados para oportunidades especiais dentro da Vitrine.
                </p>
              </header>

              {interestedAthletes.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {interestedAthletes.map((athlete) => (
                    <article
                      key={athlete.id ?? athlete.name}
                      className="group relative overflow-hidden rounded-[28px] bg-slate-900 p-6 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.9)] transition-transform duration-300 hover:-translate-y-1"
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
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className="aspect-[4/5] rounded-[28px] bg-slate-900/90 shadow-[0_28px_60px_-36px_rgba(15,23,42,0.9)]"
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-[32px] bg-white px-8 py-16 text-center shadow-[0_32px_80px_-40px_rgba(15,23,42,0.45)]">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <UserRound aria-hidden className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <h1 className="font-heading text-[36px] font-semibold italic text-slate-900">Nenhum perfil cadastrado</h1>
              <p className="text-base text-slate-500">
                Complete seu cadastro para liberar o acesso às informações e começar a acompanhar seus atletas de interesse.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
