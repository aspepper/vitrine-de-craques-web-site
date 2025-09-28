"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export type ArticleActionType = "news" | "game";

interface ArticleActionBarProps {
  itemId: string;
  itemType: ArticleActionType;
  shareUrl: string;
  commentHref?: string;
  className?: string;
  engagementUrl?: string | null;
  metrics?: {
    likes?: number;
    comments?: number;
    saves?: number;
    shares?: number;
  };
}

const numberFormatter = new Intl.NumberFormat("pt-BR");

const STORAGE_PREFIX = "vitrine:articles";

function storageKey(type: ArticleActionBarProps["itemType"], action: "likes" | "saved") {
  return `${STORAGE_PREFIX}:${type}:${action}`;
}

function readStoredIds(key: string): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch (error) {
    console.error(`Não foi possível ler os dados locais para ${key}`, error);
    return [];
  }
}

function writeStoredIds(key: string, ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error(`Não foi possível persistir os dados locais para ${key}`, error);
  }
}

function toggleId(key: string, id: string, enabled: boolean) {
  const ids = new Set(readStoredIds(key));
  if (enabled) {
    ids.add(id);
  } else {
    ids.delete(id);
  }
  writeStoredIds(key, Array.from(ids));
}

export function ArticleActionBar({
  itemId,
  itemType,
  shareUrl,
  commentHref,
  className,
  engagementUrl,
  metrics,
}: ArticleActionBarProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [initialLiked, setInitialLiked] = useState(false);
  const [initialSaved, setInitialSaved] = useState(false);
  const [engagementMetrics, setEngagementMetrics] = useState<ArticleActionBarProps["metrics"]>(metrics);

  const likeKey = useMemo(() => storageKey(itemType, "likes"), [itemType]);
  const saveKey = useMemo(() => storageKey(itemType, "saved"), [itemType]);

  useEffect(() => {
    const likedIds = readStoredIds(likeKey);
    const savedIds = readStoredIds(saveKey);
    const isInitiallyLiked = likedIds.includes(itemId);
    const isInitiallySaved = savedIds.includes(itemId);

    setLiked(isInitiallyLiked);
    setSaved(isInitiallySaved);
    setInitialLiked(isInitiallyLiked);
    setInitialSaved(isInitiallySaved);
  }, [itemId, likeKey, saveKey]);

  useEffect(() => {
    setEngagementMetrics(metrics);
  }, [metrics]);

  useEffect(() => {
    if (!engagementUrl) {
      return;
    }

    const controller = new AbortController();

    async function loadEngagement() {
      try {
        const response = await fetch(engagementUrl, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Falha ao buscar métricas em ${engagementUrl}`);
        }

        const data = (await response.json()) as ArticleActionBarProps["metrics"];

        if (!controller.signal.aborted) {
          setEngagementMetrics((current) => ({ ...current, ...data }));
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        if (process.env.NODE_ENV !== "production") {
          console.error("Não foi possível carregar as métricas de engajamento", error);
        }
      }
    }

    loadEngagement();

    return () => {
      controller.abort();
    };
  }, [engagementUrl]);

  const handleToggleLike = useCallback(() => {
    setLiked((current) => {
      const next = !current;
      toggleId(likeKey, itemId, next);
      return next;
    });
  }, [itemId, likeKey]);

  const handleToggleSave = useCallback(() => {
    setSaved((current) => {
      const next = !current;
      toggleId(saveKey, itemId, next);
      return next;
    });
  }, [itemId, saveKey]);

  const handleShare = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const shareData = {
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
      return;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
  }, [shareUrl]);

  const handleComment = useCallback(() => {
    if (!commentHref) {
      return;
    }

    if (commentHref.startsWith("#")) {
      if (typeof document === "undefined") {
        return;
      }

      const target = document.querySelector(commentHref);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    router.push(commentHref);
  }, [commentHref, router]);

  const likeDelta = liked === initialLiked ? 0 : liked ? 1 : -1;
  const saveDelta = saved === initialSaved ? 0 : saved ? 1 : -1;

  const resolvedMetrics = engagementMetrics ?? metrics;

  const likeCount = Math.max(0, (resolvedMetrics?.likes ?? 0) + likeDelta);
  const saveCount = Math.max(0, (resolvedMetrics?.saves ?? 0) + saveDelta);
  const commentCount = Math.max(0, resolvedMetrics?.comments ?? 0);
  const shareCount = Math.max(0, resolvedMetrics?.shares ?? 0);

  const formattedLikes = numberFormatter.format(likeCount);
  const formattedSaves = numberFormatter.format(saveCount);
  const formattedComments = numberFormatter.format(commentCount);
  const formattedShares = numberFormatter.format(shareCount);

  return (
    <div className={cn("flex flex-wrap items-center gap-5", className)}>
      <ArticleActionButton
        icon="/icons/icon-like.svg"
        activeIcon="/icons/icon-like-active.svg"
        label={liked ? "Remover curtida" : "Curtir"}
        onClick={handleToggleLike}
        active={liked}
        disableActiveBackground
        count={formattedLikes}
      />
      <ArticleActionButton
        icon="/icons/icon-comment.svg"
        label="Comentar"
        onClick={handleComment}
        disabled={!commentHref}
        count={formattedComments}
      />
      <ArticleActionButton
        icon="/icons/icon-save.svg"
        activeIcon="/icons/icon-save-active.svg"
        label={saved ? "Remover dos salvos" : "Salvar"}
        onClick={handleToggleSave}
        active={saved}
        disableActiveBackground
        count={formattedSaves}
      />
      <ArticleActionButton
        icon="/icons/icon-share.svg"
        label="Compartilhar"
        onClick={handleShare}
        count={formattedShares}
      />
    </div>
  );
}

interface ArticleActionButtonProps {
  icon: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  activeIcon?: string;
  disableActiveBackground?: boolean;
  disabled?: boolean;
  count?: string;
}

function ArticleActionButton({
  icon,
  label,
  onClick,
  active = false,
  activeIcon,
  disableActiveBackground = false,
  disabled = false,
  count,
}: ArticleActionButtonProps) {
  const iconSrc = active && activeIcon ? activeIcon : icon;

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-foreground/5 text-foreground transition hover:scale-[1.03] hover:border-foreground/60 hover:bg-foreground/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200",
          active &&
            !disableActiveBackground &&
            "border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-[0_12px_30px_-12px_rgba(16,185,129,0.75)]",
          disabled &&
            "cursor-not-allowed opacity-60 hover:scale-100 hover:border-border/40 hover:bg-foreground/5",
        )}
      >
        <span className="sr-only">{label}</span>
        <Image src={iconSrc} alt="" width={24} height={24} />
      </button>
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {count}
      </span>
    </div>
  );
}
