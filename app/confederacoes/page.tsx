import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { STADIUM_PLACEHOLDER } from '@/lib/images'
import Link from 'next/link'

interface Confederation {
  id: string
  name: string
  image: string
}

const confederations: Confederation[] = [
  { id: '1', name: 'Confederação 1', image: STADIUM_PLACEHOLDER },
  { id: '2', name: 'Confederação 2', image: STADIUM_PLACEHOLDER },
]

export default function ConfederacoesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1 className="mb-6 font-heading text-2xl font-bold">Confederações</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {confederations.map((confed) => (
            <Link key={confed.id} href={`/confederacoes/${confed.id}`}>
              <Card className="overflow-hidden hover:shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                    <Image
                      src={confed.image}
                      alt={confed.name}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg">{confed.name}</CardTitle>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
