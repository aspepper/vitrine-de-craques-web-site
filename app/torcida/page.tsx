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

export default function TorcidaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <main className="container mx-auto flex-grow px-4 pb-20 pt-12">
        <div className="space-y-10">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">Torcida</h1>
          </header>

          <section className="space-y-8">
            <div className="rounded-[28px] border border-white/60 bg-white/90 px-8 py-6 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.35)] backdrop-blur">
              <p className="text-base text-slate-500">Filtros: Nome, Time, Cidade</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {supporters.map((supporter) => (
                <article
                  key={supporter.name}
                  className="rounded-[26px] border border-white/60 bg-white/95 p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.5)] backdrop-blur transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900">
                      <span className="text-lg font-semibold text-white">{supporter.name.charAt(0)}</span>
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
          </section>
        </div>
      </main>
    </div>
  );
}
