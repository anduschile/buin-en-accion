import { Camera, Heart, Ban } from 'lucide-react'

export function Rules() {
    return (
        <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold mb-12 text-center">Reglas simples para convivir</h2>
                <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm text-center">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Camera className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Evidencia real</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                            Fotos actuales y claras. Sin rostros, patentes ni datos privados.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Respeto ante todo</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                            Lenguaje constructivo. Sin insultos, ataques personales o spam.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border shadow-sm text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ban className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Precisión</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                            Ubicación exacta. Describe el problema objetivamente.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
