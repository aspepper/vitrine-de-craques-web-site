import Link from "next/link";
import { Profile } from "@prisma/client";
import { UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: { page?: string };
}

type AgentProfile = Profile & {
  user?: {
    email: string | null;
  } | null;
};

type AgentsResponse = {
  items: AgentProfile[];
  page: number;
  total: number;
  totalPages: number;
};

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
const PAGE_SIZE = 9;

async function getAgents(page: number): Promise<AgentsResponse> {
  try {
    const res = await fetch(`${baseUrl}/api/agentes?page=${page}&limit=${PAGE_SIZE}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Resposta inválida ao carregar agentes");
    }

    return res.json();
  } catch (error) {
    console.error("Erro ao carregar agentes", error);
    return {
      items: [],
      page,
      total: 0,
      totalPages: 1,
    };
  }
}

function getAgentContact(agent: AgentProfile) {
  return (
    agent.user?.email ||
    agent.representanteEmail ||
    agent.emailClube ||
    agent.whatsapp ||
    "Contato não informado"
  );
}

export default async function AgentesPage({ searchParams }: PageProps) {
  const page = Number(searchParams.page) || 1;
  const { items: agents, totalPages } = await getAgents(page);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <main className="container flex flex-col gap-12 pb-24 pt-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
            rede vitrine de craques
          </p>
          <h1 className="max-w-3xl font-heading text-[44px] font-semibold italic leading-tight text-slate-900 md:text-[56px]">
            Time de Agentes de Futebol, Empresários e Olheiros
          </h1>
          <p className="max-w-2xl text-lg text-slate-500">
            Conheça os profissionais que cuidam da carreira dos craques, conectando talentos promissores a grandes
            oportunidades no futebol brasileiro e internacional.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => {
            const contact = getAgentContact(agent);

            return (
              <article
                key={agent.id}
                className="flex h-full flex-col justify-between rounded-[32px] bg-white p-8 shadow-[0_8px_32px_rgba(15,23,42,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_56px_-24px_rgba(15,23,42,0.25)]"
              >
                <div className="flex items-center gap-5">
                  <Avatar className="h-20 w-20 overflow-hidden bg-gradient-to-br from-emerald-500 via-sky-400 to-amber-400 p-[3px]">
                    <AvatarImage
                      alt={agent.displayName || "Agente"}
                      className="h-full w-full rounded-full object-cover"
                      src={agent.avatarUrl || undefined}
                    />
                    <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-white">
                      <UserRound aria-hidden className="h-9 w-9 text-emerald-500" />
                      <span className="sr-only">{agent.displayName || "Agente"}</span>
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h2 className="truncate font-heading text-xl font-semibold italic text-slate-900">
                      {agent.displayName || "Agente"}
                    </h2>
                    <p className="truncate text-sm text-slate-500">{contact}</p>
                  </div>
                </div>

                <div className="mt-8 flex">
                  <Button
                    asChild
                    className="w-full rounded-full bg-[#0EA5E9] px-6 py-5 text-base font-semibold text-white shadow-[0_18px_32px_-18px_rgba(14,165,233,0.8)] transition hover:-translate-y-0.5 hover:bg-[#0284C7] focus-visible:ring-[#0EA5E9]/60"
                  >
                    <Link href={`/agentes/${agent.id}`}>Ver perfil</Link>
                  </Button>
                </div>
              </article>
            );
          })}

          {agents.length === 0 && (
            <div className="col-span-full rounded-[32px] border border-dashed border-slate-200 bg-white/90 p-12 text-center text-slate-500 shadow-[0_8px_32px_rgba(15,23,42,0.12)]">
              Nenhum agente cadastrado até o momento.
            </div>
          )}
        </section>

        {totalPages > 1 && (
          <nav aria-label="Paginação" className="flex items-center justify-center gap-4">
            <Button
              asChild
              className="rounded-full px-8"
              disabled={page <= 1}
              variant="outline"
            >
              {page > 1 ? <Link href={`/agentes?page=${page - 1}`}>Anterior</Link> : <span>Anterior</span>}
            </Button>
            <span className="text-sm font-medium text-slate-500">
              Página {page} de {totalPages}
            </span>
            <Button
              asChild
              className="rounded-full px-8"
              disabled={page >= totalPages}
              variant="outline"
            >
              {page < totalPages ? <Link href={`/agentes?page=${page + 1}`}>Próxima</Link> : <span>Próxima</span>}
            </Button>
          </nav>
        )}
      </main>
    </div>
  );
}
