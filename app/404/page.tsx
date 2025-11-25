import Image from 'next/image'
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-16 text-white">
      <div className="max-w-2xl space-y-8 text-center">
        <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72">
          <Image
            src="/mascotes-bola-murcha.png"
            alt="Ilustração dos mascotes tristes com uma bola murcha"
            fill
            sizes="(max-width: 640px) 16rem, 18rem"
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Erro 404
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Página não encontrada
          </h1>
          <p className="text-base text-slate-200 sm:text-lg">
            A página que você está procurando não existe ou foi removida.
            Verifique o endereço ou volte para a página inicial.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-emerald-500 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg transition hover:bg-emerald-400"
          >
            Voltar para a página inicial
          </Link>
        </div>
      </div>
    </section>
  )
}
