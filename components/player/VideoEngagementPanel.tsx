"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CommentInfo {
  id: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string | null;
}

interface PlayerVideoEngagementProps {
  videoId: string;
  title: string;
  description: string | null;
  initialLikes: number;
  initialComments: CommentInfo[];
}

const numberFormatter = new Intl.NumberFormat("pt-BR");
const commentDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
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

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "AG";
}

export function VideoEngagementPanel({
  videoId,
  title,
  description,
  initialLikes,
  initialComments,
}: PlayerVideoEngagementProps) {
  const commentInputRef = useRef<HTMLInputElement>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const normalizedInitialComments = useMemo(
    () => initialComments ?? [],
    [initialComments],
  );
  const [comments, setComments] = useState<CommentInfo[]>(normalizedInitialComments);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    const baseLikes = initialLikes;
    const likedIds = readStorage<string[]>(LIKED_STORAGE_KEY, []);
    const savedIds = readStorage<string[]>(SAVED_STORAGE_KEY, []);
    const storedComments = readStorage<CommentInfo[]>(
      commentsStorageKey(videoId),
      [],
    );

    const alreadyLiked = likedIds.includes(videoId);
    setLiked(alreadyLiked);
    setLikes(baseLikes + (alreadyLiked ? 1 : 0));
    setIsSaved(savedIds.includes(videoId));

    if (storedComments.length > 0) {
      setComments(
        storedComments.map((comment) => ({
          ...comment,
          authorAvatarUrl: comment.authorAvatarUrl ?? null,
        })),
      );
    } else {
      setComments(normalizedInitialComments);
    }
  }, [videoId, initialLikes, normalizedInitialComments]);

  useEffect(() => {
    if (!commentInputRef.current) {
      return;
    }
    if (commentInput.trim().length === 0) {
      commentInputRef.current.setCustomValidity("");
      return;
    }
    commentInputRef.current.setCustomValidity("");
  }, [commentInput]);

  const formattedLikes = useMemo(
    () => numberFormatter.format(Math.max(likes, 0)),
    [likes],
  );
  const formattedCommentsCount = useMemo(
    () => numberFormatter.format(comments.length),
    [comments.length],
  );

  const handleToggleLike = () => {
    setLiked((current) => {
      const next = !current;
      setLikes((value) => Math.max(0, value + (next ? 1 : -1)));
      toggleStoredId(LIKED_STORAGE_KEY, videoId, next);
      return next;
    });
  };

  const handleToggleSave = () => {
    setIsSaved((current) => {
      const next = !current;
      toggleStoredId(SAVED_STORAGE_KEY, videoId, next);
      return next;
    });
  };

  const handleShare = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const shareUrl = `${window.location.origin}/player/${videoId}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
        return;
      } catch (error) {
        console.error("Não foi possível compartilhar o vídeo", error);
      }
    }

    try {
      await navigator.clipboard?.writeText(shareUrl);
    } catch (error) {
      console.error("Não foi possível copiar o link para a área de transferência", error);
    }
  };

  const handleFocusComment = () => {
    if (commentSectionRef.current) {
      commentSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    requestAnimationFrame(() => {
      commentInputRef.current?.focus();
    });
  };

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = commentInput.trim();
    if (!content) {
      commentInputRef.current?.setCustomValidity("Informe um comentário antes de enviar");
      commentInputRef.current?.reportValidity();
      return;
    }

    const newComment: CommentInfo = {
      id: createCommentId(),
      authorName: "Você",
      authorAvatarUrl: null,
      content,
      createdAt: new Date().toISOString(),
    };

    setComments((current) => {
      const next = [newComment, ...current];
      writeStorage(commentsStorageKey(videoId), next);
      return next;
    });
    setCommentInput("");
    requestAnimationFrame(() => {
      commentInputRef.current?.focus();
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/80 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.65)] backdrop-blur">
        <CardHeader className="space-y-4">
          <span className="inline-flex rounded-full bg-secondary/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-secondary-foreground">
            Vídeo do atleta
          </span>
          <CardTitle className="font-heading text-4xl font-semibold leading-tight text-foreground">
            {title}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
            <span>{formattedLikes} curtidas</span>
            <span aria-hidden className="text-muted-foreground/60">
              •
            </span>
            <span>{formattedCommentsCount} comentários</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 text-base leading-relaxed text-foreground/90">
          {description ? (
            <p>{description}</p>
          ) : (
            <p className="text-muted-foreground">
              Este vídeo ainda não possui uma descrição detalhada.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <ActionButton
              icon="/icons/icon-like.svg"
              activeIcon="/icons/icon-like-active.svg"
              label={liked ? "Curtido" : "Curtir"}
              onClick={handleToggleLike}
              active={liked}
              disableActiveBackground
              counter={formattedLikes}
            />
            <ActionButton
              icon="/icons/icon-comment.svg"
              label="Comentar"
              onClick={handleFocusComment}
              counter={formattedCommentsCount}
            />
            <ActionButton
              icon="/icons/icon-save.svg"
              activeIcon="/icons/icon-save-active.svg"
              label={isSaved ? "Salvo" : "Salvar"}
              onClick={handleToggleSave}
              active={isSaved}
              disableActiveBackground
            />
            <ActionButton
              icon="/icons/icon-share.svg"
              label="Compartilhar"
              onClick={handleShare}
            />
          </div>
        </CardContent>
      </Card>

      <Card
        ref={commentSectionRef}
        className="border-border/60 bg-card/80 shadow-[0_24px_72px_-48px_rgba(15,23,42,0.65)] backdrop-blur"
      >
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Comentários
          </CardTitle>
          <CardDescription>
            Feedbacks publicados por agentes e clubes que assistiram ao conteúdo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmitComment} className="flex flex-col gap-3 sm:flex-row">
            <Input
              ref={commentInputRef}
              value={commentInput}
              onChange={(event) => setCommentInput(event.target.value)}
              placeholder="Adicionar comentário"
              className="flex-1"
              aria-label="Adicionar comentário"
              required
            />
            <Button
              type="submit"
              className="h-11 shrink-0 rounded-full bg-emerald-500 px-6 text-sm font-semibold text-white hover:bg-emerald-500/90"
            >
              Enviar
            </Button>
          </form>

          {comments.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {comments.map((comment) => {
                const initials = initialsFromName(comment.authorName);
                const commentDate = comment.createdAt ? new Date(comment.createdAt) : null;
                const formattedDate = commentDate ? commentDateFormatter.format(commentDate) : null;

                return (
                  <li
                    key={comment.id}
                    className="flex gap-4 rounded-3xl border border-border/60 bg-background/40 px-5 py-4 shadow-[0_20px_60px_-48px_rgba(15,23,42,0.7)] backdrop-blur"
                  >
                    <Avatar className="h-12 w-12">
                      {comment.authorAvatarUrl ? (
                        <AvatarImage src={comment.authorAvatarUrl} alt={comment.authorName} />
                      ) : null}
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-1 flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">{comment.authorName}</span>
                        {formattedDate ? (
                          <span className="text-xs text-muted-foreground">{formattedDate}</span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/90">{comment.content}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/60 bg-background/30 px-6 py-8 text-center text-muted-foreground">
              Nenhum comentário foi registrado para este vídeo até o momento.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active = false,
  counter,
  activeIcon,
  disableActiveBackground = false,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  counter?: string;
  activeIcon?: string;
  disableActiveBackground?: boolean;
}) {
  const iconSrc = active && activeIcon ? activeIcon : icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:border-foreground/40 hover:bg-background/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200",
        active &&
          !disableActiveBackground &&
          "border-emerald-500 bg-emerald-500/10 text-emerald-600",
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center">
        <Image src={iconSrc} alt="" width={20} height={20} />
      </span>
      <span>{label}</span>
      {counter ? (
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {counter}
        </span>
      ) : null}
    </button>
  );
}
