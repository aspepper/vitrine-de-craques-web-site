import { Filters } from "@/components/Filters";

const supporters = [
  { name: "Torcedor 1", team: "Time", city: "Cidade" },
  { name: "Torcedor 2", team: "Time", city: "Cidade" },
  { name: "Torcedor 3", team: "Time", city: "Cidade" },
  { name: "Torcedor 4", team: "Time", city: "Cidade" },
  { name: "Torcedor 5", team: "Time", city: "Cidade" },
  { name: "Torcedor 6", team: "Time", city: "Cidade" },
  { name: "Torcedor 7", team: "Time", city: "Cidade" },
  { name: "Torcedor 8", team: "Time", city: "Cidade" },
  { name: "Torcedor 9", team: "Time", city: "Cidade" },
  { name: "Torcedor 10", team: "Time", city: "Cidade" },
  { name: "Torcedor 11", team: "Time", city: "Cidade" },
  { name: "Torcedor 12", team: "Time", city: "Cidade" },
];

interface PageProps {
  searchParams: {
    q?: string;
  };
}

export default function TorcidaPage({ searchParams }: PageProps) {
  const search = (searchParams.q || "").trim();
  const normalizedSearch = search.toLowerCase();
  const results = normalizedSearch
    ? supporters.filter((supporter) =>
        [supporter.name, supporter.team, supporter.city]
          .map((value) => value.toLowerCase())
          .some((value) => value.includes(normalizedSearch))
      )
    : supporters;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="container flex flex-col gap-12 pb-24 pt-16">
        <header className="flex flex-col gap-8">
          <div className="space-y-2">
            <h1 className="font-heading text-[44px] font-semibold leading-tight text-slate-900 md:text-[56px]">
              Torcida
            </h1>
            <p className="text-base text-slate-500">
              Explore torcedores cadastrados e filtre por nome, time ou cidade.
            </p>
          </div>

          <div className="rounded-[32px] border border-white/60 bg-white/95 px-6 py-6 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
            <Filters
              defaultValue={search}
              method="get"
              placeholder="Filtros: Nome, Time, Cidade"
            />
          </div>
        </header>

        <section className="space-y-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {results.map((supporter) => (
              <article
                key={supporter.name}
                className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-[0_24px_56px_-32px_rgba(15,23,42,0.35)] backdrop-blur transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_32px_72px_-32px_rgba(15,23,42,0.45)]"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-lg font-semibold text-white shadow-[0_18px_32px_-18px_rgba(15,23,42,0.6)]">
                    {supporter.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-slate-900">{supporter.name}</p>
                    <p className="text-sm text-slate-500">
                      {supporter.team} • {supporter.city}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {results.length === 0 && (
            <div className="rounded-[32px] border border-dashed border-slate-200 bg-white/90 p-12 text-center text-slate-500 shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
              Nenhum torcedor encontrado.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
