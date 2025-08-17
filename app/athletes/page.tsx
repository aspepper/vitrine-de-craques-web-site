import AlbumCard from "@/components/AlbumCard";
import Filters from "@/components/Filters";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Team Showcase of Stars | Vitrine de Craques",
  description: "Explore nossa galeria de atletas promissores.",
};

export default async function AthletesPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const name = typeof searchParams.name === 'string' ? searchParams.name : undefined;
  const age = typeof searchParams.age === 'string' ? parseInt(searchParams.age) : undefined;
  const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;
  const state = typeof searchParams.state === 'string' ? searchParams.state : undefined;

  const athletes = await prisma.user.findMany({
    where: {
      role: 'ATHLETE',
      name: {
        contains: name,
        mode: 'insensitive',
      },
      profile: {
        athlete: {
          city: {
            contains: city,
            mode: 'insensitive',
          },
          state: {
            contains: state,
            mode: 'insensitive',
          },
          // Age filter would require calculating from birthdate in a real scenario
        }
      }
    },
    include: {
      profile: {
        include: {
          athlete: true,
        },
      },
    },
    orderBy: {
      name: 'asc'
    }
  });

  const filterOptions = [
    { name: "name", placeholder: "Nome do Atleta" },
    { name: "age", placeholder: "Idade", type: "number" },
    { name: "city", placeholder: "Cidade" },
    { name: "state", placeholder: "Estado (UF)" },
  ];

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Team Showcase of Stars</h1>
        <p className="mt-2 text-lg text-muted-foreground">Nossa galeria de atletas promissores.</p>
      </div>
      
      <Card className="p-4 mb-8">
        <Filters options={filterOptions} />
      </Card>

      {athletes.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {athletes.map(athlete => (
            <AlbumCard
              key={athlete.id}
              href={`/athletes/${athlete.id}`} // Use slug in real app
              imageUrl={athlete.image ?? `https://placehold.co/400x500/0B0F10/FFFFFF/png?text=${athlete.name?.charAt(0)}`}
              name={athlete.name ?? "Atleta"}
              details={[
                athlete.profile?.athlete?.position ?? "Posição",
                `${athlete.profile?.athlete?.city ?? "Cidade"}, ${athlete.profile?.athlete?.state ?? "UF"}`
              ]}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-dashed border-2 rounded-2xl">
            <p className="text-muted-foreground">Nenhum atleta encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}
