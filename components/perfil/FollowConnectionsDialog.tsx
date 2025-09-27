"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type FollowConnectionProfile = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  roleLabel: string;
  since: string;
};

interface FollowConnectionsDialogProps {
  followers: FollowConnectionProfile[];
  following: FollowConnectionProfile[];
}

type ActiveView = "followers" | "following";

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function FollowConnectionsDialog({ followers, following }: FollowConnectionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("followers");
  const [followerList, setFollowerList] = useState(followers);
  const [followingList, setFollowingList] = useState(following);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      followers: followerList.length,
      following: followingList.length,
    }),
    [followerList.length, followingList.length],
  );

  const currentList = activeView === "followers" ? followerList : followingList;
  const dialogTitle = activeView === "followers" ? "Seguidores" : "Seguindo";

  function openDialog(view: ActiveView) {
    setActiveView(view);
    setOpen(true);
    setErrorMessage(null);
  }

  async function handleUnfollow(userId: string) {
    try {
      setPendingId(userId);
      setErrorMessage(null);
      const response = await fetch(`/api/follows/${userId}`, { method: "DELETE" });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const message =
          typeof result?.message === "string"
            ? result.message
            : "Não foi possível deixar de seguir este perfil.";
        setErrorMessage(message);
        return;
      }

      setFollowingList((previous) => previous.filter((item) => item.userId !== userId));
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao tentar deixar de seguir este perfil.");
    } finally {
      setPendingId(null);
    }
  }

  async function handleBlock(userId: string) {
    try {
      setPendingId(userId);
      setErrorMessage(null);
      const response = await fetch(`/api/blocks/${userId}`, { method: "POST" });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const message =
          typeof result?.message === "string"
            ? result.message
            : "Não foi possível bloquear este perfil.";
        setErrorMessage(message);
        return;
      }

      setFollowerList((previous) => previous.filter((item) => item.userId !== userId));
      setFollowingList((previous) => previous.filter((item) => item.userId !== userId));
    } catch (error) {
      console.error(error);
      setErrorMessage("Erro ao tentar bloquear este perfil.");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-300">
        <DialogTrigger asChild>
          <button
            type="button"
            onClick={() => openDialog("followers")}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100/70 px-4 py-2 font-medium text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-200/80 hover:text-slate-900 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/80"
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
            onClick={() => openDialog("following")}
            className="inline-flex items-center gap-2 rounded-full bg-slate-100/70 px-4 py-2 font-medium text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-200/80 hover:text-slate-900 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/80"
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
            Gerencie suas conexões e mantenha seu feed personalizado com quem realmente importa.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-full bg-slate-100/80 p-1 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveView("followers")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeView === "followers"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Seguidores ({numberFormatter.format(counts.followers)})
          </button>
          <button
            type="button"
            onClick={() => setActiveView("following")}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeView === "following"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            Seguindo ({numberFormatter.format(counts.following)})
          </button>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
            {errorMessage}
          </div>
        ) : null}

        {currentList.length > 0 ? (
          <ul className="grid gap-3">
            {currentList.map((connection) => {
              const displayDate = connection.since
                ? new Date(connection.since).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : null;

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
                    <div className="flex min-w-0 flex-col">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {connection.displayName}
                      </p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        {connection.roleLabel}
                      </p>
                      {displayDate ? (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {activeView === "followers" ? "Segue você desde " : "Você segue desde "}
                          {displayDate}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    {activeView === "following" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-slate-300 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                        disabled={pendingId === connection.userId}
                        onClick={() => handleUnfollow(connection.userId)}
                      >
                        {pendingId === connection.userId ? "Removendo..." : "Parar de seguir"}
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full transition hover:-translate-y-0.5"
                        disabled={pendingId === connection.userId}
                        onClick={() => handleBlock(connection.userId)}
                      >
                        {pendingId === connection.userId ? "Bloqueando..." : "Bloquear"}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400">
            {activeView === "followers"
              ? "Nenhum seguidor por aqui ainda. Divulgue seu perfil para atrair sua audiência."
              : "Você ainda não segue ninguém. Explore perfis e conecte-se com outros usuários."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
