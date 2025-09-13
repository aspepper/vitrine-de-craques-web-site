import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import prisma from "@/lib/db";
import { FeedClient } from "./FeedClient";

export default async function FeedPage() {
  const initialVideos = await prisma.video.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <FeedClient initialVideos={initialVideos} />
      </main>
      <Footer />
    </div>
  );
}
