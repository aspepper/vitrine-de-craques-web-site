import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UploadForm } from "./UploadForm";

export default async function UploadPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Upload de Vídeo</CardTitle>
            <CardDescription>Compartilhe seu talento com o mundo.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
