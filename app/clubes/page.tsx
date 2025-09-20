import Link from "next/link";

import { Button } from "@/components/ui/button";

interface Club {
  id: string;
  name: string;
  slug: string;
  confederation?: {
    name?: string | null;
  } | null;
}

interface ClubsResponse {
  items: Club[];
  page: number;
  total: number;
  totalPages: number;
}

interface PageProps {
  searchParams: {
    page?: string;
  };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const PAGE_SIZE = 16;

async function getClubs(page: number): Promise<ClubsResponse> {
  try {
    const res = await fetch(
      `${baseUrl}/api/clubes?page=${page}&limit=${PAGE_SIZE}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Resposta inválida ao carregar clubes");
    }

    return res.json();
  } catch (error) {
    console.error("Erro ao carregar clubes", error);
    return {
      items: [],
      page,
      total: 0,
      totalPages: 1,
    };
  }
}

export default async function ClubesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const { items: clubs, totalPages } = await getClubs(page);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="container flex flex-col gap-12 pb-24 pt-16">
        <header className="flex flex-col gap-6">
          <h1 className="font-heading text-[44px] font-semibold leading-tight text-slate-900 md:text-[56px]">
            Clubes
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
          {clubs.map((club) => {
            const initials = club.name?.trim().charAt(0) || "C";
            const confederationName = club.confederation?.name?.trim();

            return (
              <Link
                key={club.id}
                className="group"
                href={`/clubes/${club.slug}`}
                prefetch={false}
              >
                <article className="flex h-full flex-col items-center gap-6 rounded-[32px] border border-white/70 bg-white/95 px-10 py-12 text-center shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_32px_72px_-32px_rgba(15,23,42,0.45)]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-2xl font-semibold text-white shadow-[0_12px_24px_-18px_rgba(15,23,42,0.6)]">
                    {initials}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-slate-900">{club.name}</h2>
                    {confederationName ? (
                      <p className="text-sm text-slate-500">{confederationName}</p>
                    ) : (
                      <p className="text-sm text-slate-400">Sem confederação</p>
                    )}
                  </div>
                </article>
              </Link>
            );
          })}

          {clubs.length === 0 && (
            <div className="col-span-full rounded-[32px] border border-dashed border-slate-200 bg-white/90 p-12 text-center text-slate-500 shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
              Nenhum clube encontrado.
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
                <Link href={`/clubes?page=${page - 1}`} prefetch={false}>
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
                <Link href={`/clubes?page=${page + 1}`} prefetch={false}>
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
