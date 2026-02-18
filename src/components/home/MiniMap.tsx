
'use client'

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
    latitude: number
    longitude: number
    kind?: 'problem' | 'good'
}

export default function MiniMap({ items }: { items: Item[] }) {
    // Default center (Puerto Natales)
    const center: [number, number] = [-51.7288, -72.5056]

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-0">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {items.map(item => (
                    <Marker key={item.id} position={[item.latitude, item.longitude]} icon={icon}>
                        <Popup>
                            <div className="text-sm font-medium">
                                {item.title}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay Link */}
            <Link
                href="/mapa"
                className="absolute bottom-4 right-4 z-[400] bg-white/90 backdrop-blur text-blue-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:bg-blue-50 transition-colors"
            >
                Ver mapa completo →
            </Link>
        </div>
    )
}
