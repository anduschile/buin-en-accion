
'use client'

import { useState, useEffect } from 'react'
import { createItem } from '@/lib/actions/items'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { compressImage } from '@/lib/utils/compress'

// Dynamic import for Leaflet map to avoid user issues
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
    const [compressing, setCompressing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Controlled state for draft
    const [lat, setLat] = useState<number | null>(null)
    const [lng, setLng] = useState<number | null>(null)
    const [kind, setKind] = useState('problem')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [isGeneral, setIsGeneral] = useState(false)

    // Load draft from session on mount (only if it exists from a previous error)
    // AND consume it (delete it) so it doesn't persist for next fresh load
    useEffect(() => {
        const saved = sessionStorage.getItem('natales_report_draft_v1')
        if (saved) {
            try {
                const data = JSON.parse(saved)
                // Restore headers
                if (data.isGeneral !== undefined) setIsGeneral(data.isGeneral)
                if (data.kind) setKind(data.kind)
                if (data.title) setTitle(data.title)
                if (data.description) setDescription(data.description)
                if (data.categoryId) setCategoryId(data.categoryId)
                // Restore location if available
                if (data.lat !== undefined) setLat(data.lat)
                if (data.lng !== undefined) setLng(data.lng)

                // CONSUME the draft so it doesn't stick around
                sessionStorage.removeItem('natales_report_draft_v1')
            } catch (e) {
                console.error('Failed to load draft', e)
            }
        }
    }, [])

    // NOTE: Auto-save useEffect REMOVED. We only save on error.

    function saveDraft() {
        const data = { lat, lng, kind, title, description, categoryId, isGeneral }
        sessionStorage.setItem('natales_report_draft_v1', JSON.stringify(data))
    }

    async function handleSubmit(formData: FormData) {
        // Validation: Location requirement
        if (!isGeneral && (lat === null || lng === null)) {
            setError('Debes seleccionar un punto en el mapa o marcar "Reporte general (sin ubicación)".')
            saveDraft() // Save draft on validation error
            setPending(false)
            return
        }

        setPending(true)
        setError(null)
        setCompressing(false)

        // Image processing
        const evidenceFile = formData.get('evidence') as File
        if (evidenceFile && evidenceFile.size > 0 && evidenceFile.name !== 'undefined') {
            const MAX_SIZE = 5 * 1024 * 1024
            if (evidenceFile.size > MAX_SIZE) {
                setError(`La imagen es demasiado pesada (${(evidenceFile.size / 1024 / 1024).toFixed(1)}MB). Máximo 5MB. Intenta reducirla.`)
                saveDraft()
                setPending(false)
                return
            }

            if (evidenceFile.size > 1.5 * 1024 * 1024) {
                setCompressing(true)
                try {
                    const compressed = await compressImage(evidenceFile)
                    formData.set('evidence', compressed)
                } catch (err) {
                    console.error('Compression failed:', err)
                    setError('No pudimos procesar la foto. Intenta con una más liviana.')
                    saveDraft()
                    setPending(false)
                    setCompressing(false)
                    return
                }
                setCompressing(false)
            }
        }

        // Append data
        if (lat !== null) formData.set('latitude', lat.toString())
        if (lng !== null) formData.set('longitude', lng.toString())
        formData.set('is_general', isGeneral ? 'true' : 'false')

        try {
            const result = await createItem(formData)

            if (result?.error) {
                console.error('Report submission error:', result.error)
                if (typeof result.error === 'string') {
                    setError(result.error)
                } else {
                    setError(Object.values(result.error).flat().join(', '))
                }
                saveDraft()
                setPending(false)
            } else {
                // Success! 
                // Clear any draft just in case (though we consumed it on load)
                sessionStorage.removeItem('natales_report_draft_v1')

                // Reset form state
                setTitle('')
                setDescription('')
                setCategoryId('')
                setLat(null)
                setLng(null)
                setIsGeneral(false)
                setKind('problem')
                // File input is uncontrolled but we can't easily clear it without ref or wrapper. 
                // But typically redirect happens or we can just leave it.
                // If createItem redirects, component unmounts.
                // If it doesn't redirect (e.g. using server action that returns to same page), we should reset.
                // The action `createItem` does `redirect('/gracias')`.
                // So state reset is mostly for if/when we don't redirect or if React preserves state?
                // Actually if it redirects, this code might not even run or unmount happens.
                // But good practice.
            }
        } catch (err) {
            console.error('Upload error:', err)
            setError('No pudimos subir el reporte. Puede ser que la foto sea muy pesada o tu conexión inestable.')
            saveDraft()
            setPending(false)
        }
    }

    function saveDraft() {
        const data = { lat, lng, kind, title, description, categoryId, isGeneral }
        sessionStorage.setItem('natales_report_draft_v1', JSON.stringify(data))
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">


            {/* Kind Selector */}
            <div>
                <label className="block text-sm font-medium mb-1">¿Qué quieres reportar?</label>
                <div className="flex gap-4">
                    <label className={`flex items-center gap-2 cursor-pointer border p-3 rounded-md w-full justify-center text-center ${kind === 'problem' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-zinc-50'}`}>
                        <input
                            type="radio"
                            name="kind"
                            value="problem"
                            checked={kind === 'problem'}
                            onChange={(e) => setKind(e.target.value)}
                            className="accent-blue-600"
                        />
                        <span className="font-medium">Un Problema</span>
                    </label>
                    <label className={`flex items-center gap-2 cursor-pointer border p-3 rounded-md w-full justify-center text-center ${kind === 'good' ? 'bg-green-50 border-green-500 ring-1 ring-green-500' : 'hover:bg-zinc-50'}`}>
                        <input
                            type="radio"
                            name="kind"
                            value="good"
                            checked={kind === 'good'}
                            onChange={(e) => setKind(e.target.value)}
                            className="accent-green-600"
                        />
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
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                    >
                        <option value="">Selecciona una categoría</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* General Report Toggle */}
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-md border border-zinc-200 dark:border-zinc-700">
                <input
                    type="checkbox"
                    id="isGeneral"
                    checked={isGeneral}
                    onChange={(e) => {
                        setIsGeneral(e.target.checked)
                        if (e.target.checked) {
                            setError(null) // Clear location error if any
                        }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isGeneral" className="text-sm font-medium cursor-pointer flex-1">
                    Reporte general (sin ubicación)
                    <span className="block text-xs text-zinc-500 font-normal">Úsalo si no hay un punto exacto en el mapa.</span>
                </label>
            </div>

            {/* Location */}
            <div className={isGeneral ? 'opacity-50 pointer-events-none grayscale' : ''}>
                <label className="block text-sm font-medium mb-1">
                    Ubicación {isGeneral ? '(Opcional/Desactivada)' : '(Toca en el mapa)'}
                </label>
                <LocationPicker
                    onLocationSelect={(lat, lng) => {
                        if (!isGeneral) {
                            setLat(lat)
                            setLng(lng)
                        }
                    }}
                />
                {!isGeneral && lat !== null && lng !== null && <p className="text-xs text-green-600 mt-1">Ubicación seleccionada: {lat.toFixed(4)}, {lng.toFixed(4)}</p>}
            </div>

            {/* Evidence */}
            <div>
                <label className="block text-sm font-medium mb-1">Evidencia (Foto)</label>
                <input
                    name="evidence"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                    className="w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                />
                <p className="text-xs text-zinc-500 mt-1">Máx 5MB. Recomendado &lt; 2MB.</p>
            </div>

            {/* Errors */}
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={pending || compressing}>
                {compressing ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando imagen...</>
                ) : pending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...</>
                ) : (
                    'Enviar Reporte'
                )}
            </Button>

        </form>
    )
}
