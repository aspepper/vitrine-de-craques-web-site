import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getAgent(id: string) {
  const res = await fetch(`${baseUrl}/api/agentes/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

interface PageProps {
  params: { id: string };
}

export default async function AgenteDetalhePage({ params }: PageProps) {
  const profile = await getAgent(params.id);
  if (!profile) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <main className="container mx-auto flex-grow px-4 pb-16 pt-10">
        <div className="mx-auto max-w-3xl space-y-6">
          <Link
            href="/agentes"
            prefetch={false}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span aria-hidden>←</span>
            Voltar para agentes
          </Link>

          {profile.avatarUrl && (
            <div className="relative h-64 w-full overflow-hidden rounded-lg shadow">
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName || "Agente"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1 className="text-3xl font-semibold text-slate-900">{profile.displayName}</h1>
          {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
          {profile.data && (
            <pre className="bg-slate-100 p-4 rounded-md">
              {JSON.stringify(profile.data, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}

