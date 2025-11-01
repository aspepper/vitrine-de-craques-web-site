"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationBellProps = {
  hasPending?: boolean;
  className?: string;
  title?: string;
};

export function NotificationBell({ hasPending = false, className, title }: NotificationBellProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-slate-900 transition hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:text-white dark:hover:text-slate-200",
        className,
      )}
      title={title}
      aria-label={title ?? "Ver notificações"}
    >
      <Bell className="h-[21px] w-[21px]" strokeWidth={2.1} />
      {hasPending ? (
        <span className="absolute right-[6px] top-[7px] inline-flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 shadow-[0_0_0_2px_rgba(255,255,255,0.95)] dark:shadow-[0_0_0_2px_rgba(2,6,23,0.95)]">
          <span className="sr-only">Você possui notificações não lidas</span>
        </span>
      ) : null}
    </button>
  );
}
