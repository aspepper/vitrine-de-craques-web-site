import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function SobrePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1 className="mb-4 text-3xl font-bold font-heading">Sobre</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Informações sobre o projeto Vitrine de Craques.
        </p>
      </main>
      <Footer />
    </div>
  );
}

