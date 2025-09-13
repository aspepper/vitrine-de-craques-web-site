'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Upload, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="fixed left-0 right-0 top-0 z-50 bg-surface shadow-soft">
      <nav className="container mx-auto flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/brand/logo.svg"
            alt="Vitrine de Craques"
            width={40}
            height={40}
          />
        </Link>
        <div className="hidden items-center gap-6 lg:flex">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <Link href="/feed" className="hover:text-primary">
            Feed
          </Link>
          <Link href="/atletas" className="hover:text-primary">
            Atletas
          </Link>
          <Link href="/torcida" className="hover:text-primary">
            Torcida
          </Link>
          <Link href="/agentes" className="hover:text-primary">
            Agentes
          </Link>
          <Link href="/clubes" className="hover:text-primary">
            Clubes
          </Link>
          <Link href="/noticias" className="hover:text-primary">
            Notícias
          </Link>
          <Link href="/games" className="hover:text-primary">
            Games
          </Link>
          <Link href="/confederacoes" className="hover:text-primary">
            Confederações
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Input
              type="search"
              placeholder="Buscar..."
              className="w-48 md:w-64"
            />
          </div>
          {session ? (
            <>
              <Button
                asChild
                size="icon"
                className="text-success-foreground bg-success hover:brightness-105"
              >
                <Link href="/upload">
                  <Upload className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                size="md"
                rounded="pill"
                className="text-success-foreground bg-success px-6 hover:brightness-105"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="md" rounded="pill" className="px-6">
                <Link href="/cadastro">Registrar</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
