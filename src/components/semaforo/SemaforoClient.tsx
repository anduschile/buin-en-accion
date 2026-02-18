
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUp, MapPin, ThumbsUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { normalizeTrafficLevel } from '@/lib/utils'

interface SemaforoItem {
    id: string
    title: string
    description: string | null
    latitude: number
    longitude: number
    traffic_level: string
    vote_count: number
    category_name: string
    kind?: 'problem' | 'good'
}

export default function SemaforoClient({ items }: { items: SemaforoItem[] }) {
    const [tab, setTab] = useState<'problem' | 'good'>('problem')

    const filteredItems = items.filter(item => (item.kind || 'problem') === tab)

    const getTrafficColor = (level: string) => {
        const normalized = normalizeTrafficLevel(level)
        switch (normalized) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Semáforo Ciudadano</h1>
                    <p className="text-zinc-500">
                        {tab === 'problem'
                            ? 'Ranking de problemas según la prioridad de los vecinos.'
                            : 'Buenas noticias y aciertos celebrados por la comunidad.'}
                    </p>
                </div>
                <Link href="/reportar">
                    <Button>Reportar</Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                <button
                    onClick={() => setTab('problem')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === 'problem' ? 'border-blue-600 text-blue-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                >
                    Problemas
                </button>
                <button
                    onClick={() => setTab('good')}
                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === 'good' ? 'border-green-600 text-green-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'}`}
                >
                    Aciertos
                </button>
            </div>

            <div className="grid gap-4">
                {filteredItems.length === 0 ? (
                    <div className="p-8 text-center border rounded-lg bg-gray-50 dark:bg-zinc-900">
                        <p className="text-lg text-zinc-500">
                            {tab === 'problem' ? 'No hay reportes de problemas aún.' : 'No hay aciertos reportados aún.'}
                        </p>
                    </div>
                ) : (
                    filteredItems.map((item, index) => (
                        <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
                            {/* Rank & Traffic (Only for problems) */}
                            {tab === 'problem' && (
                                <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 md:w-16 md:border-r md:pr-4">
                                    <span className="text-2xl font-bold text-zinc-300 dark:text-zinc-700">#{index + 1}</span>
                                    <div className={`w-3 h-3 rounded-full ${getTrafficColor(item.traffic_level)}`} title={`Nivel tráfico: ${item.traffic_level}`} />
                                </div>
                            )}

                            {/* Icon for Aciertos */}
                            {tab === 'good' && (
                                <div className="flex md:flex-col items-center justify-between md:justify-center gap-2 md:w-16 md:border-r md:pr-4 text-green-500">
                                    <ThumbsUp className="h-8 w-8" />
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tab === 'good' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} dark:bg-blue-900 dark:text-blue-100`}>
                                        {item.category_name}
                                    </span>
                                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                    </span>
                                </div>
                                <Link href={`/item/${item.id}`} className="group">
                                    <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors mb-2">
                                        {item.title}
                                    </h3>
                                </Link>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2">
                                    {item.description}
                                </p>
                            </div>

                            {/* Votes Action */}
                            <div className="flex md:flex-col items-center justify-center md:border-l md:pl-4 gap-2">
                                <div className="flex flex-col items-center">
                                    <ArrowUp className={`h-6 w-6 ${tab === 'good' ? 'text-blue-500' : 'text-green-500'}`} />
                                    <span className="text-xl font-bold">{item.vote_count}</span>
                                    <span className="text-xs text-zinc-500">Votos</span>
                                </div>
                                <Link href={`/item/${item.id}`}>
                                    <Button variant="outline" size="sm">Ver</Button>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
