import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Baby,
  User,
  Newspaper,
  Building2,
  BadgeCheck,
  Users,
  LucideIcon,
} from "lucide-react"

type Profile = {
  slug: string
  title: string
  description: string
  cta: string
  icon: LucideIcon
  available: boolean
}

const profiles: Profile[] = [
  {
    slug: "responsavel",
    title: "Pai ou Responsável",
    description:
      "Cadastro de Conta Familiar para que atletas menores de idade possam usar a plataforma.",
    cta: "Continuar",
    icon: Baby,
    available: true,
  },
  {
    slug: "atleta-18",
    title: "Atleta 18+",
    description: "Para Atletas com 18 anos ou mais.",
    cta: "Continuar",
    icon: User,
    available: true,
  },
  {
    slug: "imprensa-jornalistablogueiro",
    title: "Imprensa",
    description: "Jornalistas/Blogueiros com conteúdo editorial.",
    cta: "Continuar",
    icon: Newspaper,
    available: true,
  },
  {
    slug: "clube",
    title: "Clube/Entidade",
    description: "Clubes e Escolas de Futebol com CNPJ.",
    cta: "Continuar",
    icon: Building2,
    available: true,
  },
  {
    slug: "de-agentes-licenciados",
    title: "Agente Licenciado",
    description: "Cadastro para intermediários licenciados pela CBF.",
    cta: "Continuar",
    icon: BadgeCheck,
    available: true,
  },
  {
    slug: "",
    title: "Fan (em breve)",
    description: "Para torcedores. Recurso em desenvolvimento...",
    cta: "Avise-me",
    icon: Users,
    available: false,
  },
]

export default function RegistrarEscolhaPerfilPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow py-12">
        <section className="mb-12 text-center">
          <h1 className="mb-2 text-3xl font-heading font-bold">
            Crie sua conta — Selecione seu perfil
          </h1>
          <p className="text-muted-foreground">
            Escolha abaixo para continuar o cadastro na plataforma.
          </p>
        </section>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {profiles.map(({ slug, title, description, cta, icon: Icon, available }) => (
            <Card key={title} className="flex h-full flex-col">
              <CardHeader className="flex flex-row items-center gap-4 pb-4">
                <Icon className="h-12 w-12 flex-shrink-0 text-primary" />
                <CardTitle className="text-xl">{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow text-sm text-muted-foreground">
                {description}
              </CardContent>
              <CardFooter>
                {available ? (
                  <Button asChild className="w-full">
                    <Link href={`/cadastro/${slug}`}>{cta}</Link>
                  </Button>
                ) : (
                  <Button className="w-full" variant="secondary" disabled>
                    {cta}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

