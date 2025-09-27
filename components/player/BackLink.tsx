"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PlayerBackLinkProps {
  fallbackHref: string;
  label: string;
  className?: string;
}

export function PlayerBackLink({ fallbackHref, label, className }: PlayerBackLinkProps) {
  const router = useRouter();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const historyState = window.history.state as { idx?: number } | null;
    if (typeof historyState?.idx === "number" && historyState.idx > 0) {
      setCanGoBack(true);
      return;
    }

    if (window.history.length > 1) {
      setCanGoBack(true);
    }
  }, []);

  if (canGoBack) {
    return (
      <button
        type="button"
        onClick={() => router.back()}
        className={className}
      >
        <span aria-hidden>←</span>
        {label}
      </button>
    );
  }

  return (
    <Link href={fallbackHref} prefetch={false} className={className}>
      <span aria-hidden>←</span>
      {label}
    </Link>
  );
}
