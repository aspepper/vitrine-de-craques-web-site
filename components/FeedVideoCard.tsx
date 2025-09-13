"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

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
}

export function FeedVideoCard({ video }: Props) {
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
    <div className="relative w-full max-w-sm aspect-[9/16]">
      <video
        ref={ref}
        src={video.videoUrl}
        poster={video.thumbnailUrl || undefined}
        className="w-full h-full object-cover rounded-lg"
        loop
        muted
        playsInline
      />
      <div className="absolute right-2 bottom-10 flex flex-col gap-3">
        <ActionButton src="/icons/icon-like.svg" alt="Curtir" />
        <ActionButton src="/icons/icon-comment.svg" alt="Comentar" />
        <ActionButton src="/icons/icon-save.svg" alt="Salvar" />
        <ActionButton src="/icons/icon-share.svg" alt="Compartilhar" />
        <ActionButton src="/icons/icon-report.svg" alt="Denunciar" />
      </div>
      <div className="absolute left-2 bottom-2 text-white drop-shadow">
        <p className="font-semibold leading-tight">{video.user?.name}</p>
        <p className="text-sm leading-tight">{video.title}</p>
      </div>
    </div>
  );
}
