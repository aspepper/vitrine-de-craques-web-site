"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface FeedVideoComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface Props {
  video: Video;
  className?: string;
  showOverlayActions?: boolean;
  initialLikes?: number;
  initialComments?: FeedVideoComment[];
}

const numberFormatter = new Intl.NumberFormat("pt-BR");
const commentDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const LIKED_STORAGE_KEY = "vitrine:feed:likes";
const SAVED_STORAGE_KEY = "vitrine:feed:saved";

function commentsStorageKey(videoId: string) {
  return `vitrine:feed:comments:${videoId}`;
}

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch (error) {
    console.error(`Não foi possível ler os dados locais para ${key}`, error);
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Não foi possível persistir os dados locais para ${key}`, error);
  }
}

function toggleStoredId(key: string, id: string, enabled: boolean) {
  const current = new Set(readStorage<string[]>(key, []));
  if (enabled) {
    current.add(id);
  } else {
    current.delete(id);
  }
  writeStorage(key, Array.from(current));
}

function createCommentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function FeedVideoCard({
  video,
  className,
  showOverlayActions = true,
  initialLikes = 0,
  initialComments = [],
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const authorName = video.user?.name?.trim() || "Talento anônimo";
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState<FeedVideoComment[]>(initialComments);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");

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

  useEffect(() => {
    const videoEl = ref.current;
    if (videoEl) {
      videoEl.load();
    }
  }, [video.videoUrl]);

  useEffect(() => {
    const baseLikes = initialLikes;
    const likedIds = readStorage<string[]>(LIKED_STORAGE_KEY, []);
    const savedIds = readStorage<string[]>(SAVED_STORAGE_KEY, []);
    const storedComments = readStorage<FeedVideoComment[]>(
      commentsStorageKey(video.id),
      [],
    );

    const alreadyLiked = likedIds.includes(video.id);
    setLiked(alreadyLiked);
    setLikes(baseLikes + (alreadyLiked ? 1 : 0));
    setIsSaved(savedIds.includes(video.id));

    if (storedComments.length > 0) {
      setComments(storedComments);
    } else {
      setComments(initialComments);
    }
  }, [video.id, initialLikes, initialComments]);

  const formattedLikes = useMemo(() => numberFormatter.format(Math.max(likes, 0)), [likes]);
  const formattedCommentsCount = useMemo(
    () => numberFormatter.format(comments.length),
    [comments.length],
  );

  const handleToggleLike = () => {
    setLiked((current) => {
      const next = !current;
      setLikes((value) => Math.max(0, value + (next ? 1 : -1)));
      toggleStoredId(LIKED_STORAGE_KEY, video.id, next);
      return next;
    });
  };

  const handleToggleSave = () => {
    setIsSaved((current) => {
      const next = !current;
      toggleStoredId(SAVED_STORAGE_KEY, video.id, next);
      return next;
    });
  };

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = commentInput.trim();
    if (!content) {
      return;
    }

    const newComment: FeedVideoComment = {
      id: createCommentId(),
      authorName: "Você",
      content,
      createdAt: new Date().toISOString(),
    };

    setComments((current) => {
      const next = [newComment, ...current];
      writeStorage(commentsStorageKey(video.id), next);
      return next;
    });
    setCommentInput("");
    setIsCommentPanelOpen(true);
  };

  const ActionButton = ({
    src,
    alt,
    onClick,
    active = false,
    count,
  }: {
    src: string;
    alt: string;
    onClick: () => void;
    active?: boolean;
    count?: string;
  }) => (
    <div className="flex flex-col items-center gap-1">
      <button
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:scale-105 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
          active && "bg-emerald-500 text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.75)]",
        )}
        onClick={onClick}
        type="button"
        aria-pressed={active}
        title={alt}
      >
        <Image src={src} alt={alt} width={28} height={28} />
      </button>
      {count ? (
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
          {count}
        </span>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-[32px] bg-slate-900 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.65)] ring-1 ring-black/10",
        className,
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
        autoPlay
        preload="metadata"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/40 to-transparent" />
      {showOverlayActions && (
        <>
          <div className="absolute bottom-10 right-2 flex flex-col gap-4">
            <ActionButton
              src="/icons/icon-like.svg"
              alt="Curtir"
              onClick={handleToggleLike}
              active={liked}
              count={formattedLikes}
            />
            <ActionButton
              src="/icons/icon-comment.svg"
              alt="Comentários"
              onClick={() => setIsCommentPanelOpen((value) => !value)}
              active={isCommentPanelOpen}
              count={formattedCommentsCount}
            />
            <ActionButton
              src="/icons/icon-save.svg"
              alt="Salvar vídeo"
              onClick={handleToggleSave}
              active={isSaved}
            />
            <ActionButton
              src="/icons/icon-share.svg"
              alt="Compartilhar"
              onClick={() => {
                if (
                  typeof navigator !== "undefined" &&
                  navigator.share &&
                  typeof window !== "undefined"
                ) {
                  navigator
                    .share({
                      title: video.title,
                      url: `${window.location.origin}/player/${video.id}`,
                    })
                    .catch(() => {});
                }
              }}
            />
            <ActionButton
              src="/icons/icon-report.svg"
              alt="Denunciar"
              onClick={() => {
                console.info(`Denunciar vídeo ${video.id}`);
              }}
            />
          </div>

          {isCommentPanelOpen ? (
            <div className="pointer-events-none absolute inset-x-4 bottom-4">
              <div className="pointer-events-auto rounded-3xl bg-black/80 p-4 text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.95)] backdrop-blur">
                <div className="flex max-h-36 flex-col gap-3 overflow-y-auto pr-1">
                  {comments.length > 0 ? (
                    comments.map((comment) => {
                      const createdAt = new Date(comment.createdAt);
                      return (
                        <div
                          key={comment.id}
                          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                            {comment.authorName}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-white/90">
                            {comment.content}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/50">
                            {commentDateFormatter.format(createdAt)}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-xs text-white/70">
                      Seja o primeiro a deixar um comentário sobre este vídeo.
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmitComment} className="mt-3 flex gap-2">
                  <Input
                    value={commentInput}
                    onChange={(event) => setCommentInput(event.target.value)}
                    placeholder="Adicionar comentário"
                    className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/70"
                  />
                  <Button
                    type="submit"
                    className="rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-500/90"
                  >
                    Enviar
                  </Button>
                </form>
              </div>
            </div>
          ) : null}
        </>
      )}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1 text-white drop-shadow">
        <p className="text-sm font-semibold uppercase tracking-[0.1em] text-white/70">{authorName}</p>
        <p className="text-base font-semibold leading-tight">{video.title}</p>
      </div>
    </div>
  );
}
