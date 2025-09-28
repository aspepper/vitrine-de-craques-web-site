"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import type { Role } from "@prisma/client";

import { FeedVideoCard } from "@/components/FeedVideoCard";
import { Button } from "@/components/ui/button";

export interface FeedVideo {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  likesCount?: number | null;
  user: {
    id?: string;
    name?: string | null;
    image?: string | null;
    profile?: {
      id?: string;
      role?: Role;
      displayName?: string | null;
      avatarUrl?: string | null;
    } | null;
  };
}

const PAGE_SIZE = 6;

export function FeedClient({ initialVideos }: { initialVideos: FeedVideo[] }) {
  const [videos, setVideos] = useState(initialVideos);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialVideos.length === PAGE_SIZE);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(
    initialVideos[0]?.id ?? null,
  );
  const [pendingVideos, setPendingVideos] = useState<FeedVideo[]>([]);
  const [muted, setMuted] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef(videos);
  const pendingVideosRef = useRef(pendingVideos);

  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  useEffect(() => {
    pendingVideosRef.current = pendingVideos;
  }, [pendingVideos]);

  const handleVideoInView = useCallback((videoId: string) => {
    setActiveVideoId(videoId);
  }, []);

  const handleMuteChange = useCallback((_: string, nextMuted: boolean) => {
    setMuted(nextMuted);
  }, []);

  const loadMore = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const res = await fetch(`/api/videos?skip=${videos.length}&take=${PAGE_SIZE}`);
    const more: FeedVideo[] = await res.json();
    setVideos((v) => [...v, ...more]);
    setHasMore(more.length === PAGE_SIZE);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/videos?skip=0&take=${PAGE_SIZE}`);
        if (!res.ok) {
          return;
        }
        const latest: FeedVideo[] = await res.json();
        const knownIds = new Set(videosRef.current.map((video) => video.id));
        const pendingIds = new Set(
          pendingVideosRef.current.map((video) => video.id),
        );
        const newlyDiscovered = latest.filter(
          (video) => !knownIds.has(video.id) && !pendingIds.has(video.id),
        );
        if (!isMounted || newlyDiscovered.length === 0) {
          return;
        }
        setPendingVideos((current) => {
          const currentIds = new Set(current.map((video) => video.id));
          const fresh = newlyDiscovered.filter(
            (video) => !currentIds.has(video.id),
          );
          return [...fresh, ...current];
        });
      } catch (error) {
        console.error("Não foi possível verificar novos vídeos", error);
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleConsumeNewVideos = useCallback(async () => {
    let targetVideoId: string | null = null;
    try {
      const res = await fetch(
        `/api/videos?skip=0&take=${Math.max(videosRef.current.length, PAGE_SIZE)}`,
      );
      if (!res.ok) {
        throw new Error("Não foi possível carregar novos vídeos");
      }
      const latest: FeedVideo[] = await res.json();
      setVideos((current) => {
        const existingIds = new Set(current.map((video) => video.id));
        const freshVideos = latest.filter((video) => !existingIds.has(video.id));
        if (freshVideos.length === 0) {
          targetVideoId = current[0]?.id ?? null;
          return current;
        }
        targetVideoId = freshVideos[0].id;
        return [...freshVideos, ...current];
      });
    } catch (error) {
      console.error(error);
    } finally {
      setPendingVideos([]);
      if (targetVideoId) {
        setActiveVideoId(targetVideoId);
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
          }
        });
      }
    }
  }, []);

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      {pendingVideos.length > 0 ? (
        <div className="sticky top-4 z-10 flex justify-center px-4">
          <button
            type="button"
            onClick={handleConsumeNewVideos}
            className="flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-500/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            <Image
              src="/icons/icon-new-content.svg"
              alt="Novos vídeos disponíveis"
              width={20}
              height={20}
            />
            <span>{pendingVideos.length} novos vídeos</span>
          </button>
        </div>
      ) : null}
      <div className="flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          className="flex h-full snap-y snap-mandatory flex-col overflow-y-auto"
        >
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex min-h-[calc(100vh-220px)] w-full items-center justify-center snap-start px-4 py-6"
            >
              <FeedVideoCard
                video={video}
                className="h-full max-h-[720px] w-full max-w-full md:max-w-[420px]"
                initialLikes={video.likesCount ?? 0}
                isActive={activeVideoId === video.id}
                onActive={handleVideoInView}
                muted={muted}
                onMuteChange={handleMuteChange}
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
