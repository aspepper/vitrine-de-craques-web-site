import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { VideoCard } from "@/components/VideoCard";

interface Video {
  id: string;
  title: string;
  author: string;
  thumbnailUrl: string;
}

const videos: Video[] = [
  {
    id: "1",
    title: "Highlights do jogo",
    author: "Vitrine",
    thumbnailUrl: "/placeholders/Video-Promocional-Youtube-560x315.svg",
  },
  {
    id: "2",
    title: "Top 10 gols",
    author: "Vitrine",
    thumbnailUrl: "/placeholders/Video-Promocional-Youtube-560x315.svg",
  },
  {
    id: "3",
    title: "Entrevista exclusiva",
    author: "Vitrine",
    thumbnailUrl: "/placeholders/Video-Promocional-Youtube-560x315.svg",
  },
];

export default function FeedPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold font-heading">Feed</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

