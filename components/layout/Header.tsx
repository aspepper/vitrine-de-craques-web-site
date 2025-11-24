'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { LogOut, Menu, Moon, Sun, Upload, UserRound, X } from 'lucide-react'
import { usePathname } from 'next/navigation'

import { SafeImage } from '@/components/media/SafeMedia'
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
  { href: '/arquibancada', label: 'Arquibancada' },
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
  const isHome = pathname === '/'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [profile, setProfile] = useState<ProfileSummary | null>(null)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname, session])

  useEffect(() => {
    function handleAvatarUpdated(event: Event) {
      if (!('detail' in event)) return
      const detail = (event as CustomEvent<string>).detail
      setProfile((previous) =>
        previous
          ? {
              ...previous,
              avatarUrl: detail,
            }
          : previous,
      )
    }

    window.addEventListener('profile-avatar-updated', handleAvatarUpdated)
    return () => {
      window.removeEventListener('profile-avatar-updated', handleAvatarUpdated)
    }
  }, [])

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
  const isArquibancadaMember = session?.user?.role === 'TORCEDOR'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b backdrop-blur-xl transition-colors',
        isHome
          ? 'border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,255,255,0.88))] shadow-[0_18px_48px_-28px_rgba(15,23,42,0.45)]'
          : 'border-slate-200/80 bg-white/95 shadow-[0_18px_48px_-28px_rgba(15,23,42,0.25)]',
        isHome
          ? 'dark:border-slate-900/80 dark:bg-[linear-gradient(180deg,rgba(3,7,18,0.92),rgba(10,19,40,0.82))] dark:shadow-[0_28px_72px_-28px_rgba(2,6,23,0.85)]'
          : 'dark:border-slate-900/90 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(2,6,23,0.92))] dark:shadow-[0_32px_80px_-32px_rgba(0,0,0,0.75)]'
      )}
    >
      <nav className="container mx-auto flex h-14 items-center gap-4 md:h-16">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-14">
            <SafeImage
              src="/brand/logo.png"
              alt="Vitrine de Craques"
              fill
              priority
              sizes="3.5rem"
              className="object-contain transition dark:brightness-150 dark:invert"
            />
          </div>
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
                {!isArquibancadaMember ? (
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
                ) : null}
                <Link
                  href={profileHref}
                  className={cn(
                    'group inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-500 p-[2px] shadow-[0_16px_40px_-24px_rgba(14,165,233,0.7)] transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    'dark:from-emerald-500/70 dark:via-sky-500/70 dark:to-cyan-500/80 dark:shadow-[0_20px_52px_-26px_rgba(56,189,248,0.65)]'
                  )}
                  title="Perfil"
                  aria-label="Ir para o perfil"
                >
                  <Avatar className="h-full w-full rounded-full border-2 border-white/80 bg-white text-slate-700 shadow-[0_8px_22px_-18px_rgba(15,23,42,0.45)] transition group-hover:shadow-[0_10px_28px_-18px_rgba(14,165,233,0.55)] dark:border-slate-950/80 dark:bg-slate-950 dark:text-slate-100">
                    <AvatarImage src={profileImage ?? undefined} alt={profileName} />
                    <AvatarFallback className="bg-sky-500/15 text-sm font-medium uppercase tracking-wide text-sky-900 dark:bg-sky-500/20 dark:text-sky-100">
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
                  title="Cadastre-se"
                >
                  <Link href="/registrar-escolha-perfil">Cadastre-se</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {isMobileMenuOpen ? (
        <div className="lg:hidden">
          <div
            className="fixed inset-x-0 top-14 z-[60] border-t border-border/50 bg-background/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 md:top-16 dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          >
            <div className="container mx-auto flex max-h-[calc(100vh-3.5rem)] flex-col gap-4 overflow-y-auto px-4 py-4 md:max-h-[calc(100vh-4rem)]">
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
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-sky-400 to-cyan-500 p-[2px] shadow-[0_16px_40px_-24px_rgba(14,165,233,0.7)] dark:from-emerald-500/70 dark:via-sky-500/70 dark:to-cyan-500/80 dark:shadow-[0_20px_52px_-26px_rgba(56,189,248,0.65)]">
                      <Avatar className="h-full w-full rounded-full border-2 border-white/80 bg-white text-slate-700 shadow-[0_8px_22px_-18px_rgba(15,23,42,0.45)] dark:border-slate-950/80 dark:bg-slate-950 dark:text-slate-100">
                        <AvatarImage src={profileImage ?? undefined} alt={profileName} />
                        <AvatarFallback className="bg-sky-500/15 text-sm font-medium uppercase tracking-wide text-sky-900 dark:bg-sky-500/20 dark:text-sky-100">
                          <UserRound aria-hidden className="h-5 w-5" />
                          <span className="sr-only">{profileName}</span>
                        </AvatarFallback>
                      </Avatar>
                    </span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">{profileName}</span>
                      <span className="text-xs text-muted-foreground">Ver perfil</span>
                    </div>
                  </Link>
                  {!isArquibancadaMember ? (
                    <Button asChild className="w-full">
                      <Link href="/upload">Enviar vídeo</Link>
                    </Button>
                  ) : null}
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
                    <Link href="/registrar-escolha-perfil">Cadastre-se</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
