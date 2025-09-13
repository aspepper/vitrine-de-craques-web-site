"use client"

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
                <Link href="/registrar-escolha-perfil">Cadastre-se</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

