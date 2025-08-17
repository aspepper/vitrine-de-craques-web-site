import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Confederações | Vitrine de Craques",
  description: "Informações sobre as confederações de futebol.",
};

export default async function ConfederationsPage() {
  const confederations = await prisma.confederation.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Confederações</h1>
        <p className="mt-2 text-lg text-muted-foreground">Organizações que regem o futebol mundial.</p>
        <p className="mt-2 text-sm text-muted-foreground">Aviso: Os logos são placeholders e não representam as marcas oficiais.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {confederations.map(conf => (
          <Link href={`/confederations/${conf.slug}`} key={conf.id}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="items-center">
                <Image 
                  src={conf.logoUrl ?? "https://placehold.co/150x150/FFFFFF/0B0F10/png?text=Logo"} 
                  alt={`Logo da ${conf.name}`}
                  width={100}
                  height={100}
                  className="rounded-full bg-surface p-2"
                />
              </CardHeader>
              <CardContent className="text-center">
                <CardTitle>{conf.name}</CardTitle>
                <p className="text-muted-foreground mt-2 line-clamp-3">{conf.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
