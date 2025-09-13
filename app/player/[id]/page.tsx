export default function PlayerPage({ params }: { params: { id: string } }) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto p-4">
                <div className="bg-black aspect-video max-w-4xl mx-auto mt-8">
                    {/* Player de vídeo real iria aqui */}
                    <div className="w-full h-full flex items-center justify-center text-white">
                        Vídeo com ID: {params.id}
                    </div>
                </div>
                <div className="max-w-4xl mx-auto mt-4">
                    <h1>Título do Vídeo</h1>
                    <p className="text-muted-foreground mt-2">Descrição do vídeo aqui...</p>
                </div>
            </main>
        </div>
    )
}
