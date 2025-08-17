import AlbumCard from "@/components/AlbumCard";
import Filters from "@/components/Filters";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Comunidade de Fãs | Vitrine de Craques",
  description: "Conheça os torcedores que fazem a festa.",
};

export default async function FansPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const name = typeof searchParams.name === 'string' ? searchParams.name : undefined;
    const team = typeof searchParams.team === 'string' ? searchParams.team : undefined;
    const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;

    const fans = await prisma.user.findMany({
        where: {
            role: 'FAN',
            name: { contains: name, mode: 'insensitive' },
            profile: {
                fan: {
                    favoriteTeam: { contains: team, mode: 'insensitive' },
                    city: { contains: city, mode: 'insensitive' },
                }
            }
        },
        include: {
            profile: {
                include: {
                    fan: true,
                }
            }
        },
        orderBy: { name: 'asc' }
    });

    const filterOptions = [
        { name: "name", placeholder: "Nome do Fã" },
        { name: "team", placeholder: "Time do Coração" },
        { name: "city", placeholder: "Cidade" },
    ];

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Comunidade de Fãs</h1>
                <p className="mt-2 text-lg text-muted-foreground">Os apaixonados por futebol que apoiam nossos craques.</p>
            </div>

            <Card className="p-4 mb-8">
                <Filters options={filterOptions} />
            </Card>

            {fans.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {fans.map(fan => (
                        <AlbumCard
                            key={fan.id}
                            href={`/fans/${fan.id}`} // Optional detail page
                            imageUrl={fan.image ?? `https://placehold.co/400x500/38BDF8/FFFFFF/png?text=${fan.name?.charAt(0)}`}
                            name={fan.name ?? "Fã"}
                            details={[
                                fan.profile?.fan?.favoriteTeam ?? "Time não informado",
                                fan.profile?.fan?.city ?? "Cidade não informada"
                            ]}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-2xl">
                    <p className="text-muted-foreground">Nenhum fã encontrado.</p>
                </div>
            )}
        </div>
    );
}
