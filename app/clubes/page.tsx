import AlbumCard from "@/components/AlbumCard";
import Filters from "@/components/Filters";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Clubes | Vitrine de Craques",
  description: "Explore os clubes de futebol do Brasil e do mundo.",
};

export default async function ClubsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const state = typeof searchParams.state === 'string' ? searchParams.state : 'SP';
    const country = typeof searchParams.country === 'string' ? searchParams.country : undefined;

    const clubs = await prisma.club.findMany({
        where: {
            state: { contains: state, mode: 'insensitive' },
            country: { contains: country, mode: 'insensitive' },
        },
        orderBy: { name: 'asc' }
    });

    const filterOptions = [
        { name: "state", placeholder: "Estado (UF)" },
        { name: "country", placeholder: "País" },
    ];

    return (
        <div className="container py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Clubes</h1>
                <p className="mt-2 text-lg text-muted-foreground">Encontre informações sobre clubes de todo o mundo.</p>
            </div>

            <Card className="p-4 mb-8">
                <Filters options={filterOptions} />
            </Card>

            {clubs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {clubs.map(club => (
                        <AlbumCard
                            key={club.id}
                            href={`/clubes/${club.slug}`}
                            imageUrl={club.coatOfArmsUrl ?? `https://placehold.co/400x400/FFFFFF/0B0F10/png?text=${club.name.substring(0, 3)}`}
                            name={club.name}
                            details={[club.state, club.country]}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-2xl">
                    <p className="text-muted-foreground">Nenhum clube encontrado para o estado de <strong>{state}</strong>.</p>
                    <p className="text-sm text-muted-foreground mt-2">Tente limpar os filtros ou buscar por outro estado.</p>
                </div>
            )}
        </div>
    );
}
