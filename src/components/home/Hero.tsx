import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusCircle, Map } from 'lucide-react'

export function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-gradient-to-b from-white to-blue-50 dark:from-zinc-950 dark:to-zinc-900 overflow-hidden">
            <div className="relative z-10 max-w-4xl mx-auto">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-6">
                    Participación Vecinal 2.0
                </span>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-300 drop-shadow-sm">
                    Natales en Acción
                </h1>

                <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Reporta problemas y también destaca aciertos en Puerto Natales. Todo con ubicación, evidencia y seguimiento.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                    <Link href="/reportar" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full h-14 px-8 text-lg gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow">
                            <PlusCircle className="h-5 w-5" />
                            Reportar ahora
                        </Button>
                    </Link>
                    <Link href="/mapa" className="w-full sm:w-auto">
                        <Button size="lg" variant="outline" className="w-full h-14 px-8 text-lg gap-2 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                            <Map className="h-5 w-5" />
                            Ver mapa
                        </Button>
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Sin contraseña: te enviamos un enlace al correo</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        <span>Moderación para evitar spam y mantener respeto</span>
                    </div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
        </section>
    )
}
