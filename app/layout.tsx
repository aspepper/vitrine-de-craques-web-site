import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { NextAuthProvider } from "@/components/providers/session-provider";
import { ReactQueryProvider } from "@/components/providers/query-provider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Vitrine de Craques - A sua plataforma de talentos do futebol",
  description: "Descubra e seja descoberto. A Vitrine de Craques conecta jovens atletas de 14 a 22 anos a agentes, olheiros e clubes de todo o mundo.",
  openGraph: {
    title: "Vitrine de Craques",
    description: "A plataforma definitiva para a nova geração de estrelas do futebol.",
    url: "https://vitrine-de-craques.com", // Replace with actual domain
    siteName: "Vitrine de Craques",
    images: [
      {
        url: "https://placehold.co/1200x630/16A34A/FFFFFF/png?text=Vitrine+de+Craques", // Replace with actual OG image
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0F10" },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          poppins.variable
        )}
      >
        <NextAuthProvider>
          <ReactQueryProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ReactQueryProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
