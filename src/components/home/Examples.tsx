import { ThumbsUp, AlertTriangle } from 'lucide-react'

export function Examples() {
    return (
        <section className="py-20 container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-10 text-center">Ejemplos de reportes</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Problem Example */}
                <div className="flex gap-4 p-4 border rounded-xl bg-white dark:bg-zinc-900 items-start">
                    <div className="bg-red-100 p-3 rounded-lg text-red-600 shrink-0">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Problema</span>
                        <h4 className="font-bold text-lg">Bache peligroso en calle Bulnes</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            "Hay un hoyo profundo que está rompiendo neumáticos. Adjunto foto."
                        </p>
                    </div>
                </div>

                {/* Good Example */}
                <div className="flex gap-4 p-4 border rounded-xl bg-white dark:bg-zinc-900 items-start">
                    <div className="bg-green-100 p-3 rounded-lg text-green-600 shrink-0">
                        <ThumbsUp className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Acierto</span>
                        <h4 className="font-bold text-lg">Nuevas luminarias en la Plaza</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            "Excelente iniciativa, ahora se ve mucho más seguro de noche. Gracias!"
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
