"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

import type { Role } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CommentReply, CommentThread } from "@/types/comments";

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
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

interface Props {
  video: Video;
  className?: string;
  showOverlayActions?: boolean;
  initialLikes?: number;
  initialComments?: CommentThread[];
  initialSaves?: number;
  initialShares?: number;
  isActive?: boolean;
  onActive?: (videoId: string) => void;
  muted?: boolean;
  onMuteChange?: (videoId: string, nextMuted: boolean) => void;
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
const SHARE_COUNT_STORAGE_KEY = "vitrine:feed:share-counts";

function normalizeComments(comments: CommentThread[]): CommentThread[] {
  return comments.map((comment) => ({
    ...comment,
    replies: comment.replies ? [...comment.replies] : [],
  }));
}

function countComments(comments: CommentThread[]): number {
  return comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
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

export function FeedVideoCard({
  video,
  className,
  showOverlayActions = true,
  initialLikes = 0,
  initialComments,
  initialSaves = 0,
  initialShares = 0,
  isActive = false,
  onActive,
  muted,
  onMuteChange,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const pendingActionRef = useRef<(() => void) | null>(null);
  const preservePendingRef = useRef(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginDialogAction, setLoginDialogAction] = useState<
    "save" | "comment" | null
  >(null);
  const profileName =
    video.user?.profile?.displayName?.trim() ||
    video.user?.name?.trim() ||
    "Talento anônimo";
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(initialSaves);
  const [shareCount, setShareCount] = useState(initialShares);
  const normalizedInitialComments = useMemo(
    () => normalizeComments(initialComments ?? []),
    [initialComments],
  );
  const [comments, setComments] = useState<CommentThread[]>(
    normalizedInitialComments,
  );
  const [totalComments, setTotalComments] = useState(() =>
    countComments(normalizedInitialComments),
  );
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");
  const [internalMuted, setInternalMuted] = useState(true);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replySubmittingId, setReplySubmittingId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [replyErrors, setReplyErrors] = useState<Record<string, string | null>>({});
  const isMuted = muted ?? internalMuted;
  const profileLink = resolveProfileHref(video.user?.profile);
  const commentsEndpoint = useMemo(
    () => `/api/videos/${encodeURIComponent(video.id)}/comments`,
    [video.id],
  );

  const handleLoginDialogOpenChange = useCallback((open: boolean) => {
    setLoginDialogOpen(open);
    if (!open) {
      if (!preservePendingRef.current) {
        pendingActionRef.current = null;
        setLoginDialogAction(null);
      }
      preservePendingRef.current = false;
    }
  }, []);

  const openLoginDialog = useCallback(() => {
    handleLoginDialogOpenChange(true);
  }, [handleLoginDialogOpenChange]);

  const closeLoginDialog = useCallback(
    (preservePending = false) => {
      preservePendingRef.current = preservePending;
      handleLoginDialogOpenChange(false);
    },
    [handleLoginDialogOpenChange],
  );

  const requestAuthentication = useCallback(
    (action: () => void, reason: "save" | "comment") => {
      if (isAuthenticated) {
        action();
        return;
      }

      pendingActionRef.current = action;
      setLoginDialogAction(reason);
      openLoginDialog();
    },
    [isAuthenticated, openLoginDialog],
  );

  useEffect(() => {
    if (!isAuthenticated || !pendingActionRef.current) {
      return;
    }

    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    setLoginDialogAction(null);
    closeLoginDialog();
    action();
  }, [isAuthenticated, closeLoginDialog]);

  const closeComments = useCallback(() => {
    setIsCommentPanelOpen(false);
    setReplyingTo(null);
    setReplyInput("");
  }, []);

  useEffect(() => {
    if (!isCommentPanelOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeComments();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeComments, isCommentPanelOpen]);

  useEffect(() => {
    if (muted === undefined) {
      setInternalMuted(true);
    }
    setIsUserPaused(false);
  }, [video.id, muted]);

  useEffect(() => {
    const videoEl = ref.current;
    if (!videoEl || !onActive) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
            onActive(video.id);
          }
        });
      },
      { threshold: [0, 0.5, 0.7, 1] },
    );

    observer.observe(videoEl);

    return () => observer.disconnect();
  }, [onActive, video.id]);

  useEffect(() => {
    const videoEl = ref.current;
    if (videoEl) {
      videoEl.load();
    }
  }, [video.videoUrl]);

  useEffect(() => {
    const videoEl = ref.current;
    if (!videoEl) {
      return;
    }

    videoEl.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const videoEl = ref.current;
    if (!videoEl) {
      return;
    }

    if (!isActive) {
      videoEl.pause();
      return;
    }

    if (isUserPaused) {
      videoEl.pause();
      return;
    }

    videoEl
      .play()
      .then(() => {})
      .catch(() => {});
  }, [isActive, isUserPaused]);

  useEffect(() => {
    const baseLikes = initialLikes;
    const likedIds = readStorage<string[]>(LIKED_STORAGE_KEY, []);
    const savedIds = readStorage<string[]>(SAVED_STORAGE_KEY, []);
    const shareCounts = readStorage<Record<string, number>>(SHARE_COUNT_STORAGE_KEY, {});

    const alreadyLiked = likedIds.includes(video.id);
    setLiked(alreadyLiked);
    setLikes(baseLikes + (alreadyLiked ? 1 : 0));
    const alreadySaved = savedIds.includes(video.id);
    setIsSaved(alreadySaved);
    setSavedCount(Math.max(0, initialSaves + (alreadySaved ? 1 : 0)));
    const storedShares = shareCounts[video.id] ?? 0;
    setShareCount(Math.max(0, initialShares + storedShares));
    setComments(normalizedInitialComments);
    setTotalComments(countComments(normalizedInitialComments));
  }, [
    video.id,
    initialLikes,
    normalizedInitialComments,
    initialSaves,
    initialShares,
  ]);

  useEffect(() => {
    if (!commentsEndpoint) {
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    async function loadComments() {
      setIsLoadingComments(true);
      try {
        const response = await fetch(commentsEndpoint, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch comments (${response.status})`);
        }

        const data = (await response.json()) as CommentThread[];
        if (!cancelled) {
          const normalized = normalizeComments(data);
          setComments(normalized);
          setTotalComments(countComments(normalized));
          setFeedbackMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Erro ao carregar comentários do feed", error);
          setFeedbackMessage(
            "Não foi possível carregar os comentários mais recentes deste vídeo.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingComments(false);
        }
      }
    }

    loadComments();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [commentsEndpoint]);

  const formattedLikes = useMemo(() => numberFormatter.format(Math.max(likes, 0)), [likes]);
  const formattedCommentsCount = useMemo(
    () => numberFormatter.format(Math.max(totalComments, 0)),
    [totalComments],
  );
  const formattedSavedCount = useMemo(
    () => numberFormatter.format(Math.max(savedCount, 0)),
    [savedCount],
  );
  const formattedShareCount = useMemo(
    () => numberFormatter.format(Math.max(shareCount, 0)),
    [shareCount],
  );

  const isPlaying = isActive && !isUserPaused;

  const handleTogglePlayback = () => {
    setIsUserPaused((current) => {
      const next = !current;
      const videoEl = ref.current;
      if (!videoEl) {
        return next;
      }
      if (next) {
        videoEl.pause();
      } else if (isActive) {
        videoEl.play().catch(() => {});
      }
      return next;
    });
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    if (muted === undefined) {
      setInternalMuted(nextMuted);
    }
    onMuteChange?.(video.id, nextMuted);
  };

  const handleToggleLike = () => {
    setLiked((current) => {
      const next = !current;
      setLikes((value) => Math.max(0, value + (next ? 1 : -1)));
      toggleStoredId(LIKED_STORAGE_KEY, video.id, next);
      return next;
    });
  };

  const toggleSave = useCallback(() => {
    setIsSaved((current) => {
      const next = !current;
      setSavedCount((value) => Math.max(0, value + (next ? 1 : -1)));
      toggleStoredId(SAVED_STORAGE_KEY, video.id, next);
      return next;
    });
  }, [video.id]);

  const handleSaveClick = useCallback(() => {
    requestAuthentication(toggleSave, "save");
  }, [requestAuthentication, toggleSave]);

  const handleSubmitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = commentInput.trim();
    if (!content) {
      return;
    }

    const execute = async () => {
      setIsSubmittingComment(true);
      setFeedbackMessage(null);
      try {
        const response = await fetch(commentsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (response.status === 401) {
          setFeedbackMessage("Faça login para comentar este vídeo.");
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to publish comment (${response.status})`);
        }

        const data = (await response.json()) as {
          comment?: CommentThread;
          totalCount?: number;
        };

        if (data.comment) {
          const [normalizedComment] = normalizeComments([data.comment]);
          if (normalizedComment) {
            setComments((current) => [normalizedComment, ...current]);
          }
        }

        if (typeof data.totalCount === "number") {
          setTotalComments(data.totalCount);
        } else {
          setTotalComments((current) => current + 1);
        }

        setCommentInput("");
        setIsCommentPanelOpen(true);
        setReplyingTo(null);
        setReplyInput("");
      } catch (error) {
        console.error("Erro ao publicar comentário no feed", error);
        setFeedbackMessage("Não foi possível publicar o comentário. Tente novamente em instantes.");
      } finally {
        setIsSubmittingComment(false);
      }
    };

    if (!isAuthenticated) {
      requestAuthentication(() => {
        setIsCommentPanelOpen(true);
        void execute();
      }, "comment");
      return;
    }

    void execute();
  };

  const handleStartReply = (commentId: string) => {
    requestAuthentication(() => {
      setIsCommentPanelOpen(true);
      setReplyingTo(commentId);
      setReplyInput("");
      setReplyErrors((current) => ({ ...current, [commentId]: null }));
    }, "comment");
  };

  const handleCancelReply = () => {
    const parentId = replyingTo;
    setReplyingTo(null);
    setReplyInput("");
    if (!parentId) {
      return;
    }
    setReplyErrors((current) => {
      const next = { ...current };
      delete next[parentId];
      return next;
    });
  };

  const handleSubmitReply = (
    event: React.FormEvent<HTMLFormElement>,
    parentId: string,
  ) => {
    event.preventDefault();
    if (!isAuthenticated) {
      requestAuthentication(() => {
        setIsCommentPanelOpen(true);
        setReplyingTo(parentId);
      }, "comment");
      return;
    }
    const content = replyInput.trim();
    if (!content) {
      return;
    }

    const execute = async () => {
      setReplySubmittingId(parentId);
      setReplyErrors((current) => ({ ...current, [parentId]: null }));
      try {
        const response = await fetch(commentsEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, parentId }),
        });

        if (response.status === 401) {
          setFeedbackMessage("Faça login para responder comentários.");
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to publish reply (${response.status})`);
        }

        const data = (await response.json()) as {
          reply?: CommentReply;
          parentId?: string;
          totalCount?: number;
        };

        if (data.reply && data.parentId) {
          setComments((current) =>
            current.map((comment) => {
              if (comment.id !== data.parentId) {
                return comment;
              }
              return {
                ...comment,
                replies: [data.reply!, ...comment.replies],
              } satisfies CommentThread;
            }),
          );
        }

        if (typeof data.totalCount === "number") {
          setTotalComments(data.totalCount);
        } else {
          setTotalComments((current) => current + 1);
        }

        setReplyInput("");
        setReplyingTo(null);
      } catch (error) {
        console.error("Erro ao publicar resposta no feed", error);
        setReplyErrors((current) => ({
          ...current,
          [parentId]: "Não foi possível publicar a resposta. Tente novamente.",
        }));
      } finally {
        setReplySubmittingId(null);
      }
    };

    if (!isAuthenticated) {
      requestAuthentication(() => {
        setIsCommentPanelOpen(true);
        setReplyingTo(parentId);
        void execute();
      }, "comment");
      return;
    }

    void execute();
  };

  const handleCommentButtonClick = () => {
    if (isCommentPanelOpen) {
      closeComments();
      return;
    }

    requestAuthentication(() => {
      setIsCommentPanelOpen(true);
    }, "comment");
  };

  const handleNavigateToLogin = useCallback(() => {
    closeLoginDialog(true);
    router.push("/login");
  }, [closeLoginDialog, router]);

  const handleNavigateToRegister = useCallback(() => {
    closeLoginDialog(true);
    router.push("/registrar-escolha-perfil");
  }, [closeLoginDialog, router]);

  const dialogContent = loginDialogAction
    ? loginDialogAction === "save"
      ? {
          title: "Entre para salvar vídeos",
          description:
            "Crie uma conta ou faça login para guardar seus vídeos favoritos e acessá-los em qualquer dispositivo.",
        }
      : {
          title: "Entre para comentar",
          description:
            "Crie uma conta ou faça login para participar das conversas e interagir com outros talentos.",
        }
    : null;

  const ActionButton = ({
    icon,
    alt,
    onClick,
    active = false,
    count,
    activeIcon,
    disableActiveBackground = false,
  }: {
    icon: string;
    alt: string;
    onClick: () => void;
    active?: boolean;
    count?: string;
    activeIcon?: string;
    disableActiveBackground?: boolean;
  }) => {
    const iconSrc = active && activeIcon ? activeIcon : icon;

    return (
      <div className="flex flex-col items-center gap-1">
        <button
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition hover:scale-105 hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
            active &&
              !disableActiveBackground &&
              "bg-emerald-500 text-white shadow-[0_12px_30px_-12px_rgba(16,185,129,0.75)]",
          )}
          onClick={onClick}
          type="button"
          aria-pressed={active}
          title={alt}
        >
          <Image src={iconSrc} alt={alt} width={28} height={28} />
        </button>
        {count ? (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
            {count}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          "relative aspect-[9/16] w-full max-w-full overflow-hidden rounded-[32px] bg-slate-900 shadow-[0_24px_64px_-32px_rgba(15,23,42,0.65)] ring-1 ring-black/10 sm:max-w-sm",
          className,
        )}
      >
      <video
        ref={ref}
        src={video.videoUrl}
        poster={video.thumbnailUrl || undefined}
        className="h-full w-full object-cover"
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black via-black/40 to-transparent" />
      {showOverlayActions && (
        <>
          <div className="absolute bottom-10 right-2 flex flex-col gap-4">
            <ActionButton
              icon={isPlaying ? "/icons/icon-pause.svg" : "/icons/icon-play.svg"}
              alt={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
              onClick={handleTogglePlayback}
              active={isPlaying}
            />
            <ActionButton
              icon={isMuted ? "/icons/icon-volume-off.svg" : "/icons/icon-volume-on.svg"}
              alt={isMuted ? "Ativar som" : "Desativar som"}
              onClick={handleToggleMute}
              active={!isMuted}
            />
            <ActionButton
              icon="/icons/icon-like.svg"
              alt="Curtir"
              onClick={handleToggleLike}
              active={liked}
              activeIcon="/icons/icon-like-active.svg"
              disableActiveBackground
              count={formattedLikes}
            />
            <ActionButton
              icon="/icons/icon-comment.svg"
              alt="Comentários"
              onClick={handleCommentButtonClick}
              active={isCommentPanelOpen}
              count={formattedCommentsCount}
            />
            <ActionButton
              icon="/icons/icon-save.svg"
              alt="Salvar vídeo"
              onClick={handleSaveClick}
              active={isSaved}
              activeIcon="/icons/icon-save-active.svg"
              disableActiveBackground
              count={formattedSavedCount}
            />
            <ActionButton
              icon="/icons/icon-share.svg"
              alt="Compartilhar"
              onClick={() => {
                if (typeof window === "undefined") {
                  return;
                }

                const shareUrl = `${window.location.origin}/player/${video.id}`;

                const registerShare = () => {
                  setShareCount((value) => value + 1);
                  const shareCounts = readStorage<Record<string, number>>(SHARE_COUNT_STORAGE_KEY, {});
                  const nextCounts = {
                    ...shareCounts,
                    [video.id]: (shareCounts[video.id] ?? 0) + 1,
                  };
                  writeStorage(SHARE_COUNT_STORAGE_KEY, nextCounts);
                };

                if (typeof navigator !== "undefined" && navigator.share) {
                  navigator
                    .share({
                      title: video.title,
                      url: shareUrl,
                    })
                    .then(registerShare)
                    .catch(() => {});
                  return;
                }

                const clipboard = navigator.clipboard;
                if (clipboard) {
                  clipboard.writeText(shareUrl).then(registerShare).catch(() => {});
                }
              }}
              count={formattedShareCount}
            />
            <ActionButton
              icon="/icons/icon-report.svg"
              alt="Denunciar"
              onClick={() => {
                console.info(`Denunciar vídeo ${video.id}`);
              }}
            />
          </div>

          {isCommentPanelOpen ? (
            <div className="pointer-events-none absolute inset-x-4 bottom-[128px] sm:bottom-[144px]">
              <div className="pointer-events-auto rounded-3xl bg-black/80 p-4 text-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.95)] backdrop-blur">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    Comentários
                  </p>
                  <button
                    type="button"
                    onClick={closeComments}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    <X className="h-4 w-4" aria-hidden />
                    <span className="sr-only">Fechar comentários</span>
                  </button>
                </div>
                <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
                  <Input
                    value={commentInput}
                    onChange={(event) => setCommentInput(event.target.value)}
                    placeholder="Adicionar comentário"
                    className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/70"
                    disabled={isSubmittingComment}
                  />
                  <Button
                    type="submit"
                    className="self-end rounded-full bg-emerald-500 px-5 text-sm font-semibold text-white hover:bg-emerald-500/90"
                    disabled={isSubmittingComment}
                  >
                    {isSubmittingComment ? "Enviando..." : "Enviar"}
                  </Button>
                </form>

                {feedbackMessage ? (
                  <div className="rounded-2xl border border-amber-300/60 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                    {feedbackMessage}
                  </div>
                ) : null}

                <div className="mt-3 flex max-h-60 flex-col gap-3 overflow-y-auto pr-1">
                  {isLoadingComments && comments.length === 0 ? (
                    <p className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center text-xs text-white/70">
                      Carregando comentários...
                    </p>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => {
                      const createdAt = comment.createdAt ? new Date(comment.createdAt) : null;
                      const formattedCreatedAt = createdAt
                        ? commentDateFormatter.format(createdAt)
                        : null;
                      const isReplySubmitting = replySubmittingId === comment.id;
                      const replyError = replyErrors[comment.id] ?? null;
                      return (
                        <div key={comment.id}>
                          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
                              {comment.authorName}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-white/90">
                              {comment.content}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <p className="text-[10px] uppercase tracking-[0.16em] text-white/50">
                                {formattedCreatedAt ?? ""}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleStartReply(comment.id)}
                                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300 transition hover:text-emerald-200"
                              >
                                Responder
                              </button>
                            </div>
                          </div>

                          {replyingTo === comment.id ? (
                            <form
                              onSubmit={(event) => handleSubmitReply(event, comment.id)}
                              className="mt-2 flex flex-col gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-3"
                            >
                              <Input
                                value={replyInput}
                                onChange={(event) => setReplyInput(event.target.value)}
                                placeholder="Escreva uma resposta"
                                className="border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white/70"
                                disabled={isReplySubmitting}
                              />
                              {replyError ? (
                                <p className="text-xs text-amber-200">{replyError}</p>
                              ) : null}
                              <div className="flex justify-end gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  rounded="lg"
                                  className="border-transparent bg-transparent px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/70 hover:bg-white/10"
                                  onClick={handleCancelReply}
                                  disabled={isReplySubmitting}
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  type="submit"
                                  size="sm"
                                  rounded="lg"
                                  className="px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
                                  disabled={isReplySubmitting}
                                >
                                  {isReplySubmitting ? "Enviando..." : "Enviar resposta"}
                                </Button>
                              </div>
                            </form>
                          ) : null}

                          {comment.replies && comment.replies.length > 0 ? (
                            <div className="mt-2 flex flex-col gap-2 border-l border-white/15 pl-3">
                              {comment.replies.map((reply) => {
                                const replyCreatedAt = reply.createdAt ? new Date(reply.createdAt) : null;
                                const formattedReplyCreatedAt = replyCreatedAt
                                  ? commentDateFormatter.format(replyCreatedAt)
                                  : null;
                                return (
                                  <div
                                    key={reply.id}
                                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2"
                                  >
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                                      {reply.authorName}
                                    </p>
                                    <p className="mt-1 text-[13px] leading-relaxed text-white/90">
                                      {reply.content}
                                    </p>
                                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/50">
                                      {formattedReplyCreatedAt ?? ""}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-xs text-white/70">
                      Seja o primeiro a deixar um comentário sobre este vídeo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 text-white drop-shadow">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            name={profileName}
            avatarUrl={
              video.user?.profile?.avatarUrl ?? video.user?.image ?? null
            }
            profileHref={profileLink}
          />
          <div className="flex flex-col">
            <Link
              href={profileLink ?? "#"}
              aria-disabled={!profileLink}
              tabIndex={profileLink ? 0 : -1}
              className={cn(
                "text-sm font-semibold uppercase tracking-[0.1em] text-white/70",
                !profileLink && "pointer-events-none opacity-60",
              )}
            >
              {profileName}
            </Link>
            <p className="text-base font-semibold leading-tight text-white">
              {video.title}
            </p>
          </div>
        </div>
      </div>
    </div>
    <Dialog open={loginDialogOpen} onOpenChange={handleLoginDialogOpenChange}>
      <DialogContent className="max-w-sm border-white/20 bg-slate-900/95 text-white">
        {dialogContent ? (
          <DialogHeader className="space-y-3 text-left">
            <DialogTitle className="text-lg font-semibold text-white">
              {dialogContent.title}
            </DialogTitle>
            <DialogDescription className="text-sm text-white/80">
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
        ) : null}
        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            className="h-11 w-full rounded-full bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-500/90"
            onClick={handleNavigateToLogin}
          >
            Fazer login
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-full border-white/40 bg-transparent text-sm font-semibold text-white hover:bg-white/10"
            onClick={handleNavigateToRegister}
          >
            Criar conta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

function resolveProfileHref(
  profile?: {
    id?: string | null;
    role?: Role | null;
  } | null,
) {
  if (!profile?.id) {
    return null;
  }

  switch (profile.role) {
    case "ATLETA":
      return `/atletas/${profile.id}`;
    case "AGENTE":
      return `/agentes/${profile.id}`;
    default:
      return `/perfis/${profile.id}`;
  }
}

function ProfileAvatar({
  name,
  avatarUrl,
  profileHref,
}: {
  name: string;
  avatarUrl: string | null;
  profileHref: string | null;
}) {
  const initials = createInitials(name);

  const avatar = (
    <Avatar className="h-12 w-12 border-2 border-white/60 bg-white/20">
      <AvatarImage src={avatarUrl ?? undefined} alt={name} />
      <AvatarFallback className="bg-emerald-500/80 text-sm font-semibold uppercase tracking-[0.18em] text-white">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (profileHref) {
    return (
      <Link href={profileHref} className="shrink-0" aria-label={`Ver perfil de ${name}`}>
        {avatar}
      </Link>
    );
  }

  return <div className="shrink-0">{avatar}</div>;
}

function createInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .padEnd(2, "");
}
