import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Supondo que este componente exista

export default function UploadPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4">
        <Card className="max-w-4xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-3xl font-heading">Upload de Vídeo</CardTitle>
            <CardDescription>Compartilhe seu talento com o mundo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do vídeo</Label>
              <Input id="title" placeholder="Ex: Meu golaço no fim de semana" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" placeholder="Descreva sua jogada..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video-file">Arquivo do vídeo</Label>
              <Input id="video-file" type="file" accept="video/mp4" />
              <p className="text-sm text-muted-foreground">Envie um vídeo de até 30 segundos e 50MB.</p>
            </div>
            <div className="flex justify-end space-x-4">
                <Button variant="outline">Cancelar</Button>
                <Button>Fazer Upload</Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
// Nota: O componente Textarea precisa ser criado, similar ao Input.
