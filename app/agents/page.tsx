import AlbumCard from "@/components/AlbumCard";
import Filters from "@/components/Filters";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Team of Soccer Agents, Managers, and Scouts | Vitrine de Craques",
  description: "Conecte-se com profissionais que podem impulsionar sua carreira.",
};

export default async function AgentsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const name = typeof searchParams.name === 'string' ? searchParams.name : undefined;
    const state = typeof searchParams.state === 'string' ? searchParams.state : undefined;

    const agents = await prisma.user.findMany({
        where: {
            role: 'AGENT',
            name: { contains: name, mode: 'insensitive' },
            profile: {
                agent: {
                    state: { contains: state, mode: 'insensitive' },
                }
            }
        },
        include: {
            profile: {
                include: {
                    agent: true,
                }
            }
        },
        orderBy: { name: 'asc' }
    });

    const filterOptions = [
        { name: "name", placeholder: "Nome do Agente" },
        { name: "state", placeholder: "Estado (UF)" },
    ];

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Team of Soccer Agents, Managers, and Scouts</h1>
                <p className="mt-2 text-lg text-muted-foreground">Profissionais em busca dos próximos grandes talentos.</p>
            </div>

            <Card className="p-4 mb-8">
                <Filters options={filterOptions} />
            </Card>

            {agents.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {agents.map(agent => (
                        <AlbumCard
                            key={agent.id}
                            href={`/agents/${agent.id}`}
                            imageUrl={agent.image ?? `https://placehold.co/400x500/F59E0B/0B0F10/png?text=${agent.name?.charAt(0)}`}
                            name={agent.name ?? "Agente"}
                            details={[
                                `Estado: ${agent.profile?.agent?.state ?? "N/A"}`,
                                agent.profile?.agent?.contact ?? "Contato não disponível"
                            ]}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-2xl">
                    <p className="text-muted-foreground">Nenhum agente encontrado.</p>
                </div>
            )}
        </div>
    );
}
