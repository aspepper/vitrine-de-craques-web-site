import Link from 'next/link'
import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { authOptions } from '@/lib/auth'
import { ADMIN_ALLOWED_ROLES, isAdminRole } from '@/lib/admin-auth'

const navItems = [
  { href: '/administrator', label: 'Dashboard' },
  { href: '/administrator/users', label: 'Usuários' },
  { href: '/administrator/videos', label: 'Vídeos' },
  { href: '/administrator/clubes', label: 'Clubes' },
]

export default async function AdministratorLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || !isAdminRole(session.user.role)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:flex-row">
        <aside className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_32px_120px_-64px_rgba(15,23,42,0.95)] backdrop-blur lg:w-64">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300">Administração</p>
            <h1 className="text-2xl font-semibold text-white">Vitrine de Craques</h1>
            <p className="text-xs text-slate-400">Acesse os controles da plataforma.</p>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300">
            <p className="font-semibold text-white">Perfis com acesso</p>
            <ul className="list-disc space-y-1 pl-4">
              {ADMIN_ALLOWED_ROLES.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </div>
        </aside>

        <section className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_32px_120px_-64px_rgba(15,23,42,0.95)] backdrop-blur">
          {children}
        </section>
      </div>
    </div>
  )
}
