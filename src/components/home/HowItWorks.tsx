export function HowItWorks() {
    const steps = [
        {
            title: "Tú reportas",
            description: "Envías el reporte con una foto y ubicación precisa."
        },
        {
            title: "Verificamos",
            description: "Revisamos que cumpla las reglas de respeto y veracidad."
        },
        {
            title: "Publicamos",
            description: "Aparece en el mapa para que la comunidad lo vea y vote."
        },
        {
            title: "Actualizamos",
            description: "Marcamos 'Resuelto' cuando hay solución oficial."
        }
    ]

    return (
        <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200 dark:border-zinc-800">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Cómo funciona?</h2>
                    <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                        Un proceso transparente desde que detectas el problema hasta que se busca una solución.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto relative">
                    {/* Line connecting steps (Desktop) */}
                    <div className="hidden md:block absolute top-[2.5rem] left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-800 z-0"></div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 rounded-full bg-white dark:bg-zinc-900 border-4 border-blue-500 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-sm mb-6 relative">
                                    {index + 1}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
