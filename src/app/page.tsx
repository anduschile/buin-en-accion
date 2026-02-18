
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Map, Siren, PlusCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-white to-blue-50 dark:from-zinc-950 dark:to-zinc-900">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300">
          Natales en Acción
        </h1>

        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-10">
          Una plataforma para reportar problemas y también destacar aciertos en Puerto Natales. Priorizamos juntos lo urgente y visibilizamos lo que funciona.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/reportar">
            <Button size="lg" className="h-14 px-8 text-lg gap-2">
              <PlusCircle className="h-5 w-5" />
              Reportar Problema
            </Button>
          </Link>
          <Link href="/mapa">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2">
              <Map className="h-5 w-5" />
              Ver Mapa
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 container mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <Map className="h-12 w-12 text-blue-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Mapa Interactivo</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              Visualiza baches, problemas de alumbrado y más en un mapa geolocalizado de Puerto Natales.
            </p>
            <Link href="/mapa" className="text-blue-600 font-medium hover:underline">
              Explorar mapa →
            </Link>
          </div>

          <div className="p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
            <Siren className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Semáforo de Prioridades</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              Vota por los problemas más urgentes. Las autoridades verán qué es lo que más preocupa a la comunidad.
            </p>
            <Link href="/semaforo" className="text-blue-600 font-medium hover:underline">
              Ver ranking →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Reporta</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Sube una foto, ubicación y descripción del problema.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Verifica</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Moderamos el reporte para asegurar que sea real y respetuoso.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Prioriza</h3>
              <p className="text-zinc-600 dark:text-zinc-400">La comunidad vota y las autoridades ven el mapa de calor.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Nuestra Metodología</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 border rounded-lg">
              <h3 className="font-bold mb-2">📷 Evidencia Real</h3>
              <p className="text-sm text-zinc-600">Todo reporte debe tener una foto actual del problema.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-bold mb-2">🚫 Sin Rostros</h3>
              <p className="text-sm text-zinc-600">Protegemos la privacidad. No subas fotos de personas o patentes.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="font-bold mb-2">🤝 Constructivo</h3>
              <p className="text-sm text-zinc-600">Buscamos soluciones, no conflictos. Lenguaje respetuoso siempre.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
