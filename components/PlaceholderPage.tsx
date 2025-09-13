export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow container mx-auto p-4">
                <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                    <h1>{title}</h1>
                </div>
            </main>
        </div>
    )
}
