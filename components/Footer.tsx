import Link from "next/link";
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Building } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-surface border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Vitrine de Craques</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A sua plataforma de talentos do futebol. Conectando sonhos a oportunidades.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Youtube /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li><Link href="/athletes" className="text-sm text-muted-foreground hover:text-primary">Atletas</Link></li>
              <li><Link href="/clubes" className="text-sm text-muted-foreground hover:text-primary">Clubes</Link></li>
              <li><Link href="/agents" className="text-sm text-muted-foreground hover:text-primary">Agentes</Link></li>
              <li><Link href="/news" className="text-sm text-muted-foreground hover:text-primary">Notícias</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary">Sobre Nós</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Política de Privacidade</Link></li>
              <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Termos de Uso</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <address className="not-italic text-sm text-muted-foreground space-y-2">
              <p>Instituto Vitrine de Craques</p>
              <p>Rua Fictícia, 123, São Paulo - SP</p>
              <p>CEP 01234-567, Brasil</p>
              <p>Email: <a href="mailto:contato@vitrinedecraques.com" className="hover:text-primary">contato@vitrinedecraques.com</a></p>
            </address>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Vitrine de Craques. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
