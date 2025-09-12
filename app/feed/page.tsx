import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeedVideoCard } from "@/components/FeedVideoCard";
import prisma from "@/lib/db";

export default async function FeedPage() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="flex-grow container mx-auto p-4 flex flex-col items-center gap-8">
        {videos.map((video) => (
          <FeedVideoCard key={video.id} video={video} />
        ))}
      </main>
      <Footer />
    </div>
  );
}

