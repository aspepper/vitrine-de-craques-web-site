import Image from "next/image";
import Link from "next/link";

function formatDate(input: string | null) {
  if (!input) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface PageProps {
  params: { slug: string };
}

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getClub(slug: string) {
  const res = await fetch(`${baseUrl}/api/clubes/${slug}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Clube não encontrado");
  }
  return res.json();
}

export default async function ClubeDetalhePage({ params }: PageProps) {
  const club = await getClub(params.slug);
  const location = [club.city, club.state].filter(Boolean).join("/") || null;
  const foundedAt = formatDate(club.foundedAt ?? null);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <Link
            href="/clubes"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            Voltar para clubes
          </Link>

          <div className="flex flex-col gap-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_32px_96px_-64px_rgba(15,23,42,0.35)] md:flex-row md:items-center">
            {club.crestUrl ? (
              <div className="relative h-28 w-28 overflow-hidden rounded-3xl border border-slate-200 shadow-lg">
                <Image src={club.crestUrl} alt={club.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-slate-900 text-3xl font-semibold text-white">
                {club.name.charAt(0)}
              </div>
            )}
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900">{club.name}</h1>
              {club.nickname ? (
                <p className="text-base text-slate-500">Conhecido como {club.nickname}</p>
              ) : null}
              <p className="text-sm text-slate-600">
                Confederação: {club.confederation?.name ?? "não informada"}
              </p>
              {location ? <p className="text-sm text-slate-600">Localização: {location}</p> : null}
              {foundedAt ? <p className="text-sm text-slate-600">Fundado em {foundedAt}</p> : null}
            </div>
          </div>

          {club.description ? (
            <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.35)]">
              <h2 className="text-lg font-semibold text-slate-900">Sobre o clube</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{club.description}</p>
            </section>
          ) : null}

          <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.35)] md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Identidade</h3>
              <dl className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <dt>Estádio</dt>
                  <dd className="font-medium text-slate-800">{club.stadium ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Cores</dt>
                  <dd className="font-medium text-slate-800">{club.colors ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Site oficial</dt>
                  <dd className="font-medium text-slate-800">
                    {club.website ? (
                      <a href={club.website} className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                        {club.website}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Informações</h3>
              <dl className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <dt>Confederação</dt>
                  <dd className="font-medium text-slate-800">{club.confederation?.name ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Cidade/Estado</dt>
                  <dd className="font-medium text-slate-800">{location ?? "—"}</dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
