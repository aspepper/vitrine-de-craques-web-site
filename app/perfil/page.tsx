import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Supondo que este componente exista
import { Button } from "@/components/ui/button";

// Dados mocados
const user = { name: 'Usuário Logado', image: 'https://github.com/shadcn.png', bio: 'Jogador amador e entusiasta de futebol.' };
const userVideos = [
    { id: '1', title: 'Meu primeiro highlight!', author: 'Usuário Logado', thumbnailUrl: 'https://via.placeholder.com/400x225.png/000000/FFFFFF?text=Video' },
    { id: '2', title: 'Golaço de falta', author: 'Usuário Logado', thumbnailUrl: 'https://via.placeholder.com/400x225.png/000000/FFFFFF?text=Video' },
];

export default function PerfilPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <div className="flex flex-col md:flex-row items-start gap-8 mt-8">
            <div className="flex-shrink-0 text-center">
                <Avatar className="w-32 h-32 mx-auto">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h1 className="text-3xl font-bold mt-4">{user.name}</h1>
                <p className="text-muted-foreground mt-2">{user.bio}</p>
                <Button className="mt-4">Editar Perfil</Button>
            </div>
            <div className="flex-grow w-full">
                <h2 className="text-2xl font-bold font-heading mb-6">Meus Vídeos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userVideos.map(video => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
// Nota: O componente Avatar precisa ser criado.
