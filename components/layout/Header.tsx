"use client"

import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface shadow-soft">
      <nav className="container mx-auto flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          <Image src="/brand/logo.svg" alt="Vitrine de Craques" width={40} height={40} />
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/torcida" className="hover:text-primary">Torcida</Link>
          <Link href="/agentes" className="hover:text-primary">Agentes</Link>
          <Link href="/clubes" className="hover:text-primary">Clubes</Link>
          <Link href="/noticias" className="hover:text-primary">Notícias</Link>
          <Link href="/games" className="hover:text-primary">Games</Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Input type="search" placeholder="Buscar" className="w-48 md:w-64" />
          </div>
          {session ? (
            <>
              <Button asChild size="md" rounded="pill" className="px-6">
                <Link href="/upload">Upload</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? ""} />
                      <AvatarFallback>{session.user?.name?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
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
                <Link href="/cadastro">Cadastre-se</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
