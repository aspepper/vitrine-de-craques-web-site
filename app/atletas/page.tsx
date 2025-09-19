import Image from "next/image";
import Link from "next/link";
import { Profile } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { ensureImage } from "@/lib/ensureImage";

interface PageProps {
  searchParams: { page?: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const PAGE_SIZE = 12;

type AthletesResponse = {
  items: Profile[];
  page: number;
  total: number;
  totalPages: number;
};

async function getAthletes(page: number): Promise<AthletesResponse> {
  try {
    const res = await fetch(
      `${baseUrl}/api/atletas?page=${page}&limit=${PAGE_SIZE}`,
      {
        cache: "no-store",
      }
    );

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

export default async function AtletasPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const { items: athletes, totalPages } = await getAthletes(page);
  const heroImage = ensureImage(
    "https://images.unsplash.com/photo-1511519984179-62e3b6aa3a36?auto=format&fit=crop&w=1920&q=80&fm=webp",
    "atletas",
    "stadium@1920"
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-12 md:px-10">
        <div className="flex flex-col gap-6">
          <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
            Atletas
          </h1>
          <div className="relative max-w-xl">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5 text-slate-400">
              <svg
                aria-hidden
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M21 21l-4.35-4.35m1.35-3.65a6 6 0 11-12 0 6 6 0 0112 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <input
              className="h-14 w-full rounded-full border border-white/60 bg-white/90 px-14 text-base text-slate-600 shadow-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/40"
              placeholder="Filtros: Nome, Idade, Cidade, Estado"
              type="search"
              disabled
            />
          </div>
        </div>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

            return (
              <Link
                key={athlete.id}
                className="group flex h-full flex-col rounded-3xl bg-[#0F172A] p-6 text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                href={`/atletas/${athlete.id}`}
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#17233F] via-[#101A31] to-[#0B1424]">
                  <div className="relative h-36 w-full">
                    <Image
                      alt={athlete.displayName || "Atleta"}
                      className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
                      fill
                      loading="lazy"
                      sizes="(min-width: 1280px) 250px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      src={athlete.avatarUrl || heroImage}
                    />
                  </div>
                </div>
                <div className="mt-6 flex flex-1 flex-col">
                  <h2 className="text-lg font-semibold leading-tight">
                    {athlete.displayName || "Atleta"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-300">
                    {subtitle || "Informações não disponíveis"}
                  </p>
                </div>
              </Link>
            );
          })}
          {athletes.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white/60 p-10 text-center text-slate-500">
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
                <Link href={`/atletas?page=${page - 1}`} prefetch={false}>
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
                <Link href={`/atletas?page=${page + 1}`} prefetch={false}>
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
