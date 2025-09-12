import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db'
import { redirect } from 'next/navigation'

export default async function PerfilPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/login')
  }
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='container mx-auto flex-grow p-4'>
        {profile ? (
          <div>
            <h1 className='text-2xl font-bold mb-4'>Perfil</h1>
            <p className='mb-2'>Role: {profile.role}</p>
            <pre className='bg-slate-100 p-4 rounded'>{JSON.stringify(profile.data, null, 2)}</pre>
          </div>
        ) : (
          <p>Nenhum perfil cadastrado.</p>
        )}
      </main>
      <Footer />
    </div>
  )
}
