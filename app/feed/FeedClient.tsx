"use client";

import { useState } from "react";
import { FeedVideoCard } from "@/components/FeedVideoCard";
import { Button } from "@/components/ui/button";

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  user: {
    name?: string | null;
  };
}

const PAGE_SIZE = 6;

export function FeedClient({ initialVideos }: { initialVideos: Video[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialVideos.length === PAGE_SIZE);

  const loadMore = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const res = await fetch(`/api/videos?skip=${videos.length}&take=${PAGE_SIZE}`);
    const more: Video[] = await res.json();
    setVideos((v) => [...v, ...more]);
    setHasMore(more.length === PAGE_SIZE);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <FeedVideoCard key={video.id} video={video} />
        ))}
      </div>
      {hasMore && (
        <Button onClick={loadMore} disabled={loading} className="mt-6">
          {loading ? "Carregando..." : "Carregar mais"}
        </Button>
      )}
    </div>
  );
}
