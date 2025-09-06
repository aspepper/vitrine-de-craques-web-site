import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto p-4">
                <div className="flex items-center justify-center h-96 border-2 border-dashed rounded-lg">
                    <h1 className="text-4xl font-bold font-heading">{title}</h1>
                </div>
            </main>
            <Footer />
        </div>
    )
}
