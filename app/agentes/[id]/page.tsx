import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Image from 'next/image'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export default async function AgenteDetalhePage({ params }: PageProps) {
  const profile = await prisma.profile.findUnique({ where: { id: params.id } })
  if (!profile || profile.role !== 'AGENTE') {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <div className="mx-auto max-w-3xl">
          {profile.avatarUrl && (
            <div className="relative mb-6 h-64 w-full overflow-hidden rounded-lg shadow">
              <Image
                src={profile.avatarUrl}
                alt={profile.displayName || 'Agente'}
                fill
                className="object-cover"
                loading="lazy"
              />
            </div>
          )}
          <h1 className="mb-4 font-heading text-3xl font-bold">
            {profile.displayName}
          </h1>
          {profile.bio && (
            <p className="mb-4 text-lg leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          )}
          {profile.data && (
            <pre className="rounded bg-slate-100 p-4">
              {JSON.stringify(profile.data, null, 2)}
            </pre>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
