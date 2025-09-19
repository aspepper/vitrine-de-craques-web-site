'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Menu, Upload, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/feed', label: 'Feed' },
  { href: '/atletas', label: 'Atletas' },
  { href: '/torcida', label: 'Torcida' },
  { href: '/agentes', label: 'Agentes' },
  { href: '/clubes', label: 'Clubes' },
  { href: '/noticias', label: 'Notícias' },
  { href: '/games', label: 'Games' },
  { href: '/confederacoes', label: 'Confederações' },
]

function NavLink({
  href,
  children,
  currentPath,
}: {
  href: string
  children: ReactNode
  currentPath: string
}) {
  const active =
    href === '/'
      ? currentPath === '/'
      : currentPath.startsWith(href) && href !== '/'

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
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname, session])

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'supports-[backdrop-filter]:bg-white/70 bg-white/95 backdrop-blur-xl',
        'shadow-[0_8px_32px_rgba(0,0,0,0.25)]'
      )}
    >
      <nav className="container mx-auto flex h-14 items-center gap-4 md:h-16">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/logo.png"
            alt="Vitrine de Craques"
            width={56}
            height={56}
            priority
          />
        </Link>

        <div className="ml-4 hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} currentPath={pathname}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-2 text-foreground transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
            aria-label="Alternar menu de navegação"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((state) => !state)}
          >
            <span className="sr-only">Alternar menu de navegação</span>
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="hidden md:block">
            <Input
              type="search"
              placeholder="Buscar..."
              className={cn(
                'h-10 w-48 rounded-full border border-black/10 bg-white/70 shadow-inner placeholder:text-muted-foreground',
                'md:w-64'
              )}
            />
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            {session ? (
              <>
                <Button
                  asChild
                  size="icon"
                  className="rounded-full bg-success text-success-foreground hover:brightness-105"
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
                  <Link href="/registrar-escolha-perfil">Registrar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {isMobileMenuOpen ? (
        <div className="border-t border-black/10 bg-white shadow-lg lg:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <Input
              type="search"
              placeholder="Buscar..."
              className="h-11 rounded-full border border-black/10 bg-white/70 shadow-inner placeholder:text-muted-foreground"
            />
            <nav className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-base font-medium text-foreground/80 transition-colors',
                    'hover:text-foreground',
                    pathname.startsWith(item.href) && item.href !== '/' && 'text-foreground',
                    item.href === '/' && pathname === '/' && 'text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="h-px bg-black/10" />
            {session ? (
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/upload">Enviar vídeo</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full border border-black/10 bg-white"
                  onClick={() => signOut()}
                >
                  Sair
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="/registrar-escolha-perfil">Registrar</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}
