import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const perfis = [
  { slug: "torcedor", title: "Torcedor" },
  { slug: "atleta-18", title: "Atleta" },
  { slug: "responsavel", title: "Responsável" },
  { slug: "imprensa-jornalistablogueiro", title: "Imprensa" },
  { slug: "clube", title: "Clube" },
  { slug: "de-agentes-licenciados", title: "Agente Licenciado" },
  { slug: "de-documentos-necessarios-para-pais-e-responsaveis", title: "Documentos para Responsáveis" },
];

export default function RegistrarEscolhaPerfilPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1>Escolha seu Perfil</h1>
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

