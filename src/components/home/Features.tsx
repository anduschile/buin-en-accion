import Link from 'next/link'
import { Map, Siren, PlusCircle, ArrowRight } from 'lucide-react'

export function Features() {
    const features = [
        {
            icon: PlusCircle,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/20',
            title: 'Reportar',
            description: 'Sube descripción + ubicación (y foto si puedes). Ayuda a identificar problemas reales.',
            cta: 'Reportar ahora',
            href: '/reportar'
        },
        {
            icon: Map,
            color: 'text-green-600',
            bg: 'bg-green-100 dark:bg-green-900/20',
            title: 'Explorar',
            description: 'Mira en el mapa qué está pasando por barrio y categoría. Encuentra aciertos y problemas.',
            cta: 'Ver mapa',
            href: '/mapa'
        },
        {
            icon: Siren,
            color: 'text-red-600',
            bg: 'bg-red-100 dark:bg-red-900/20',
            title: 'Priorizar',
            description: 'Vota lo urgente para que suba en el Semáforo. Tu voz define qué se atiende primero.',
            cta: 'Ver semáforo',
            href: '/semaforo'
        }
    ]

    return (
        <section className="py-20 px-4 container mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Qué puedes hacer aquí?</h2>
                <div className="h-1 w-20 bg-blue-600 mx-auto rounded-full"></div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {features.map((feature, index) => (
                    <div key={index} className="group p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 text-xl group-hover:scale-110 transition-transform`}>
                            <feature.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">{feature.title}</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                            {feature.description}
                        </p>
                        <Link href={feature.href} className={`inline-flex items-center font-semibold ${feature.color} hover:underline`}>
                            {feature.cta} <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    )
}
