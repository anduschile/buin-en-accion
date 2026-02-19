
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })


export const metadata: Metadata = {
  title: 'Natales en Acción',
  description: 'Plataforma ciudadana de Puerto Natales para reportar problemas y destacar aciertos. Priorizamos lo urgente y visibilizamos lo bueno.',
  metadataBase: new URL("https://natalesenaccion.anduschile.com"),
  openGraph: {
    title: 'Natales en Acción',
    description: 'Reporta problemas • Destaca aciertos • Priorizamos lo urgente',
    url: 'https://natalesenaccion.anduschile.com',
    siteName: 'Natales en Acción',
    locale: 'es_CL',
    type: 'website',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Natales en Acción - Reporta problemas y destaca aciertos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Natales en Acción',
    description: 'Plataforma ciudadana de Puerto Natales. Reporta problemas y destaca aciertos.',
    images: ['/og.jpg'],
  },
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
