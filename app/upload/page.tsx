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
      <main className="flex-grow container mx-auto p-4">
        <Card className="mx-auto mt-8 max-w-4xl border-none bg-white shadow-[0_30px_90px_-45px_rgba(15,23,42,0.6)]">
          <CardHeader>
            <CardTitle>Upload de Vídeo</CardTitle>
            <CardDescription>Compartilhe seu talento com o mundo.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
