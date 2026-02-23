
'use client'

import { useState } from 'react'
import { adminUpdateReportStatus } from '@/lib/actions/reports'
import { CheckCircle, XCircle, Loader2, MapPin, User, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react'
import type { Database } from '@/lib/supabase/database.types'

import { getCategoryIcon } from '@/lib/constants/categories'

type Report = Database['public']['Tables']['buin_reports']['Row']
type Category = Pick<Database['public']['Tables']['buin_categories']['Row'], 'name' | 'slug'>

interface AdminReportCardProps {
    report: Report & { category: Category | null }
}

export default function AdminReportCard({ report }: AdminReportCardProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [note, setNote] = useState('')
    const [area, setArea] = useState('')
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showContact, setShowContact] = useState(false)

    async function handleAction(status: string) {
        setLoading(status)
        setError(null)

        // Basic validation for resolved
        if (status === 'resolved' && !evidenceFile) {
            setError('La foto de evidencia es obligatoria para resolver.')
            setLoading(null)
            return
        }

        // Basic validation for routed
        if (status === 'routed' && !area.trim()) {
            setError('Debes indicar el área responsable.')
            setLoading(null)
            return
        }

        const result = await adminUpdateReportStatus(
            report.id,
            status as any,
            note || undefined,
            area || undefined,
            evidenceFile
        )

        setLoading(null)
        if (result?.error) {
            setError(result.error)
        } else {
            setSuccess('Estado actualizado ✓')
        }
    }

    if (success) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border p-4 opacity-60">
                <p className="text-sm font-medium text-zinc-500">{success} · Código: <span className="font-mono">{report.code}</span></p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-amber-50 dark:bg-amber-900/10 border-b">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{getCategoryIcon(report.category?.slug)}</span>
                    <div>
                        <p className="font-semibold text-sm">{report.category?.name || 'Sin categoría'}</p>
                        <p className="font-mono text-xs text-zinc-400">{report.code}</p>
                    </div>
                </div>
                <p className="text-xs text-zinc-400">
                    {new Date(report.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>

            <div className="p-5 space-y-3">
                {/* Description */}
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">{report.description}</p>

                {/* Location */}
                {(report.lat || report.address_text) && (
                    <div className="flex items-start gap-1.5 text-xs text-zinc-500">
                        <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                            {report.address_text || `${report.lat?.toFixed(4)}, ${report.lng?.toFixed(4)}`}
                            {report.lat && (
                                <a
                                    href={`https://www.google.com/maps?q=${report.lat},${report.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-2 text-blue-500 hover:underline"
                                >
                                    Ver mapa ↗
                                </a>
                            )}
                        </span>
                    </div>
                )}

                {/* Evidence */}
                {report.evidence_urls && Array.isArray(report.evidence_urls) && report.evidence_urls.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        {(report.evidence_urls as string[]).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt="evidencia" className="h-20 w-20 object-cover rounded-lg border" />
                            </a>
                        ))}
                    </div>
                )}

                {/* Contact (collapsible) */}
                {(report.contact_name || report.contact_phone || report.contact_email) && (
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowContact(c => !c)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                            {showContact ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            Datos de contacto
                        </button>
                        {showContact && (
                            <div className="mt-2 space-y-1 text-xs text-zinc-500 pl-4 border-l-2 border-blue-200">
                                {report.contact_name && (
                                    <div className="flex items-center gap-1.5"><User className="h-3 w-3" />{report.contact_name}</div>
                                )}
                                {report.contact_phone && (
                                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{report.contact_phone}</div>
                                )}
                                {report.contact_email && (
                                    <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{report.contact_email}</div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Dynamic Fields based on targeted transitions */}
                {report.status === 'published' && (
                    <input
                        type="text"
                        value={area}
                        onChange={e => setArea(e.target.value)}
                        placeholder="Área responsable (ej. Aseo y Ornato) *"
                        className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                    />
                )}

                {report.status === 'in_progress' && (
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Evidencia de resolución *</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setEvidenceFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-zinc-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                )}

                <div>
                    <input
                        type="text"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        placeholder="Nota interna o respuesta al vecino (opcional)"
                        className="w-full px-3 py-1.5 text-sm border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                </div>

                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

                {/* Actions Machine */}
                <div className="flex gap-2 pt-1">
                    {report.status === 'pending' && (
                        <>
                            <ActionButton
                                label="Publicar"
                                status="published"
                                color="bg-green-600 hover:bg-green-700 text-white"
                                loading={loading === 'published'}
                                onClick={() => handleAction('published')}
                            />
                            <ActionButton
                                label="Rechazar"
                                status="rejected"
                                color="bg-red-50 text-red-700 border border-red-200"
                                loading={loading === 'rejected'}
                                onClick={() => handleAction('rejected')}
                            />
                        </>
                    )}

                    {report.status === 'published' && (
                        <ActionButton
                            label="Derivar reporte"
                            status="routed"
                            color="bg-purple-600 hover:bg-purple-700 text-white"
                            loading={loading === 'routed'}
                            onClick={() => handleAction('routed')}
                        />
                    )}

                    {report.status === 'routed' && (
                        <ActionButton
                            label="Marcar 'En ejecución'"
                            status="in_progress"
                            color="bg-indigo-600 hover:bg-indigo-700 text-white"
                            loading={loading === 'in_progress'}
                            onClick={() => handleAction('in_progress')}
                        />
                    )}

                    {report.status === 'in_progress' && (
                        <>
                            <ActionButton
                                label="Resolver reporte"
                                status="resolved"
                                color="bg-blue-600 hover:bg-blue-700 text-white"
                                loading={loading === 'resolved'}
                                onClick={() => handleAction('resolved')}
                            />
                            <ActionButton
                                label="Rechazar"
                                status="rejected"
                                color="bg-red-50 text-red-700"
                                loading={loading === 'rejected'}
                                onClick={() => handleAction('rejected')}
                            />
                        </>
                    )}

                    {/* View Tracking */}
                    <a
                        href={`/r/${report.code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center p-2 rounded-lg border text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                        <CheckCircle className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </div>
    )
}

function ActionButton({ label, status, color, loading, onClick }: any) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${color}`}
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {label}
        </button>
    )
}
