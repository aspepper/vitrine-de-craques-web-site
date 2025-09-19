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
      <main className="container flex flex-col gap-12 pb-24 pt-16">
        <header className="flex flex-col gap-6">
          <h1 className="font-heading text-[44px] font-semibold leading-tight text-slate-900 md:text-[56px]">
            Atletas
          </h1>

          <div className="rounded-[32px] bg-white p-6 shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-slate-400">
                  <svg
                    aria-hidden
                    className="h-6 w-6"
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
                  className="h-16 w-full rounded-full border border-slate-200/80 bg-white px-16 text-base text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition"
                  placeholder="Filtros: Nome, Idade, Cidade, Estado"
                  type="search"
                  disabled
                />
              </div>

              <Button
                className="h-16 w-full rounded-full bg-[#22C55E] px-10 text-base font-semibold tracking-wide text-white shadow-[0_18px_32px_-18px_rgba(34,197,94,0.8)] transition hover:-translate-y-0.5 hover:bg-[#1EB153] focus-visible:ring-[#22C55E]/60 lg:w-auto"
                type="button"
              >
                Filtrar
              </Button>
            </div>
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

            return (
              <Link
                key={athlete.id}
                className="group flex h-full flex-col overflow-hidden rounded-[32px] bg-white text-left shadow-[0_8px_32px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_-24px_rgba(15,23,42,0.25)]"
                href={`/atletas/${athlete.id}`}
              >
                <div className="relative h-40 w-full bg-[#0F172A]">
                  <Image
                    alt={athlete.displayName || "Atleta"}
                    className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105"
                    fill
                    loading="lazy"
                    sizes="(min-width: 1280px) 250px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    src={athlete.avatarUrl || heroImage}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2 px-6 pb-6 pt-5">
                  <h2 className="font-heading text-lg font-semibold italic text-slate-900">
                    {athlete.displayName || "Atleta"}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {subtitle || "Informações não disponíveis"}
                  </p>
                </div>
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
