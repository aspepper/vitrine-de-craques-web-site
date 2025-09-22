import Link from "next/link";

import { Filters } from "@/components/Filters";
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
    q?: string;
  };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const PAGE_SIZE = 16;

async function getClubs(page: number, search: string): Promise<ClubsResponse> {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(PAGE_SIZE),
    });

    if (search) {
      params.set("search", search);
    }

    const res = await fetch(`${baseUrl}/api/clubes?${params.toString()}`, {
      cache: "no-store",
    });

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

function buildPaginationQuery(page: number, search: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));

  if (search) {
    params.set("q", search);
  }

  return params.toString();
}

export default async function ClubesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const search = (searchParams.q || "").trim();
  const { items: clubs, totalPages } = await getClubs(page, search);

  return (
    <div className="min-h-screen bg-background transition-colors">
      <main className="container flex flex-col gap-12 pb-24 pt-16">
        <header className="flex flex-col gap-8">
          <div className="space-y-2">
            <h1 className="font-heading text-[44px] font-semibold leading-tight text-foreground md:text-[56px]">
              Clubes
            </h1>
            <p className="text-base text-muted-foreground">
              Conheça clubes cadastrados e busque por nome, confederação ou estado.
            </p>
          </div>

          <div className="rounded-[32px] border border-border/80 bg-card/80 px-6 py-6 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <Filters
              defaultValue={search}
              method="get"
              placeholder="Filtros: Nome, Confederação, Estado"
            />
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
                <article className="flex h-full flex-col items-center gap-6 rounded-[32px] border border-border/80 bg-card/90 px-10 py-12 text-center shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_32px_72px_-32px_rgba(15,23,42,0.45)]">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-foreground text-2xl font-semibold text-background shadow-[0_12px_24px_-18px_rgba(15,23,42,0.6)]">
                    {initials}
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-foreground">{club.name}</h2>
                    {confederationName ? (
                      <p className="text-sm text-muted-foreground">{confederationName}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Sem confederação</p>
                    )}
                  </div>
                </article>
              </Link>
            );
          })}

          {clubs.length === 0 && (
            <div className="col-span-full rounded-[32px] border border-dashed border-border/70 bg-card/80 p-12 text-center text-muted-foreground shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
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
                className="border border-border/70 bg-card/80 px-8 text-foreground hover:bg-card"
              >
                <Link
                  href={`/clubes?${buildPaginationQuery(page - 1, search)}`}
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
                className="border border-border/50 bg-muted px-8 text-muted-foreground"
              >
                Anterior
              </Button>
            )}
            <span className="text-sm font-medium text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            {page < totalPages ? (
              <Button
                asChild
                size="md"
                variant="ghost"
                className="border border-border/70 bg-card/80 px-8 text-foreground hover:bg-card"
              >
                <Link
                  href={`/clubes?${buildPaginationQuery(page + 1, search)}`}
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
                className="border border-border/50 bg-muted px-8 text-muted-foreground"
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
