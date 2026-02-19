
import { Hero } from '@/components/home/Hero'
import { Features } from '@/components/home/Features'
import { HowItWorks } from '@/components/home/HowItWorks'
import { StatusExplainer } from '@/components/home/StatusExplainer'
import { Rules } from '@/components/home/Rules'
import { Examples } from '@/components/home/Examples'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <Hero />
      <Features />
      <HowItWorks />
      <StatusExplainer />
      <Rules />
      <Examples />

      {/* Final CTA */}
      <section className="py-24 bg-zinc-900 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para participar?</h2>
          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Ayúdanos a cuidar y mejorar Puerto Natales. Solo toma unos minutos.
          </p>
          <Link href="/reportar">
            <Button size="lg" className="h-14 px-10 text-lg bg-blue-600 hover:bg-blue-500 text-white border-0">
              Comenzar reporte
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
