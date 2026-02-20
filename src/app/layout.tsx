
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'

const inter = Inter({ subsets: ['latin'] })


import { tenant } from '@/config/tenant'

export const metadata: Metadata = {
  title: tenant.appName,
  description: tenant.appDescription,
  metadataBase: new URL(`https://${tenant.domainProd}`),
  openGraph: {
    title: tenant.appName,
    description: tenant.appDescription,
    url: `https://${tenant.domainProd}`,
    siteName: tenant.appName,
    locale: tenant.locale,
    type: 'website',
    images: [
      {
        url: '/og-buin.jpg',
        width: 1200,
        height: 630,
        alt: `${tenant.appName} - ${tenant.appDescription}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: tenant.appName,
    description: tenant.appDescription,
    images: ['/og-buin.jpg'],
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
