import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer
      className="
        text-white
        border-t border-white/10
        bg-[linear-gradient(to_bottom,var(--footer-bg-start),var(--footer-bg-end))]
      "
    >
      {/* bloco superior */}
      <div className="container grid gap-10 py-12 md:grid-cols-[1.2fr,1fr,auto]">
        {/* Marca + CTA */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo.svg"
              alt="Vitrine de Craques"
              width={48}
              height={48}
              priority
            />
            <div className="font-semibold italic leading-tight">
              Vitrine de Craques
            </div>
          </div>

          <p className="max-w-sm text-white/70">
            Descubra talentos do futebol • 14–22 anos
          </p>

          <Link
            href="https://wa.me/5511971668383"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex w-max items-center justify-center rounded-full
              bg-[#16A34A] px-6 py-3 text-sm font-semibold text-white
              shadow-sm ring-1 ring-black/5 transition
              hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#16A34A]
            "
          >
            Falar no WhatsApp
          </Link>
        </div>

        {/* Links rápidos */}
        <div>
          <h4 className="mb-4 font-bold italic">Links rápidos</h4>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/">Home</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/clubes">Clubes</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/feed">Feeds</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/noticias">Notícias</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/atletas">Atletas</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/games">Games</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/torcida">Torcida</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/confederacoes">Confederações</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/agentes">Agentes</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/sobre">Sobre</Link></li>
            <li><Link className="text-white/80 hover:text-white transition-colors" href="/privacidade">Privacidade</Link></li>
          </ul>
        </div>

        {/* Redes sociais */}
        <div>
          <h4 className="mb-4 font-bold italic">Nossas redes</h4>
          <div className="flex items-center gap-3">
            {/* Para cada rede, um “badge” circular com leve ring */}
            <Link
              href="https://www.instagram.com/vitrinedecraques/"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20 transition"
              aria-label="Instagram"
            >
              <Image src="/icons/icon-instagram.svg" alt="" width={18} height={18} />
            </Link>
            <Link
              href="https://www.tiktok.com/@vitrinedecraquesoficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20 transition"
              aria-label="TikTok"
            >
              <Image src="/icons/icon-tiktok.svg" alt="" width={18} height={18} />
            </Link>
            <Link
              href="https://www.youtube.com/@vitrinedecraques621"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20 transition"
              aria-label="YouTube"
            >
              <Image src="/icons/icon-youtube.svg" alt="" width={20} height={20} />
            </Link>
            <Link
              href="https://x.com/VCraques"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20 transition"
              aria-label="X"
            >
              <Image src="/icons/icon-x.svg" alt="" width={18} height={18} />
            </Link>
            <Link
              href="https://www.facebook.com/profile.php?id=100069873766577"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20 transition"
              aria-label="Facebook"
            >
              <Image src="/icons/icon-facebook.svg" alt="" width={16} height={16} />
            </Link>
            <Link
              href="https://www.linkedin.com/in/vitrine-de-craques-oficial-284695181/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 hover:bg-white/20 transition"
              aria-label="LinkedIn"
            >
              <Image src="/icons/icon-linkedin.svg" alt="" width={18} height={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* linha divisória + copyright */}
      <div className="border-t border-white/10">
        <div className="container py-4 text-left text-xs text-white/60">
          © {new Date().getFullYear()} Vitrine de Craques. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
