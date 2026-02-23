
'use client'

import { useState, useCallback, useEffect } from 'react'
import { createReport } from '@/lib/actions/reports'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react'
import { compressImage } from '@/lib/utils/compress'

const LocationPicker = dynamic(() => import('./LocationPicker'), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md flex items-center justify-center text-gray-400 text-sm">
            Cargando mapa...
        </div>
    ),
})

interface Category {
    id: string
    name: string
    slug: string
    icon: string
}

interface ReportWizardProps {
    categories: Category[]
    preSelectedCategory?: Category | null
}

const STEPS = ['¿Dónde?', '¿Qué pasó?']
const SECURITY_SLUGS = ['seguridad']

export default function ReportWizard({ categories, preSelectedCategory }: ReportWizardProps) {
    const [step, setStep] = useState(0)
    const [pending, setPending] = useState(false)
    const [compressing, setCompressing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        console.log('ReportWizard mounted - categoryId:', preSelectedCategory?.id)
    }, [preSelectedCategory])

    // Security disclaimer
    const [securityAcknowledged, setSecurityAcknowledged] = useState(
        !preSelectedCategory || !SECURITY_SLUGS.includes(preSelectedCategory.slug)
    )

    // Form state - CATEGORY IS FIXED HERE
    const categoryId = preSelectedCategory?.id || ''
    const [lat, setLat] = useState<number | null>(null)
    const [lng, setLng] = useState<number | null>(null)
    const [addressText, setAddressText] = useState('')
    const [description, setDescription] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)

    const selectedCategory = preSelectedCategory || categories.find(c => c.id === categoryId)

    const handleLocationSelect = useCallback((lat: number, lng: number) => {
        setLat(lat)
        setLng(lng)
        setError(null)
    }, [])

    // Step navigation validation
    function canProceedFromStep(s: number): boolean {
        if (s === 0) return !!lat && !!lng
        if (s === 1) return description.trim().length >= 10
        return true
    }

    function nextStep() {
        setError(null)
        if (step === 0 && (!lat || !lng)) {
            setError('Por favor selecciona una ubicación en el mapa.')
            return
        }
        if (step === 1 && description.trim().length < 10) {
            setError('La descripción debe tener al menos 10 caracteres.')
            return
        }
        setStep(s => Math.min(s + 1, STEPS.length - 1))
    }

    function prevStep() {
        setError(null)
        if (step === 0) {
            // Return to category selection (handled by page.tsx by removing ?cat)
            window.location.href = '/reportar'
            return
        }
        setStep(s => Math.max(s - 1, 0))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (description.trim().length < 10) {
            setError('La descripción debe tener al menos 10 caracteres.')
            return
        }

        setPending(true)
        setError(null)

        const formData = new FormData()
        formData.set('category_id', categoryId)
        formData.set('description', description)
        if (lat !== null) formData.set('lat', lat.toString())
        if (lng !== null) formData.set('lng', lng.toString())
        if (addressText) formData.set('address_text', addressText)

        // Handle evidence
        if (imageFile && imageFile.size > 0) {
            const MAX_SIZE = 5 * 1024 * 1024
            if (imageFile.size > MAX_SIZE) {
                setError(`La imagen pesa ${(imageFile.size / 1024 / 1024).toFixed(1)}MB. Máximo 5MB.`)
                setPending(false)
                return
            }
            if (imageFile.size > 1.5 * 1024 * 1024) {
                setCompressing(true)
                try {
                    const compressed = await compressImage(imageFile)
                    formData.set('evidence', compressed)
                } catch {
                    setError('No pudimos comprimir la foto. Prueba con una más liviana.')
                    setPending(false)
                    setCompressing(false)
                    return
                }
                setCompressing(false)
            } else {
                formData.set('evidence', imageFile)
            }
        }

        try {
            const result = await createReport(formData)
            if (result?.error) {
                setError(typeof result.error === 'string' ? result.error : 'Error enviando reporte.')
                setPending(false)
            }
            // On success, createReport redirects to /voucher?code=...
        } catch (err) {
            console.error(err)
            setError('Error de conexión. Intenta nuevamente.')
            setPending(false)
        }
    }

    // Security Disclaimer Gate
    if (!securityAcknowledged) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm p-6 md:p-8 max-w-xl mx-auto">
                <div className="flex items-center gap-3 mb-5">
                    <span className="text-4xl">🔒</span>
                    <h2 className="text-xl font-bold">Reporte de Seguridad</h2>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-2 mb-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-amber-800 font-semibold text-sm">
                            ¿Es una emergencia? Llama primero:
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        {[
                            { num: '133', label: 'Carabineros', emoji: '👮' },
                            { num: '131', label: 'SAMU', emoji: '🚑' },
                            { num: '132', label: 'Bomberos', emoji: '🚒' },
                        ].map(e => (
                            <a
                                key={e.num}
                                href={`tel:${e.num}`}
                                className="bg-white border border-amber-300 rounded-lg p-3 hover:bg-amber-50 transition-colors"
                            >
                                <div className="text-2xl mb-1">{e.emoji}</div>
                                <div className="font-bold text-amber-700">{e.num}</div>
                                <div className="text-xs text-zinc-500">{e.label}</div>
                            </a>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-zinc-500 mb-6">
                    Esta plataforma es para situaciones <strong>no urgentes</strong> de seguridad comunitaria
                    (ej: luminaria quemada en zona oscura, vandalismo sin heridos, etc.).
                    Los reportes son revisados por moderadores antes de publicarse.
                </p>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className="flex-1"
                    >
                        Volver
                    </Button>
                    <Button
                        onClick={() => setSecurityAcknowledged(true)}
                        className="flex-1"
                    >
                        Entendido, continuar
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden max-w-xl mx-auto">
            {/* Header with category */}
            {selectedCategory && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border-b px-6 py-4 flex items-center gap-3">
                    <span className="text-2xl">{selectedCategory.icon}</span>
                    <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Categoría</p>
                        <p className="font-semibold text-zinc-800 dark:text-zinc-100">{selectedCategory.name}</p>
                    </div>
                </div>
            )}

            {/* Stepper */}
            <div className="flex border-b">
                {STEPS.map((label, i) => (
                    <div
                        key={i}
                        className={`flex-1 py-3 text-center text-xs font-medium border-b-2 transition-colors ${i === step
                            ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                            : i < step
                                ? 'border-green-500 text-green-600 dark:text-green-400'
                                : 'border-transparent text-zinc-400'
                            }`}
                    >
                        {i < step ? <CheckCircle className="h-3 w-3 inline mr-1" /> : null}
                        {label}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

                {/* ——— STEP 0: Location ——— */}
                {step === 0 && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-800 dark:text-blue-200">
                            <strong>Instrucción:</strong> Marca un punto en el mapa o usa "Mi ubicación" para poder continuar.
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1 flex items-center justify-between">
                                ¿Dónde ocurre el problema?
                                {!lat && <span className="text-red-500 text-[10px] font-bold animate-pulse">Ubicación requerida</span>}
                            </label>
                            <LocationPicker onLocationSelect={handleLocationSelect} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Dirección o referencia
                                <span className="text-zinc-400 font-normal ml-1">(opcional)</span>
                            </label>
                            <input
                                type="text"
                                value={addressText}
                                onChange={e => setAddressText(e.target.value)}
                                placeholder="Ej: Frente al n° 340, entre calles..."
                                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                )}

                {/* ——— STEP 1: Description + Evidence ——— */}
                {step === 1 && (
                    <div className="space-y-4">
                        {/* Community Rules */}
                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                            <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">📋 Normas de la plataforma:</p>
                            <ul className="space-y-0.5 list-disc list-inside">
                                <li>Describe el problema, no a personas</li>
                                <li>Sin insultos, política ni acusaciones personales</li>
                                <li>Información falsa o malintencionada será rechazada</li>
                            </ul>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Describe el problema *
                            </label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                minLength={10}
                                required
                                placeholder="Ej: Hay acumulación de basura en la esquina hace 3 días. Los contenedores están desbordados..."
                                className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <p className="text-xs text-zinc-400 mt-1">{description.length}/10 mínimo</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1">
                                Foto de evidencia
                                <span className="text-zinc-400 font-normal ml-1">(opcional, máx 5MB)</span>
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                                onChange={e => setImageFile(e.target.files?.[0] || null)}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                            />
                            {imageFile && (
                                <p className="text-xs text-green-600 mt-1">
                                    ✓ {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(1)}MB)
                                </p>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 text-sm space-y-2 bg-zinc-50 dark:bg-zinc-800/50">
                            <p className="font-semibold text-zinc-700 dark:text-zinc-200">Resumen del reporte</p>
                            {selectedCategory && (
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    <span className="font-medium">Categoría:</span> {selectedCategory.icon} {selectedCategory.name}
                                </p>
                            )}
                            {(lat && lng) && (
                                <p className="text-zinc-600 dark:text-zinc-400">
                                    <span className="font-medium">Ubicación:</span> {lat.toFixed(4)}, {lng.toFixed(4)}
                                </p>
                            )}
                            <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                                <span className="font-medium">Importante:</span> Podrás agregar tus datos de contacto (opcional) después, en el voucher de seguimiento.
                            </p>
                        </div>
                    </div>
                )}



                {/* Error display */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Navigation buttons */}
                <div className="flex gap-3 pt-2">
                    {step > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            disabled={pending}
                            className="flex items-center gap-1"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Anterior
                        </Button>
                    )}

                    {step < STEPS.length - 1 ? (
                        <Button
                            type="button"
                            onClick={nextStep}
                            disabled={!canProceedFromStep(step)}
                            className="flex-1 flex items-center justify-center gap-1"
                        >
                            Siguiente
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={pending || compressing}
                            className="flex-1"
                        >
                            {compressing ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Procesando foto...</>
                            ) : pending ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</>
                            ) : (
                                '✅ Enviar Reporte'
                            )}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    )
}
