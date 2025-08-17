import UploadDropzone from "@/components/UploadDropzone";

export const metadata = {
  title: "Upload de Vídeo | Vitrine de Craques",
};

export default function UploadPage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Upload de Vídeo</h1>
        <p className="mt-2 text-lg text-muted-foreground">Mostre seu talento para o mundo. Envie um vídeo de até 10 segundos.</p>
      </div>
      <UploadDropzone />
    </div>
  );
}
