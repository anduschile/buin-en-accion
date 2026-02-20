
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUp, MapPin, ThumbsUp, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { normalizeTrafficLevel } from '@/lib/utils'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { getEvidencePublicUrl } from '@/lib/utils/evidence'

interface SemaforoItem {
    id: string
    title: string
    description: string | null
    latitude: number
    longitude: number
    traffic_level: string
    vote_count: number
    category_name: string
    evidence_path?: string | null
    kind?: 'problem' | 'good'
    is_general?: boolean
}

export default function SemaforoClient({ items }: { items: SemaforoItem[] }) {
    const [tab, setTab] = useState<'problem' | 'good'>('problem')

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
    const [lightboxAlt, setLightboxAlt] = useState<string>('')

    const filteredItems = items.filter(item => (item.kind || 'problem') === tab)

    const getTrafficColor = (level: string) => {
        const normalized = normalizeTrafficLevel(level)
        switch (normalized) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            default: return 'bg-green-500';
        }
    }

    const openLightbox = (path: string, alt: string) => {
        const url = getEvidencePublicUrl(path)
        if (url) {
            setLightboxSrc(url)
            setLightboxAlt(alt)
            setLightboxOpen(true)
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
                    filteredItems.map((item, index) => {
                        // @ts-ignore
                        const itemId = item.id || item.item_id
                        const hasEvidence = !!item.evidence_path

                        return (
                            <div key={itemId || index} className="flex flex-col md:flex-row gap-4 p-4 border rounded-xl bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow">
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
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${tab === 'good' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'} dark:bg-blue-900 dark:text-blue-100`}>
                                            {item.category_name}
                                        </span>
                                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                                            {item.is_general ? (
                                                <span className="bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border text-[10px] uppercase font-bold">
                                                    Sin ubicación
                                                </span>
                                            ) : (
                                                <>
                                                    <MapPin className="h-3 w-3" />
                                                    {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                                                </>
                                            )}
                                        </span>
                                        {hasEvidence && (
                                            <span className="text-xs text-zinc-500 flex items-center gap-1 ml-2 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full border">
                                                <ImageIcon className="h-3 w-3" />
                                                <span className="hidden sm:inline">Con foto</span>
                                            </span>
                                        )}
                                    </div>
                                    {itemId ? (
                                        <Link href={`/item/${itemId}`} className="group">
                                            <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors mb-2">
                                                {item.title}
                                            </h3>
                                        </Link>
                                    ) : (
                                        <h3 className="text-lg font-bold text-zinc-400 mb-2 cursor-not-allowed">
                                            {item.title} (Sin ID)
                                        </h3>
                                    )}
                                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2">
                                        {item.description}
                                    </p>

                                    {/* Mobile-only View Photo Button (if evidence) */}
                                    {hasEvidence && (
                                        <div className="mt-2 md:hidden">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs flex items-center gap-1"
                                                onClick={() => openLightbox(item.evidence_path!, item.title)}
                                            >
                                                <ImageIcon className="h-3 w-3" /> Ver foto
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Votes Action */}
                                <div className="flex md:flex-col items-center justify-center md:border-l md:pl-4 gap-2">
                                    <div className="flex flex-col items-center">
                                        <ArrowUp className={`h-6 w-6 ${tab === 'good' ? 'text-blue-500' : 'text-green-500'}`} />
                                        <span className="text-xl font-bold">{item.vote_count}</span>
                                        <span className="text-xs text-zinc-500">Votos</span>
                                    </div>
                                    <div className="flex flex-col gap-2 w-full">
                                        {itemId ? (
                                            <Link href={`/item/${itemId}`}>
                                                <Button variant="outline" size="sm" className="w-full">Ver</Button>
                                            </Link>
                                        ) : (
                                            <Button variant="outline" size="sm" disabled className="w-full">Ver</Button>
                                        )}

                                        {hasEvidence && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="hidden md:flex w-full h-8 text-xs text-zinc-500 hover:text-zinc-900"
                                                onClick={() => openLightbox(item.evidence_path!, item.title)}
                                                title="Ver evidencia"
                                            >
                                                <ImageIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <ImageLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                src={lightboxSrc}
                alt={lightboxAlt}
            />
        </div>
    )
}
