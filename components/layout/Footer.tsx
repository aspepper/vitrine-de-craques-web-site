import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

export function Footer() {
  return (
    <footer className="border-t bg-surface">
      <div className="container grid gap-8 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <Image
            src="/brand/logo.svg"
            alt="Vitrine de Craques"
            width={48}
            height={48}
          />
          <p className="text-muted-foreground">
            Descubra talentos do futebol 10-23 anos.
          </p>
          <Button
            asChild
            className="text-success-foreground w-max bg-success hover:brightness-105"
          >
            <Link
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
            >
              Falar no WhatsApp
            </Link>
          </Button>
        </div>
        <div>
          <h4 className="mb-4 font-bold">Links rápidos</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/feed">Feed</Link>
            </li>
            <li>
              <Link href="/atletas">Atletas</Link>
            </li>
            <li>
              <Link href="/torcida">Torcida</Link>
            </li>
            <li>
              <Link href="/agentes">Agentes</Link>
            </li>
            <li>
              <Link href="/clubes">Clubes</Link>
            </li>
            <li>
              <Link href="/noticias">Notícias</Link>
            </li>
            <li>
              <Link href="/games">Games</Link>
            </li>
            <li>
              <Link href="/confederacoes">Confederações</Link>
            </li>
            <li>
              <Link href="/sobre">Sobre</Link>
            </li>
            <li>
              <Link href="/privacidade">Privacidade</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-bold">Nossas redes</h4>
          <div className="flex gap-4">
            <Link href="#">
              <Image
                src="/icons/icon-instagram.svg"
                alt="Instagram"
                width={24}
                height={24}
              />
            </Link>
            <Link href="#">
              <Image
                src="/icons/icon-youtube.svg"
                alt="YouTube"
                width={24}
                height={24}
              />
            </Link>
            <Link href="#">
              <Image src="/icons/icon-x.svg" alt="X" width={24} height={24} />
            </Link>
            <Link href="#">
              <Image
                src="/icons/icon-facebook.svg"
                alt="Facebook"
                width={24}
                height={24}
              />
            </Link>
            <Link href="#">
              <Image
                src="/icons/icon-tiktok.svg"
                alt="TikTok"
                width={24}
                height={24}
              />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container py-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Vitrine de Craques. Todos os
          direitos reservados.
        </div>
      </div>
    </footer>
  )
}
