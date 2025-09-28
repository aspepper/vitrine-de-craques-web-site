"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface ArticleActionBarProps {
  itemId: string;
  itemType: "news" | "game";
  shareUrl: string;
  commentHref?: string;
  className?: string;
}

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
}: ArticleActionBarProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const likeKey = useMemo(() => storageKey(itemType, "likes"), [itemType]);
  const saveKey = useMemo(() => storageKey(itemType, "saved"), [itemType]);

  useEffect(() => {
    const likedIds = readStoredIds(likeKey);
    const savedIds = readStoredIds(saveKey);
    setLiked(likedIds.includes(itemId));
    setSaved(savedIds.includes(itemId));
  }, [itemId, likeKey, saveKey]);

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

    router.push(commentHref);
  }, [commentHref, router]);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-full border border-border/60 bg-background/60 px-4 py-2 text-sm font-semibold text-foreground/80",
        className,
      )}
    >
      <ArticleActionButton
        icon="/icons/icon-like.svg"
        activeIcon="/icons/icon-like-active.svg"
        label={liked ? "Curtido" : "Curtir"}
        onClick={handleToggleLike}
        active={liked}
        disableActiveBackground
      />
      <ArticleActionButton
        icon="/icons/icon-save.svg"
        activeIcon="/icons/icon-save-active.svg"
        label={saved ? "Salvo" : "Salvar"}
        onClick={handleToggleSave}
        active={saved}
        disableActiveBackground
      />
      <ArticleActionButton
        icon="/icons/icon-comment.svg"
        label="Comentar"
        onClick={handleComment}
        disabled={!commentHref}
      />
      <ArticleActionButton
        icon="/icons/icon-share.svg"
        label="Compartilhar"
        onClick={handleShare}
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
}

function ArticleActionButton({
  icon,
  label,
  onClick,
  active = false,
  activeIcon,
  disableActiveBackground = false,
  disabled = false,
}: ArticleActionButtonProps) {
  const iconSrc = active && activeIcon ? activeIcon : icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/80 transition hover:border-foreground/40 hover:bg-background/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200",
        active &&
          !disableActiveBackground &&
          "border-emerald-500 bg-emerald-500/10 text-emerald-600",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center">
        <Image src={iconSrc} alt="" width={20} height={20} />
      </span>
      <span>{label}</span>
    </button>
  );
}
