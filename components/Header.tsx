import Link from "next/link"
import { Button } from "./ui/button"

export function Header() {
  return (
    <header className="shadow-sm">
      <nav className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="text-2xl font-bold font-heading">
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
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/cadastro">Cadastre-se</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
