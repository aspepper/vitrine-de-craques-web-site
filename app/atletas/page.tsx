import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

interface Athlete {
  id: string;
  name: string;
  image: string;
}

const athletes: Athlete[] = [
  { id: "1", name: "Jogador 1", image: "/hero/stadium.svg" },
  { id: "2", name: "Jogador 2", image: "/hero/stadium.svg" },
  { id: "3", name: "Jogador 3", image: "/hero/stadium.svg" },
];

export default function AtletasPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <h1 className="mb-6 text-2xl font-bold font-heading">Atletas</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {athletes.map((athlete) => (
            <Link key={athlete.id} href={`/atletas/${athlete.id}`}>
              <Card className="overflow-hidden hover:shadow-lg">
                <CardHeader className="p-0">
                  <div className="relative h-40 w-full">
                    <Image src={athlete.image} alt={athlete.name} fill className="object-cover" />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg">{athlete.name}</CardTitle>
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

