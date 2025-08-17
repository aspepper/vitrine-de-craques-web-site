"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Menu,
  Search,
  MessageCircle,
  Upload,
  Newspaper,
  User,
  Home,
  PlaySquare,
  Users,
  Briefcase,
  Shield,
  Gamepad2,
  Info,
  Lock,
  Trophy,
  Building,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feeds", label: "Feeds", icon: PlaySquare },
  { href: "/athletes", label: "Athletes", icon: Users },
  { href: "/fans", label: "Fans", icon: Users },
  { href: "/agents", label: "Agents", icon: Briefcase },
  { href: "/clubes", label: "Clubs", icon: Shield },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/games", label: "Games", icon: Gamepad2 },
  { href: "/confederations", label: "Confederations", icon: Trophy },
  { href: "/about", label: "About", icon: Info },
  { href: "/privacy", label: "Privacy", icon: Lock },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;
  // @ts-ignore
  const userRole = user?.role;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Building className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              Vitrine de Craques
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            {/* Desktop nav can be smaller */}
            <Link href="/feeds">Feeds</Link>
            <Link href="/athletes">Athletes</Link>
            <Link href="/clubes">Clubs</Link>
            <Link href="/news">News</Link>
          </nav>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
                <SheetDescription className="sr-only">
                  Links principais do site
                </SheetDescription>
              </SheetHeader>
              <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                <Building className="h-6 w-6 text-primary" />
                <span className="font-bold">Vitrine de Craques</span>
              </Link>
              <nav className="grid gap-4">
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
            {/* A proper search input would go here */}
          </div>
          <nav className="flex items-center gap-2">
            {status === "loading" ? (
              <div className="h-8 w-24 animate-pulse rounded-md bg-muted/50"></div>
            ) : user ? (
              <>
                { (userRole === 'ATHLETE' || userRole === 'GUARDIAN') && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/upload"><Upload className="h-5 w-5" /></Link>
                  </Button>
                )}
                { userRole === 'PRESS' && (
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/profile"><Newspaper className="h-5 w-5" /></Link>
                  </Button>
                )}
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-5 w-5" />
                </Button>
                <NotificationBell />
                <Link href="/profile">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
                    <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/api/auth/signin">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
