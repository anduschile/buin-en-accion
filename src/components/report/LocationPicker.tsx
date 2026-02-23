
'use client'

import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { tenant } from '@/config/tenant'
import { MapPin, Loader2 } from 'lucide-react'

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

function LocationMarker({
    position,
    setPosition,
}: {
    position: [number, number] | null
    setPosition: (pos: [number, number]) => void
}) {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng])
        },
    })
    return position ? <Marker position={position} icon={icon} /> : null
}

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void
    initialLat?: number | null
    initialLng?: number | null
}

export default function LocationPicker({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat != null && initialLng != null ? [initialLat, initialLng] : null
    )
    const [geoLoading, setGeoLoading] = useState(false)
    const [geoError, setGeoError] = useState<string | null>(null)

    const center: [number, number] = position ?? [tenant.mapCenter.lat, tenant.mapCenter.lng]

    const handleSetPosition = useCallback(
        (pos: [number, number]) => {
            setPosition(pos)
            onLocationSelect(pos[0], pos[1])
        },
        [onLocationSelect]
    )

    function useMyLocation() {
        if (!navigator.geolocation) {
            setGeoError('Tu navegador no soporta geolocalización.')
            return
        }
        setGeoLoading(true)
        setGeoError(null)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude]
                handleSetPosition(coords)
                setGeoLoading(false)
            },
            (err) => {
                setGeoError('No se pudo obtener tu ubicación. Toca el mapa manualmente.')
                console.warn('Geolocation error:', err)
                setGeoLoading(false)
            },
            { timeout: 10000 }
        )
    }

    return (
        <div className="space-y-2">
            {/* Geolocation button */}
            <button
                type="button"
                onClick={useMyLocation}
                disabled={geoLoading}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-60 transition-colors"
            >
                {geoLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <MapPin className="h-4 w-4" />
                )}
                {geoLoading ? 'Obteniendo ubicación...' : '📍 Usar mi ubicación actual'}
            </button>

            {geoError && (
                <p className="text-xs text-amber-600">{geoError}</p>
            )}

            {/* Map */}
            <div className="h-[300px] w-full rounded-md overflow-hidden border z-0">
                <MapContainer center={center} zoom={tenant.defaultZoom} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={handleSetPosition} />
                </MapContainer>
            </div>

            {position && (
                <p className="text-xs text-green-600">
                    ✓ Ubicación seleccionada: {position[0].toFixed(5)}, {position[1].toFixed(5)}
                </p>
            )}
            {!position && (
                <p className="text-xs text-zinc-400">
                    Toca en el mapa para marcar el punto exacto del problema.
                </p>
            )}
        </div>
    )
}
