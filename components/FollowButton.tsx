"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const followersFormatter = new Intl.NumberFormat("pt-BR");

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  initialFollowerCount: number;
  canInteract: boolean;
  loginRedirectTo?: string;
  className?: string;
  showFollowerCount?: boolean;
  appearance?: "light" | "dark";
}

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  initialFollowerCount,
  canInteract,
  loginRedirectTo = "/login",
  className,
  showFollowerCount = true,
  appearance = "dark",
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { status } = useSession();
  const isDarkAppearance = appearance === "dark";
  const isAuthenticated = status === "authenticated";

  const handleClick = () => {
    if (!canInteract && !isAuthenticated) {
      router.push(loginRedirectTo);
      return;
    }

    startTransition(async () => {
      setErrorMessage(null);
      try {
        const method = isFollowing ? "DELETE" : "POST";
        const response = await fetch(`/api/follows/${targetUserId}`, {
          method,
          credentials: "include",
        });

        if (response.status === 401) {
          if (!isAuthenticated) {
            router.push(loginRedirectTo);
            return;
          }

          router.refresh();
          setErrorMessage("Não foi possível validar sua sessão. Tente novamente.");
          return;
        }

        if (!response.ok) {
          throw new Error("Falha ao atualizar seguidor");
        }

        const payload = (await response.json()) as {
          isFollowing: boolean;
          followerCount: number;
        };
        setIsFollowing(payload.isFollowing);
        setFollowerCount(payload.followerCount);
      } catch (error) {
        console.error(error);
        setErrorMessage("Não foi possível atualizar o seguidor agora.");
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        type="button"
        onClick={handleClick}
        disabled={pending || isFollowing}
        aria-pressed={isFollowing}
        className={cn(
          "min-w-[140px] rounded-full px-6 py-2 text-sm font-semibold transition",
          isFollowing
            ? isDarkAppearance
              ? "bg-white/15 text-white hover:bg-white/20"
              : "bg-slate-200 text-slate-900 hover:bg-slate-300"
            : "bg-emerald-500 text-white hover:bg-emerald-500/90",
        )}
      >
        {pending ? "Atualizando..." : isFollowing ? "Seguindo" : "Seguir"}
      </Button>
      {showFollowerCount ? (
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-[0.14em]",
            isDarkAppearance ? "text-white/70" : "text-slate-600",
          )}
        >
          {followersFormatter.format(followerCount)} seguidores
        </span>
      ) : null}
      {errorMessage ? (
        <span
          className={cn(
            "text-xs",
            isDarkAppearance ? "text-red-200" : "text-red-500",
          )}
        >
          {errorMessage}
        </span>
      ) : null}
    </div>
  );
}
