import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Image from "next/image";
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
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <div className="mx-auto max-w-3xl">
          {profile.avatarUrl && (
            <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow">
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName || "Agente"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <h1>{profile.displayName}</h1>
          {profile.bio && (
            <p className="text-muted-foreground">
              {profile.bio}
            </p>
          )}
          {profile.data && (
            <pre className="bg-slate-100 p-4 rounded-md">
              {JSON.stringify(profile.data, null, 2)}
            </pre>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

