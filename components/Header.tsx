"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "./ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

export function Header() {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let active = true
    let interval: ReturnType<typeof setInterval> | undefined

    async function loadUnreadMessages() {
      if (!session?.user?.id) return

      try {
        const response = await fetch("/api/messages/unread-count", {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Falha ao carregar mensagens")
        }

        const data = (await response.json()) as { count?: unknown }
        if (!active) return

        const count = typeof data.count === "number" ? data.count : 0
        setUnreadCount(count)
      } catch (error) {
        console.error(error)
        if (!active) return
      }
    }

    if (session?.user?.id) {
      loadUnreadMessages()
      interval = setInterval(loadUnreadMessages, 60_000)

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          loadUnreadMessages()
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange)

      return () => {
        active = false
        if (interval) {
          clearInterval(interval)
        }
        document.removeEventListener("visibilitychange", handleVisibilityChange)
      }
    }

    setUnreadCount(0)

    return () => {
      active = false
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [session?.user?.id])

  const hasUnreadMessages = unreadCount > 0
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount)

  return (
    <header className="shadow-sm">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-h2 font-bold font-heading">
          Vitrine de Craques
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/torcida" className="hover:text-primary">Torcida</Link>
          <Link href="/agentes" className="hover:text-primary">Agentes</Link>
          <Link href="/clubes" className="hover:text-primary">Clubes</Link>
          <Link href="/noticias" className="hover:text-primary">Notícias</Link>
          <Link href="/games" className="hover:text-primary">Games</Link>
        </div>
        <div className="flex items-center space-x-2">
          {session ? (
            <>
              <Button asChild size="md" rounded="pill" className="px-6">
                <Link href="/upload">Upload</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="relative rounded-full focus:outline-none"
                    aria-label="Abrir menu do usuário"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? ""} />
                      <AvatarFallback>{session.user?.name?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                    {hasUnreadMessages ? (
                      <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white shadow-sm">
                        {badgeLabel}
                      </span>
                    ) : null}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/perfil">Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/upload">Upload</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => signOut()}>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild size="md" rounded="pill" className="px-6">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="secondary" size="md" rounded="pill" className="px-6">
                <Link href="/registrar-escolha-perfil">Cadastre-se</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

