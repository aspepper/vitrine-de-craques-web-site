"use client";

import { useState } from "react";
import { FeedVideoCard } from "@/components/FeedVideoCard";
import { Button } from "@/components/ui/button";

export interface FeedVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  user: {
    name?: string | null;
  };
}

const PAGE_SIZE = 6;

export function FeedClient({ initialVideos }: { initialVideos: FeedVideo[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialVideos.length === PAGE_SIZE);

  const loadMore = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const res = await fetch(`/api/videos?skip=${videos.length}&take=${PAGE_SIZE}`);
    const more: FeedVideo[] = await res.json();
    setVideos((v) => [...v, ...more]);
    setHasMore(more.length === PAGE_SIZE);
    setLoading(false);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto pb-6 pt-8">
          <div className="flex flex-col items-center gap-6 px-6">
            {videos.map((video) => (
              <FeedVideoCard
                key={video.id}
                video={video}
                showOverlayActions={false}
                className="max-w-full"
              />
            ))}
          </div>
        </div>
      </div>
      {hasMore && (
        <div className="px-6 pb-8">
          <Button
            onClick={loadMore}
            disabled={loading}
            className="h-12 w-full rounded-full bg-emerald-500 text-base font-semibold text-white transition-colors hover:bg-emerald-500/90"
          >
            {loading ? "Carregando..." : "Carregar mais"}
          </Button>
        </div>
      )}
    </div>
  );
}
