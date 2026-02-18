
'use client'

import { useState } from 'react'
import { createItem } from '@/lib/actions/items'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic import for Leaflet map to avoid SSR issues
const LocationPicker = dynamic(() => import('./LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center text-gray-400">Cargando mapa...</div>
})

interface Category {
    id: string
    name: string
    icon: string | null
}

export default function ReportForm({ categories }: { categories: Category[] }) {
    const [pending, setPending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lat, setLat] = useState<number | null>(null)
    const [lng, setLng] = useState<number | null>(null)

    async function handleSubmit(formData: FormData) {
        if (lat === null || lng === null) {
            setError('Por favor selecciona una ubicación en el mapa.')
            return
        }

        setPending(true)
        setError(null)

        // Append location
        formData.append('latitude', lat.toString())
        formData.append('longitude', lng.toString())

        const result = await createItem(formData)

        if (result?.error) {
            console.error('Report submission error:', result.error)
            if (typeof result.error === 'string') {
                setError(result.error)
            } else {
                // Flatten validation errors
                setError(Object.values(result.error).flat().join(', '))
            }
            setPending(false)
        }
        // If success, createItem redirects, so no need to stop pending
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">


            {/* Kind Selector */}
            <div>
                <label className="block text-sm font-medium mb-1">¿Qué quieres reportar?</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-md has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 w-full justify-center text-center">
                        <input type="radio" name="kind" value="problem" defaultChecked className="accent-blue-600" />
                        <span className="font-medium">Un Problema</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer border p-3 rounded-md has-[:checked]:bg-green-50 has-[:checked]:border-green-500 w-full justify-center text-center">
                        <input type="radio" name="kind" value="good" className="accent-green-600" />
                        <span className="font-medium">Un Acierto / Buena Noticia</span>
                    </label>
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                    name="title"
                    type="text"
                    required
                    minLength={5}
                    placeholder="Ej: Bache en calle Bulnes"
                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                    name="description"
                    required
                    minLength={10}
                    rows={3}
                    placeholder="Describe el problema con detalle..."
                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                />
            </div>


            {/* Category */}
            <div>
                <label className="block text-sm font-medium mb-1">Categoría</label>
                {categories.length === 0 ? (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md text-sm">
                        ⚠️ No hay categorías cargadas. Contacta al administrador.
                    </div>
                ) : (
                    <select
                        name="category_id"
                        required
                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                    >
                        <option value="">Selecciona una categoría</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Location */}
            <div>
                <label className="block text-sm font-medium mb-1">Ubicación (Toca en el mapa)</label>
                <LocationPicker onLocationSelect={(lat, lng) => { setLat(lat); setLng(lng) }} />
                {lat !== null && lng !== null && <p className="text-xs text-green-600 mt-1">Ubicación seleccionada: {lat.toFixed(4)}, {lng.toFixed(4)}</p>}
            </div>

            {/* Evidence */}
            <div>
                <label className="block text-sm font-medium mb-1">Evidencia (Foto)</label>
                <input
                    name="evidence"
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                />
            </div>

            {/* Errors */}
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={pending}>
                {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</> : 'Enviar Reporte'}
            </Button>

        </form>
    )
}
