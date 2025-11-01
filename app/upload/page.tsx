import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, HelpCircle, Upload } from "lucide-react";

import { authOptions } from "@/lib/auth";
import { NotificationBell } from "./sections/NotificationBell";
import { UploadForm } from "./UploadForm";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login?callbackUrl=/upload");
  }

  if (session.user.role === "TORCEDOR") {
    redirect("/arquibancada");
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-slate-100 pb-16 text-slate-900 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <header className="sticky top-16 z-10 border-b border-slate-200/70 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-slate-900/80">
        <div className="container flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/feed"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-white/20 dark:hover:text-white"
              title="Voltar para o feed"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enviar vídeo</p>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Selecione um vídeo vertical</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:text-white sm:inline-flex"
              title="Central de ajuda"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Abrir central de ajuda</span>
            </button>
            <NotificationBell hasPending title="Notificações" />
          </div>
        </div>
      </header>

      <main className="container flex min-h-[calc(100vh-8rem)] flex-col gap-8 px-4 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-[0_40px_120px_-40px_rgba(15,23,42,0.85)]">
          <div className="mb-6 flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-medium text-sky-600 dark:bg-sky-500/15 dark:text-sky-200">
              <Upload className="h-4 w-4" />
              Novo envio
            </div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Compartilhe um momento de até 10 segundos</h2>
            <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-300">
              Você pode gravar um novo vídeo ou escolher um arquivo vertical já salvo. Depois de selecionado, escolha os 10 segundos ideais e publique para toda a comunidade.
            </p>
          </div>

          <UploadForm />
        </section>
      </main>
    </div>
  );
}
