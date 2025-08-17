import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Building, Calendar, ShieldCheck, Star, Trophy, Users } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

async function getClubData(slug: string) {
    const club = await prisma.club.findUnique({
        where: { slug },
        include: { facts: true }
    });
    return club;
}

function SkeletonCard({ title, icon: Icon }: { title: string, icon: React.ElementType }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-2 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
            </CardContent>
        </Card>
    )
}

export default async function ClubDetailsPage({ params }: { params: { slug: string } }) {
    const club = await getClubData(params.slug);

    if (!club) {
        notFound();
    }

    const facts = club.facts.reduce((acc, fact) => {
        acc[fact.factType] = fact.content;
        return acc;
    }, {} as Record<string, string>);

    return (
        <div className="container py-12">
            <header className="flex flex-col md:flex-row items-center gap-8 mb-12">
                <Image
                    src={club.coatOfArmsUrl ?? `https://placehold.co/128x128/FFFFFF/0B0F10/png?text=${club.name.substring(0, 3)}`}
                    alt={`Escudo do ${club.name}`}
                    width={128}
                    height={128}
                    className="rounded-full bg-surface shadow-lg"
                />
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold">{club.name}</h1>
                    <p className="text-xl text-muted-foreground">{club.state}, {club.country}</p>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {facts['Foundation'] ? <Card>...</Card> : <SkeletonCard title="Fundação" icon={Calendar} />}
                {facts['Titles'] ? <Card>...</Card> : <SkeletonCard title="Títulos" icon={Trophy} />}
                {facts['Best Players'] ? <Card>...</Card> : <SkeletonCard title="Maiores Ídolos" icon={Star} />}
                {facts['Biggest Goals'] ? <Card>...</Card> : <SkeletonCard title="Gols Históricos" icon={ShieldCheck} />}
                {facts['Organized Fan Groups'] ? <Card>...</Card> : <SkeletonCard title="Torcidas Organizadas" icon={Users} />}
                {facts['Available Spots'] ? <Card>...</Card> : <SkeletonCard title="Vagas em Aberto" icon={Building} />}
            </div>

            <div className="mt-12">
                 <h2 className="text-2xl font-bold text-center mb-8">Fotos do Estádio</h2>
                 <Card>
                    <CardContent className="p-4">
                        <div className="aspect-video bg-muted rounded-lg animate-pulse flex items-center justify-center">
                            <p className="text-muted-foreground">Dados de estádio indisponíveis</p>
                        </div>
                    </CardContent>
                 </Card>
            </div>
        </div>
    );
}
