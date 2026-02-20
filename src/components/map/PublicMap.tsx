'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'
import ImageLightbox from '@/components/shared/ImageLightbox'

import { tenant } from '@/config/tenant'

// Custom Icons
const createIcon = (color: string) => L.divIcon({
    className: 'custom-pin',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
})

const problemIcon = createIcon('#ef4444') // Red-500
const goodIcon = createIcon('#22c55e') // Green-500
const resolvedIcon = createIcon('#71717a') // Zinc-500 (Gray)

interface Item {
    id: string
    title: string
    description: string | null
    latitude: number
    longitude: number
    category: { name: string; icon?: string | null } | null
    traffic_level: string
    evidence_url: string | null
    kind?: 'problem' | 'good'
    status: string
    resolved_at?: string | null
    resolution_note?: string | null
    is_general?: boolean
}

export default function PublicMap({ items }: { items: Item[] }) {
    // Default center
    const center: [number, number] = [tenant.mapCenter.lat, tenant.mapCenter.lng]
    const [filter, setFilter] = useState<'all' | 'problem' | 'good'>('all')
    const [showResolved, setShowResolved] = useState(true)

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
    const [lightboxAlt, setLightboxAlt] = useState<string>('')

    const filteredItems = items.filter(i => {
        // Exclude general reports regardless of coords
        if (i.is_general) return false

        const validCoords = Number.isFinite(i.latitude) && Number.isFinite(i.longitude)
        if (!validCoords) return false

        // Status Filter - Resolved items are hidden unless toggled ON
        if (i.status === 'resolved' && !showResolved) return false

        // Kind Filter logic
        if (filter === 'all') return true
        return (i.kind || 'problem') === filter
    })

    return (
        <div className="h-[calc(100vh-4rem)] w-full text-black relative">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>

                {/* Legend & Controls */}
                <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3 items-end">

                    {/* Filters */}
                    <div className="bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-lg border flex flex-col gap-2">
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex-1 ${filter === 'all' ? 'bg-white shadow text-black dark:bg-zinc-700 dark:text-white' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFilter('problem')}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex-1 ${filter === 'problem' ? 'bg-white shadow text-red-600 dark:bg-zinc-700 dark:text-red-400' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                            >
                                Problemas
                            </button>
                            <button
                                onClick={() => setFilter('good')}
                                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex-1 ${filter === 'good' ? 'bg-white shadow text-green-600 dark:bg-zinc-700 dark:text-green-400' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'}`}
                            >
                                Aciertos
                            </button>
                        </div>

                        <label className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded select-none">
                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mr-2">Mostrar Resueltos</span>
                            <div className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} className="sr-only peer" />
                                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </div>
                        </label>
                    </div>

                    {/* Legend Helper */}
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg shadow-lg border text-xs space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-zinc-600 dark:text-zinc-400">Problema</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-zinc-600 dark:text-zinc-400">Acierto</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                            <span className="text-zinc-600 dark:text-zinc-400">Resuelto</span>
                        </div>
                    </div>
                </div>

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredItems.map(item => {
                    let icon = problemIcon
                    if (item.status === 'resolved') icon = resolvedIcon
                    else if (item.kind === 'good') icon = goodIcon

                    // Ensure ID is valid
                    // @ts-ignore
                    const itemId = item.id || item.item_id

                    if (!itemId) return null

                    return (
                        <Marker key={itemId} position={[item.latitude, item.longitude]} icon={icon}>
                            <Popup>
                                <div className="min-w-[220px]">
                                    <h3 className="font-bold text-base mb-1 text-zinc-900">{item.title}</h3>

                                    <div className="flex flex-wrap gap-1 mb-2">
                                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 inline-block">
                                            {item.category?.name || 'General'}
                                        </span>
                                        {item.status === 'resolved' ? (
                                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 inline-block">
                                                Resuelto
                                            </span>
                                        ) : item.kind === 'good' ? (
                                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800 inline-block">
                                                Acierto
                                            </span>
                                        ) : (
                                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 inline-block">
                                                Problema
                                            </span>
                                        )}
                                    </div>

                                    {item.status === 'resolved' && (
                                        <div className="mb-2 p-2 bg-zinc-50 rounded text-xs border border-zinc-200">
                                            {item.resolved_at && (
                                                <div className="text-zinc-500 mb-0.5">
                                                    Resuelto el {new Date(item.resolved_at).toLocaleDateString()}
                                                </div>
                                            )}
                                            {item.resolution_note ? (
                                                <div className="text-zinc-700 italic">
                                                    "{item.resolution_note}"
                                                </div>
                                            ) : null}
                                        </div>
                                    )}

                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2 leading-snug">
                                        {item.description}
                                    </p>

                                    {item.evidence_url && (
                                        <div
                                            className="cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation() // Prevent map close on some implementations, safest to stop prop
                                                setLightboxSrc(item.evidence_url)
                                                setLightboxAlt(item.title)
                                                setLightboxOpen(true)
                                            }}
                                        >
                                            <img
                                                src={item.evidence_url}
                                                alt="Evidencia"
                                                className="w-full h-28 object-cover rounded mb-2 bg-gray-100 border"
                                            />
                                            <div className="text-[10px] text-zinc-400 text-center -mt-1 mb-2 italic">Click para ampliar</div>
                                        </div>
                                    )}

                                    {itemId ? (
                                        <Link
                                            href={`/item/${itemId}`}
                                            className="block text-center text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 py-2 rounded transition-colors"
                                        >
                                            Ver Detalle y Votar
                                        </Link>
                                    ) : (
                                        <span className="block text-center text-xs font-bold text-zinc-400 bg-zinc-100 py-2 rounded cursor-not-allowed">
                                            Reporte sin ID (Bug)
                                        </span>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    )
                })}
            </MapContainer>
            <ImageLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                src={lightboxSrc}
                alt={lightboxAlt}
            />
        </div>
    )
}
