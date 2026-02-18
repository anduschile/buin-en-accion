'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

// Fix for default marker icon
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
})

interface Item {
    id: string
    title: string
    description: string | null
    latitude: number
    longitude: number
    category: { name: string; icon?: string | null } | null
    traffic_level: string
    evidence_url: string | null
    kind?: 'problem' | 'good' // Added kind property
}

export default function PublicMap({ items }: { items: Item[] }) {
    // Default center
    const center: [number, number] = [-51.7288, -72.5056]
    const [filter, setFilter] = useState<'all' | 'problem' | 'good'>('all')

    const filteredItems = items.filter(i => {
        const validCoords = Number.isFinite(i.latitude) && Number.isFinite(i.longitude)
        if (!validCoords) return false
        if (filter === 'all') return true
        return (i.kind || 'problem') === filter
    })

    return (
        <div className="h-[calc(100vh-4rem)] w-full text-black relative">
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>

                {/* Legend */}
                <div className="absolute bottom-6 right-6 z-[1000] bg-white dark:bg-zinc-900 p-4 rounded-lg shadow-lg border text-sm">
                    <h4 className="font-bold mb-2">Prioridad (Tráfico)</h4>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span>Alta / Crítica</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span>Media</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span>Baja / Normal</span>
                        </div>
                    </div>
                </div>

                {/* Filter Control */}
                <div className="absolute top-6 right-6 z-[1000] bg-white dark:bg-zinc-900 p-2 rounded-lg shadow-lg border flex flex-col gap-2">
                    <button
                        onClick={() => setFilter('problem')}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${filter === 'problem' ? 'bg-blue-600 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                        Problemas
                    </button>
                    <button
                        onClick={() => setFilter('good')}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${filter === 'good' ? 'bg-green-600 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                        Aciertos
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${filter === 'all' ? 'bg-zinc-600 text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                    >
                        Todos
                    </button>
                </div>

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {filteredItems.map(item => (
                    <Marker key={item.id} position={[item.latitude, item.longitude]} icon={icon}>
                        <Popup>
                            <div className="min-w-[200px]">
                                <h3 className="font-bold text-base mb-1">{item.title}</h3>
                                <div className="flex gap-1 mb-2">
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 inline-block">
                                        {item.category?.name || 'General'}
                                    </span>
                                    {(item.kind === 'good') && (
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-green-100 text-green-800 inline-block">
                                            Acierto
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>

                                {item.evidence_url && (
                                    <img
                                        src={item.evidence_url}
                                        alt="Evidencia"
                                        className="w-full h-32 object-cover rounded mb-2 bg-gray-100"
                                    />
                                )}

                                <Link href={`/item/${item.id}`} className="block text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 py-1.5 rounded transition-colors">
                                    Ver Detalle y Votar
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    )
}
