'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Menu, Moon, Sun, Upload, UserRound, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useTheme } from '@/components/theme/ThemeProvider'
import type { Role } from '@prisma/client'

type ProfileSummary = {
  id: string
  role: Role
  displayName: string | null
  avatarUrl: string | null
  user: {
    image: string | null
    name: string | null
  } | null
}

interface ProfileApiResponse {
  profile: ProfileSummary | null
}

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

function getProfileHref(): string {
  return '/perfil'
}

function ThemeToggleButton({ className }: { className?: string }) {
  const { toggleTheme, isDarkMode, isReady } = useTheme()

  const icon = isReady ? (isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Moon className="h-5 w-5" />
  const label = isDarkMode ? 'Alterar para tema claro' : 'Alterar para tema escuro'

  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-surface/80 text-foreground transition hover:bg-surface/90 focus:outline-none focus:ring-2 focus:ring-primary',
        !isReady && 'opacity-70',
        className
      )}
      onClick={toggleTheme}
      disabled={!isReady}
      aria-label={label}
      title={label}
    >
      <span className="sr-only">{label}</span>
      {icon}
    </button>
  )
}

export function Header() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileSummary | null>(null)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname, session])

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null)
      return
    }

    let isMounted = true
    const controller = new AbortController()

    async function loadProfile() {
      try {
        const response = await fetch('/api/profile', {
          method: 'GET',
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Falha ao buscar perfil: ${response.status}`)
        }

        const data = (await response.json()) as ProfileApiResponse

        if (!isMounted) return
        setProfile(data.profile ?? null)
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        console.error('Erro ao carregar perfil do usuário', error)
        if (isMounted) {
          setProfile(null)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [session?.user?.id])

  const profileHref = getProfileHref()
  const profileName =
    profile?.displayName ?? profile?.user?.name ?? session?.user?.name ?? 'Perfil'
  const profileImage =
    profile?.avatarUrl ?? profile?.user?.image ?? session?.user?.image ?? undefined

  return (
    <header
      className={cn(
        'sticky top-0 z-50',
        'supports-[backdrop-filter]:bg-background/75 bg-background/95 backdrop-blur-xl',
        'border-b border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]'
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
            className="inline-flex items-center justify-center rounded-full p-2 text-foreground transition hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-primary lg:hidden"
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

          <ThemeToggleButton />

          <div className="hidden md:block">
            <Input
              type="search"
              placeholder="Buscar..."
              className={cn(
                'h-10 w-48 rounded-full border border-border/60 bg-surface/80 shadow-inner placeholder:text-muted-foreground',
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
                <Link
                  href={profileHref}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/60 bg-surface text-foreground shadow-inner transition hover:bg-surface/90"
                  title="Perfil"
                  aria-label="Ir para o perfil"
                >
                  <Avatar className="h-9 w-9 border border-border/40 bg-surface">
                    <AvatarImage src={profileImage ?? undefined} alt={profileName} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserRound aria-hidden className="h-4 w-4" />
                      <span className="sr-only">{profileName}</span>
                    </AvatarFallback>
                  </Avatar>
                </Link>
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
        <div className="border-t border-border/50 bg-background shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)] lg:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-4 py-4">
            <Input
              type="search"
              placeholder="Buscar..."
              className="h-11 rounded-full border border-border/60 bg-surface/80 shadow-inner placeholder:text-muted-foreground"
            />
            <ThemeToggleButton className="self-start" />
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
            <div className="h-px bg-border/50" />
            {session ? (
              <div className="flex flex-col gap-3">
                <Link
                  href={profileHref}
                  className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface px-4 py-3 shadow-inner transition hover:bg-surface/90"
                >
                  <Avatar className="h-11 w-11 border border-border/40 bg-surface">
                    <AvatarImage src={profileImage ?? undefined} alt={profileName} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <UserRound aria-hidden className="h-5 w-5" />
                      <span className="sr-only">{profileName}</span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{profileName}</span>
                    <span className="text-xs text-muted-foreground">Ver perfil</span>
                  </div>
                </Link>
                <Button asChild className="w-full">
                  <Link href="/upload">Enviar vídeo</Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full border border-border/60 bg-surface"
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
