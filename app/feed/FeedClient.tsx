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
    <div className="flex h-full w-full flex-1 flex-col">
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full snap-y snap-mandatory flex-col overflow-y-auto">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex min-h-[calc(100vh-240px)] w-full items-center justify-center snap-start px-4 py-6"
            >
              <FeedVideoCard
                video={video}
                showOverlayActions={false}
                className="h-full max-h-[680px] w-full max-w-[400px]"
              />
            </div>
          ))}
          {hasMore && (
            <div className="flex min-h-[calc(100vh-240px)] items-center justify-center px-6 py-8">
              <Button
                onClick={loadMore}
                disabled={loading}
                className="h-12 w-full max-w-[260px] rounded-full bg-emerald-500 text-base font-semibold text-white transition-colors hover:bg-emerald-500/90"
              >
                {loading ? "Carregando..." : "Carregar mais"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
