import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { VideoCard } from "@/components/VideoCard";

// Dados mocados para o feed
const mockVideos = [
  { id: '1', title: 'Golaço de bicicleta', author: 'Craque 1', thumbnailUrl: 'https://via.placeholder.com/400x225.png/000000/FFFFFF?text=Video' },
  { id: '2', title: 'Drible desconcertante', author: 'Jogador Habilidoso', thumbnailUrl: 'https://via.placeholder.com/400x225.png/000000/FFFFFF?text=Video' },
  { id: '3', title: 'Defesa espetacular', author: 'Muralha', thumbnailUrl: 'https://via.placeholder.com/400x225.png/000000/FFFFFF?text=Video' },
  { id: '4', title: 'Falta no ângulo', author: 'Artilheiro', thumbnailUrl: 'https://via.placeholder.com/400x225.png/000000/FFFFFF?text=Video' },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="text-3xl font-bold font-heading my-6">Feed de Vídeos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Em um projeto real, aqui teríamos a lógica de infinite scroll */}
          {mockVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
