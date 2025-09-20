import Link from "next/link";
import { Profile } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Filters } from "@/components/Filters";

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const PAGE_SIZE = 12;

type AthletesResponse = {
  items: Profile[];
  page: number;
  total: number;
  totalPages: number;
};

async function getAthletes(page: number, search: string): Promise<AthletesResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    if (search) {
      params.set("search", search);
    }

    const res = await fetch(`${baseUrl}/api/atletas?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Resposta inválida ao carregar atletas");
    }

    return res.json();
  } catch (error) {
    console.error("Erro ao carregar atletas", error);
    return {
      items: [],
      page,
      total: 0,
      totalPages: 1,
    };
  }
}

function parseBirthDate(value?: string | null) {
  if (!value) return null;

  const normalizedValue = value.trim();

  if (!normalizedValue) return null;

  if (/^\d{4}-\d{2}-\d{2}/.test(normalizedValue)) {
    return new Date(normalizedValue);
  }

  const parts = normalizedValue.split(/[\/]/);
  if (parts.length === 3) {
    const [day, month, year] = parts.map((part) => parseInt(part, 10));
    if (year && month) {
      const safeDay = Math.min(day || 1, 31);
      return new Date(year, month - 1, safeDay);
    }
  }

  const timestamp = Date.parse(normalizedValue);
  if (!Number.isNaN(timestamp)) {
    return new Date(timestamp);
  }

  return null;
}

function calculateAge(birthDate?: string | null) {
  const parsed = parseBirthDate(birthDate);
  if (!parsed || Number.isNaN(parsed.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - parsed.getFullYear();
  const hasBirthdayPassed =
    now.getMonth() > parsed.getMonth() ||
    (now.getMonth() === parsed.getMonth() && now.getDate() >= parsed.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age >= 0 && age < 130 ? age : null;
}

function buildPaginationQuery(page: number, search: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));

  if (search) {
    params.set("q", search);
  }

  return params.toString();
}

interface PageProps {
  searchParams: { page?: string; q?: string };
}

export default async function AtletasPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const search = (searchParams.q || "").trim();
  const { items: athletes, totalPages } = await getAthletes(page, search);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="container flex flex-col gap-12 pb-24 pt-16">
        <header className="flex flex-col gap-8">
          <div className="space-y-2">
            <h1 className="font-heading text-[44px] font-semibold leading-tight text-slate-900 md:text-[56px]">
              Atletas
            </h1>
            <p className="text-base text-slate-500">
              Explore atletas cadastrados e encontre talentos por nome, idade ou localização.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/95 px-6 py-6 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <Filters defaultValue={search} method="get" placeholder="Filtros: Nome, Idade, Cidade, Estado" />
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {athletes.map((athlete) => {
            const age = calculateAge(athlete.nascimento);
            const locationParts = [athlete.cidade, athlete.uf]
              .filter((value): value is string => Boolean(value && value.trim()))
              .map((value) => value.trim());
            const locationLabel =
              locationParts.length > 0 ? locationParts.join("/") : null;

            const subtitleSegments: string[] = [];
            if (age !== null) subtitleSegments.push(`Idade: ${age}`);
            if (locationLabel) subtitleSegments.push(locationLabel);

            const subtitle = subtitleSegments.join(" • ");
            const displayName = athlete.displayName?.trim() || "Atleta";
            const initials = displayName
              .split(/\s+/)
              .filter(Boolean)
              .map((segment) => segment[0]!.toUpperCase())
              .slice(0, 2)
              .join("");
            const infoLines: string[] = [];
            if (athlete.posicao?.trim()) {
              infoLines.push(`Posição: ${athlete.posicao.trim()}`);
            }
            if (athlete.clube?.trim()) {
              infoLines.push(`Clube: ${athlete.clube.trim()}`);
            }

            return (
              <Link
                key={athlete.id}
                className="group"
                href={`/atletas/${athlete.id}`}
                prefetch={false}
              >
                <article className="flex h-full flex-col gap-6 rounded-[32px] border border-white/60 bg-white/95 p-6 text-left shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_72px_-32px_rgba(15,23,42,0.45)]">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 shrink-0 border border-white/60 bg-slate-900 text-lg font-semibold text-white shadow-[0_18px_32px_-18px_rgba(15,23,42,0.6)]">
                      {athlete.avatarUrl ? (
                        <AvatarImage alt={displayName} src={athlete.avatarUrl} />
                      ) : null}
                      <AvatarFallback className="bg-slate-900 text-lg font-semibold text-white">
                        {initials || "AT"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h2 className="font-heading text-lg font-semibold italic text-slate-900">
                        {displayName}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {subtitle || "Informações não disponíveis"}
                      </p>
                    </div>
                  </div>

                  {infoLines.length > 0 && (
                    <div className="space-y-2 text-sm text-slate-600">
                      {infoLines.map((info) => (
                        <p key={info}>{info}</p>
                      ))}
                    </div>
                  )}
                </article>
              </Link>
            );
          })}
          {athletes.length === 0 && (
            <div className="col-span-full rounded-[32px] border border-dashed border-slate-200 bg-white/90 p-12 text-center text-slate-500 shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
              Nenhum atleta encontrado.
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            {page > 1 ? (
              <Button
                asChild
                size="md"
                variant="ghost"
                className="bg-white/70 px-8 text-slate-600 hover:bg-white"
              >
                <Link
                  href={`/atletas?${buildPaginationQuery(page - 1, search)}`}
                  prefetch={false}
                >
                  Anterior
                </Link>
              </Button>
            ) : (
              <Button
                disabled
                size="md"
                variant="ghost"
                className="bg-white/50 px-8 text-slate-400"
              >
                Anterior
              </Button>
            )}
            <span className="text-sm font-medium text-slate-500">
              Página {page} de {totalPages}
            </span>
            {page < totalPages ? (
              <Button
                asChild
                size="md"
                variant="ghost"
                className="bg-white/70 px-8 text-slate-600 hover:bg-white"
              >
                <Link
                  href={`/atletas?${buildPaginationQuery(page + 1, search)}`}
                  prefetch={false}
                >
                  Próxima
                </Link>
              </Button>
            ) : (
              <Button
                disabled
                size="md"
                variant="ghost"
                className="bg-white/50 px-8 text-slate-400"
              >
                Próxima
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
