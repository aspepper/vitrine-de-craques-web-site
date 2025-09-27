"use client";

import { useMemo, useState } from "react";

import { FollowButton } from "@/components/FollowButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type PlayerFollowConnection = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  roleLabel: string;
  since: string | null;
  isFollowedByViewer: boolean;
  isViewer: boolean;
};

interface PlayerFollowConnectionsDialogProps {
  followers: PlayerFollowConnection[];
  following: PlayerFollowConnection[];
  viewerId: string | null;
  loginRedirectTo: string;
}

type ActiveView = "followers" | "following";

const numberFormatter = new Intl.NumberFormat("pt-BR");
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function PlayerFollowConnectionsDialog({
  followers,
  following,
  viewerId,
  loginRedirectTo,
}: PlayerFollowConnectionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("followers");

  const counts = useMemo(
    () => ({
      followers: followers.length,
      following: following.length,
    }),
    [followers.length, following.length],
  );

  const currentList = activeView === "followers" ? followers : following;
  const dialogTitle = activeView === "followers" ? "Seguidores" : "Seguindo";

  const handleOpen = (view: ActiveView) => {
    setActiveView(view);
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <DialogTrigger asChild>
          <button
            type="button"
            onClick={() => handleOpen("followers")}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100/70 px-4 py-2 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              {numberFormatter.format(counts.followers)}
            </span>
            Seguidores
          </button>
        </DialogTrigger>
        <DialogTrigger asChild>
          <button
            type="button"
            onClick={() => handleOpen("following")}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100/70 px-4 py-2 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/80"
          >
            <span className="text-base font-semibold text-slate-900 dark:text-white">
              {numberFormatter.format(counts.following)}
            </span>
            Seguindo
          </button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-slate-900 dark:text-white">
            {dialogTitle}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            Descubra novos perfis para acompanhar a partir da rede deste atleta.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-full bg-slate-100/80 p-1 dark:bg-slate-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActiveView("followers")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeView === "followers"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Seguidores ({numberFormatter.format(counts.followers)})
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setActiveView("following")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeView === "following"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Seguindo ({numberFormatter.format(counts.following)})
          </Button>
        </div>

        {currentList.length > 0 ? (
          <ul className="grid gap-3">
            {currentList.map((connection) => {
              const sinceLabel = connection.since
                ? dateFormatter.format(new Date(connection.since))
                : null;
              const isViewerConnection =
                connection.isViewer || (viewerId ? viewerId === connection.userId : false);

              return (
                <li
                  key={connection.userId}
                  className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white/90 px-4 py-3 shadow-[0_18px_50px_-35px_rgba(15,23,42,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_70px_-40px_rgba(15,23,42,0.45)] dark:border-white/10 dark:bg-slate-900/80 dark:shadow-[0_30px_80px_-48px_rgba(2,6,23,0.75)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={connection.avatarUrl ?? undefined} alt={connection.displayName} />
                      <AvatarFallback className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                        {connection.displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {connection.displayName}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        {connection.roleLabel}
                      </p>
                      {sinceLabel ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {activeView === "followers" ? "Seguidor desde " : "Segue desde "}
                          {sinceLabel}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {isViewerConnection ? (
                      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                        Você
                      </span>
                    ) : (
                      <FollowButton
                        targetUserId={connection.userId}
                        initialIsFollowing={connection.isFollowedByViewer}
                        initialFollowerCount={0}
                        canInteract={Boolean(viewerId && viewerId !== connection.userId)}
                        loginRedirectTo={loginRedirectTo}
                        showFollowerCount={false}
                        appearance="light"
                        className="gap-0"
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
            {activeView === "followers"
              ? "Nenhum seguidor encontrado por aqui ainda."
              : "Este atleta ainda não está seguindo ninguém."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

