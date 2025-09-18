"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  user: {
    name?: string | null;
  };
}

interface Props {
  video: Video;
  className?: string;
  showOverlayActions?: boolean;
}

export function FeedVideoCard({
  video,
  className,
  showOverlayActions = true,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = ref.current;
    if (!videoEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            videoEl.play().catch(() => {});
          } else {
            videoEl.pause();
          }
        });
      },
      { threshold: [0, 0.7, 1] }
    );

    observer.observe(videoEl);
    return () => observer.disconnect();
  }, []);

  const ActionButton = ({ src, alt }: { src: string; alt: string }) => (
    <button
      className="p-2 bg-white/30 rounded-full"
      onClick={() => console.log(alt)}
      type="button"
    >
      <Image src={src} alt={alt} width={32} height={32} />
    </button>
  );

  return (
    <div
      className={cn(
        "relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-[32px] bg-slate-900 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.65)] ring-1 ring-black/10",
        className
      )}
    >
      <video
        ref={ref}
        src={video.videoUrl}
        poster={video.thumbnailUrl || undefined}
        className="h-full w-full object-cover"
        loop
        muted
        playsInline
      />
      {showOverlayActions && (
        <div className="absolute bottom-10 right-2 flex flex-col gap-3">
          <ActionButton src="/icons/icon-like.svg" alt="Curtir" />
          <ActionButton src="/icons/icon-comment.svg" alt="Comentar" />
          <ActionButton src="/icons/icon-save.svg" alt="Salvar" />
          <ActionButton src="/icons/icon-share.svg" alt="Compartilhar" />
          <ActionButton src="/icons/icon-report.svg" alt="Denunciar" />
        </div>
      )}
      <div className="absolute left-3 bottom-3 text-white drop-shadow">
        <p className="font-semibold leading-tight">{video.user?.name}</p>
        <p className="text-sm leading-tight">{video.title}</p>
      </div>
    </div>
  );
}
