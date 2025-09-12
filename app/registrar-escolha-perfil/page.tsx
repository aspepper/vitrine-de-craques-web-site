import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const perfis = [
  { slug: "torcedor", title: "Torcedor" },
  { slug: "atleta", title: "Atleta" },
  { slug: "agente", title: "Agente" },
];

export default function RegistrarEscolhaPerfilPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1 className="mb-6 text-2xl font-bold font-heading">Escolha seu Perfil</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {perfis.map((perfil) => (
            <Link key={perfil.slug} href={`/cadastro/${perfil.slug}`}>
              <Card className="hover:shadow-lg">
                <CardHeader>
                  <CardTitle>{perfil.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Registre-se como {perfil.title}.
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

