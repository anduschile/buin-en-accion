
export function HowItWorks() {
    const steps = [
        {
            num: '1',
            emoji: '📍',
            title: 'Elige y describe',
            desc: 'Selecciona la categoría del problema, marca su ubicación en el mapa y agrega una foto si quieres.',
        },
        {
            num: '2',
            emoji: '🎫',
            title: 'Recibe tu código',
            desc: 'Al enviar, obtienes un código único (ej: BUIN-2026-X4F9A2). Guárdalo para hacer seguimiento.',
        },
        {
            num: '3',
            emoji: '📊',
            title: 'Sigue el estado',
            desc: 'Entra a /r/[tu-código] en cualquier momento para ver si fue aprobado, derivado o resuelto.',
        },
    ]

    return (
        <section className="py-16 bg-white dark:bg-zinc-950 border-t">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2">¿Cómo funciona?</h2>
                    <p className="text-zinc-500 text-sm">Tres pasos simples, sin registrarse</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step) => (
                        <div key={step.num} className="text-center">
                            <div className="relative inline-flex">
                                <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-3xl mb-4 mx-auto">
                                    {step.emoji}
                                </div>
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                                    {step.num}
                                </span>
                            </div>
                            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mb-2">{step.title}</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
