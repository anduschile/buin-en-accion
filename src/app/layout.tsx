
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'Natales en Acción',
  description: 'Plataforma ciudadana de Puerto Natales para reportar problemas y destacar aciertos. Priorizamos lo urgente y visibilizamos lo bueno.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-gray-50 dark:bg-zinc-950">
          {children}
        </main>
      </body>
    </html>
  )
}
