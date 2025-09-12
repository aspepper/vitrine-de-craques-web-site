import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacidadePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1 className="mb-4 text-3xl font-bold font-heading">Política de Privacidade</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Esta página descreve como tratamos seus dados pessoais.
        </p>
      </main>
      <Footer />
    </div>
  );
}

