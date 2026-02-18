
import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'

interface Item {
    id: string
    title: string
    category_name: string
    created_at: string
    kind: string
}

export default function RecentReports({ items }: { items: Item[] }) {
    if (items.length === 0) return null

    return (
        <section className="py-20 bg-white dark:bg-zinc-950">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Últimos Reportes</h2>
                    <Link href="/mapa" className="text-blue-600 hover:underline flex items-center gap-1 text-sm font-medium">
                        Ver todos en el mapa <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <Link key={item.id} href={`/item/${item.id}`} className="group block">
                            <div className="h-full p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:shadow-md transition-shadow bg-zinc-50 dark:bg-zinc-900/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.kind === 'good'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {item.category_name}
                                    </span>
                                    <span className="text-xs text-zinc-400">
                                        {new Date(item.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                    <MapPin className="h-3 w-3" />
                                    Ver ubicación y detalles
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
