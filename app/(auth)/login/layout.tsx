import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | Vitrine de Craques',
  description: 'Acesse sua conta na Vitrine de Craques.',
}

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
