import type { Prisma } from "@prisma/client";

import { Filters } from "@/components/Filters";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import prisma from "@/lib/db";

export const revalidate = 0;

type ArquibancadaMember = Awaited<ReturnType<typeof getArquibancadaMembers>>[number];

function normalizeText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function formatWhatsapp(value?: string | null) {
  const sanitized = normalizeText(value);
  if (!sanitized) return null;

  const digits = sanitized.replace(/\D+/g, "");
  if (digits.length < 10) {
    return sanitized;
  }

  const phoneDigits = digits.slice(-11);
  const countryDigits = digits.slice(0, digits.length - phoneDigits.length);
  const areaCode = phoneDigits.slice(0, 2);
  const firstPart = phoneDigits.length === 10 ? phoneDigits.slice(2, 6) : phoneDigits.slice(2, 7);
  const secondPart = phoneDigits.length === 10 ? phoneDigits.slice(6) : phoneDigits.slice(7);

  const countryPrefix = countryDigits ? `+${countryDigits} ` : "";
  const separator = secondPart ? "-" : "";

  return `${countryPrefix}(${areaCode}) ${firstPart}${separator}${secondPart}`.trim();
}

function buildMemberSubtitle(member: ArquibancadaMember) {
  const locationParts = [normalizeText(member.cidade), normalizeText(member.uf)];
  const locationLabel = locationParts.filter(Boolean).join(" / ");

  const clubName = normalizeText(member.favoriteClub?.clube);
  const clubSigla = normalizeText(member.favoriteClub?.sigla);
  const clubLabel = [clubName, clubSigla ? `(${clubSigla})` : null]
    .filter(Boolean)
    .join(" ");

  const subtitleSegments: string[] = [];
  if (clubLabel) subtitleSegments.push(`Apaixonado por ${clubLabel}`);
  if (locationLabel) subtitleSegments.push(locationLabel);

  return subtitleSegments.join(" • ");
}

function buildNotificationPreferences(member: ArquibancadaMember) {
  const preferences: string[] = [];

  if (member.notifNovidades) preferences.push("Novidades");
  if (member.notifJogos) preferences.push("Jogos");
  if (member.notifEventos) preferences.push("Eventos");
  if (member.notifAtletas) preferences.push("Atletas");

  return preferences;
}

async function getArquibancadaMembers(search: string) {
  const where: Prisma.ProfileWhereInput = {
    role: "TORCEDOR",
  };

  if (search) {
    const contains = {
      contains: search,
      mode: "insensitive" as const,
    };

    where.OR = [
      { displayName: contains },
      { cidade: contains },
      { uf: contains },
      { bio: contains },
      { whatsapp: contains },
      { user: { name: contains } },
      { favoriteClub: { clube: contains } },
      { favoriteClub: { sigla: contains } },
      { favoriteClub: { apelido: contains } },
      { favoriteClub: { cidade: contains } },
    ];
  }

  return prisma.profile.findMany({
    where,
    include: {
      favoriteClub: {
        select: {
          clube: true,
          sigla: true,
          cidade: true,
          estado: true,
        },
      },
      user: {
        select: {
          image: true,
          name: true,
        },
      },
    },
    orderBy: [
      { displayName: "asc" },
      { createdAt: "asc" },
    ],
  });
}

interface PageProps {
  searchParams: {
    q?: string;
  };
}

export default async function ArquibancadaPage({ searchParams }: PageProps) {
  const search = (searchParams.q || "").trim();
  const members = await getArquibancadaMembers(search);

  return (
    <div className="min-h-screen bg-background transition-colors">
      <main className="container mx-auto flex flex-col gap-12 px-4 pb-24 pt-10 md:pt-12">
        <header className="space-y-8">
          <div className="space-y-3 text-center md:text-left">
            <h1 className="font-heading text-[44px] font-semibold leading-tight text-foreground md:text-[56px]">
              Arquibancada
            </h1>
            <div className="mx-auto flex max-w-2xl flex-col gap-2 text-base text-muted-foreground md:mx-0">
              <p>
                Explore os integrantes da Arquibancada e filtre por nome, clube favorito ou cidade.
              </p>
              <p>
                Interaja com atletas, clubes e agentes credenciados pela CBF ou empresários/olheiros. O envio de vídeos não está
                disponível para este perfil.
              </p>
            </div>
          </div>

          <div className="rounded-[32px] border border-border/80 bg-card/80 px-6 py-6 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <Filters
              defaultValue={search}
              method="get"
              placeholder="Filtros: Nome, Clube, Cidade"
            />
          </div>
        </header>

        <section className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((member) => {
              const displayName =
                normalizeText(member.displayName) ||
                normalizeText(member.user?.name) ||
                "Integrante";
              const avatarUrl =
                normalizeText(member.avatarUrl) ||
                normalizeText(member.user?.image) ||
                null;
              const initials = displayName
                .split(/\s+/)
                .filter(Boolean)
                .map((segment) => segment[0]!.toUpperCase())
                .slice(0, 2)
                .join("");
              const subtitle = buildMemberSubtitle(member);
              const whatsapp = formatWhatsapp(member.whatsapp);
              const gender = normalizeText(member.genero);
              const birthDate = normalizeText(member.nascimento);
              const preferences = buildNotificationPreferences(member);

              return (
                <article
                  key={member.id}
                  className="flex h-full flex-col gap-4 rounded-[32px] border border-border/80 bg-card/90 p-6 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_32px_72px_-32px_rgba(15,23,42,0.45)]"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 shrink-0 border border-border/80 bg-foreground text-lg font-semibold text-background shadow-[0_18px_32px_-18px_rgba(15,23,42,0.6)]">
                      {avatarUrl ? <AvatarImage alt={displayName} src={avatarUrl} /> : null}
                      <AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">
                        {initials || "AQ"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h2 className="font-heading text-lg font-semibold italic text-foreground">
                        {displayName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {subtitle || "Informações não disponíveis"}
                      </p>
                    </div>
                  </div>

                  {normalizeText(member.bio) ? (
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {member.bio}
                    </p>
                  ) : null}

                  <dl className="space-y-3 text-sm text-muted-foreground">
                    {normalizeText(member.favoriteClub?.clube) ? (
                      <div className="space-y-1">
                        <dt className="font-semibold text-foreground">Clube do coração</dt>
                        <dd>
                          {normalizeText(member.favoriteClub?.clube)}
                          {normalizeText(member.favoriteClub?.sigla)
                            ? ` (${member.favoriteClub?.sigla})`
                            : ""}
                        </dd>
                        {normalizeText(member.favoriteClub?.cidade) ? (
                          <dd>
                            {member.favoriteClub?.cidade}
                            {normalizeText(member.favoriteClub?.estado)
                              ? `, ${member.favoriteClub?.estado}`
                              : ""}
                          </dd>
                        ) : null}
                      </div>
                    ) : null}

                    {normalizeText(member.cidade) || normalizeText(member.uf) ? (
                      <div className="space-y-1">
                        <dt className="font-semibold text-foreground">Localidade</dt>
                        <dd>
                          {[normalizeText(member.cidade), normalizeText(member.uf)]
                            .filter(Boolean)
                            .join(" / ")}
                        </dd>
                      </div>
                    ) : null}

                    {gender ? (
                      <div className="space-y-1">
                        <dt className="font-semibold text-foreground">Gênero</dt>
                        <dd>{gender}</dd>
                      </div>
                    ) : null}

                    {birthDate ? (
                      <div className="space-y-1">
                        <dt className="font-semibold text-foreground">Nascimento</dt>
                        <dd>{birthDate}</dd>
                      </div>
                    ) : null}

                    {whatsapp ? (
                      <div className="space-y-1">
                        <dt className="font-semibold text-foreground">WhatsApp</dt>
                        <dd>{whatsapp}</dd>
                      </div>
                    ) : null}

                    {preferences.length > 0 ? (
                      <div className="space-y-1">
                        <dt className="font-semibold text-foreground">Recebe notificações sobre</dt>
                        <dd>{preferences.join(", ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                </article>
              );
            })}
          </div>

          {members.length === 0 && (
            <div className="rounded-[32px] border border-dashed border-border/70 bg-card/80 p-12 text-center text-muted-foreground shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
              Nenhum integrante da Arquibancada encontrado.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
