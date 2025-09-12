import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db";
import { HERO_PLACEHOLDER } from "@/lib/heroImage";

export default async function AgentesPage() {
  const agents = await prisma.profile.findMany({ where: { role: "AGENTE" } });
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1 className="mb-6 text-2xl font-bold font-heading">Agentes</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agentes/${agent.id}`}>
              <Card className="overflow-hidden hover:shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                    <Image
                      src={agent.avatarUrl || HERO_PLACEHOLDER}
                      alt={agent.displayName || "Agente"}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg">
                    {agent.displayName || "Agente"}
                  </CardTitle>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
