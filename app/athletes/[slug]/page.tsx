import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { Mail, Phone } from "lucide-react";
import { notFound } from "next/navigation";

export default async function AthleteProfilePage({ params }: { params: { slug: string } }) {
  const athlete = await prisma.user.findUnique({
    where: { id: params.slug }, // Should be a slug in production
    include: {
      profile: {
        include: {
          athlete: true,
        },
      },
      videos: true,
    },
  });

  if (!athlete || athlete.role !== 'ATHLETE') {
    notFound();
  }

  const athleteData = athlete.profile?.athlete;

  return (
    <div className="container py-12">
      <Card className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-surface shadow-2xl border-4 border-accent/50">
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary shadow-lg">
             <Avatar className="w-full h-full">
                <AvatarImage src={athlete.image ?? undefined} alt={`Foto de ${athlete.name}`} className="object-cover" />
                <AvatarFallback className="text-6xl">{athlete.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
          <h1 className="text-3xl font-bold mt-4 text-center">{athlete.name}</h1>
          <Badge variant="secondary" className="mt-2">{athleteData?.position ?? "Não especificado"}</Badge>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-background rounded-lg">
              <div className="text-sm text-muted-foreground">Idade</div>
              <div className="text-xl font-bold">20</div> {/* Placeholder */}
            </div>
            <div className="p-4 bg-background rounded-lg">
              <div className="text-sm text-muted-foreground">Altura</div>
              <div className="text-xl font-bold">{athleteData?.height ? `${athleteData.height} cm` : "N/A"}</div>
            </div>
            <div className="p-4 bg-background rounded-lg">
              <div className="text-sm text-muted-foreground">Localização</div>
              <div className="text-xl font-bold">{athleteData?.city}, {athleteData?.state}</div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Biografia</h2>
            <p className="text-muted-foreground">
              {athlete.profile?.bio ?? "Este atleta ainda não adicionou uma biografia."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button className="flex-1">
              <Mail className="mr-2 h-4 w-4" /> Expressar Interesse
            </Button>
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" /> Contato (Stub)
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">Galeria de Vídeos</h2>
        {athlete.videos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {athlete.videos.map(video => (
              <Card key={video.id} className="overflow-hidden">
                <video src="https://placehold.co/300x400.mp4" poster={`https://placehold.co/300x400/22C55E/FFFFFF/png?text=${video.title}`} className="w-full h-auto" controls />
                <div className="p-2">
                  <p className="font-semibold truncate">{video.title}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-dashed border-2 rounded-2xl">
            <p className="text-muted-foreground">Nenhum vídeo enviado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
