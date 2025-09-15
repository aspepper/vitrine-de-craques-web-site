import ApiError from "@/components/ApiError";
import { logError } from "@/lib/error";
import { FeedClient, type FeedVideo } from "./FeedClient";

export default async function FeedPage() {
  let initialVideos: FeedVideo[] = [];
  let loadError = false;

  if (process.env.DATABASE_URL) {
    try {
      const { default: prisma } = await import("@/lib/db");
      initialVideos = await prisma.video.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
    } catch (error) {
      await logError(error, "AO CARREGAR FEED INICIAL", {
        scope: "FeedPage",
        databaseUrlConfigured: Boolean(process.env.DATABASE_URL),
      });
      loadError = true;
    }
  } else {
    loadError = true;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <main className="container mx-auto flex-grow space-y-6 p-4">
        {initialVideos.length > 0 ? (
          <FeedClient initialVideos={initialVideos} />
        ) : (
          <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 p-8 text-center text-sm text-muted-foreground">
            {loadError ? (
              <>
                <p className="font-medium text-foreground">Não foi possível carregar o feed.</p>
                <p className="mt-2 max-w-lg">Tente novamente em instantes enquanto verificamos a conexão com o banco de dados.</p>
              </>
            ) : (
              <p>Nenhum vídeo disponível no momento.</p>
            )}
          </div>
        )}
      </main>
      <ApiError />
    </div>
  );
}
