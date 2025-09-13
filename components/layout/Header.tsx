'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Upload, LogOut } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const active =
    href === '/'
      ? pathname === '/'
      : pathname.startsWith(href) && href !== '/'

  return (
    <Link
      href={href}
      className={cn(
        'text-[15px] font-medium text-foreground/80 transition-colors',
        'hover:text-foreground',
        active && 'text-foreground'
      )}
    >
      {children}
    </Link>
  )
}

export function Header() {
  const { data: session } = useSession()

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        // efeito vidro + sombra sutil + divisor
        'supports-[backdrop-filter]:bg-white/70 bg-white/95 backdrop-blur-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.25)]'
      )}
    >
      <nav className="container mx-auto flex h-16 md:h-20 items-center gap-4">
        {/* Logo + Marca */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt="Vitrine de Craques"
            width={64}
            height={64}
            priority
          />

        </Link>

        {/* Menu central (desktop) */}
        <div className="hidden lg:flex items-center gap-6 ml-4">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/feed">Feed</NavLink>
          <NavLink href="/atletas">Atletas</NavLink>
          <NavLink href="/torcida">Torcida</NavLink>
          <NavLink href="/agentes">Agentes</NavLink>
          <NavLink href="/clubes">Clubes</NavLink>
          <NavLink href="/noticias">Notícias</NavLink>
          <NavLink href="/games">Games</NavLink>
          <NavLink href="/confederacoes">Confederações</NavLink>
        </div>

        {/* Ações à direita */}
        <div className="ml-auto flex items-center gap-4">
          {/* Busca (desktop) */}
          <div className="hidden md:block">
            <Input
              type="search"
              placeholder="Buscar..."
              className={cn(
                'h-10 w-48 md:w-64 rounded-full',
                'border border-black/10 bg-white/70 shadow-inner',
                'placeholder:text-muted-foreground'
              )}
            />
          </div>

          {session ? (
            <>
              <Button
                asChild
                size="icon"
                className="rounded-full text-success-foreground bg-success hover:brightness-105"
                title="Enviar vídeo"
              >
                <Link href="/upload">
                  <Upload className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="rounded-full"
                title="Sair"
                onClick={() => signOut()}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                asChild
                className="h-10 rounded-full px-5 bg-primary text-white hover:bg-primary/90"
                title="Login"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="h-10 rounded-full px-5 bg-secondary text-white hover:bg-secondary/90"
                title="Registrar"
              >
                <Link href="/cadastro">Registrar</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
