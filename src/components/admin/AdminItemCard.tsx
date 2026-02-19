
'use client'

import { useState } from 'react'
import { adminUpdateItemStatus, adminAddUpdate, publishItem, rejectItem } from '@/lib/actions/admin'
import { Button } from '@/components/ui/button'
import { Check, X, Megaphone } from 'lucide-react'
import Link from 'next/link'

interface AdminItemProps {
    id: string
    title: string
    description: string | null
    created_at: string
    status: string
    category: { name: string } | null
    evidence_path: string | null
}

export default function AdminItemCard({ item }: { item: AdminItemProps }) {
    const [loading, setLoading] = useState(false)
    const [showUpdateForm, setShowUpdateForm] = useState(false)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const evidenceUrl = item.evidence_path && supabaseUrl
        ? `${supabaseUrl}/storage/v1/object/public/natales_evidence/${item.evidence_path}`
        : null

    const handlePublish = async () => {
        if (!confirm('¿Publicar este reporte?')) return
        setLoading(true)
        await publishItem(item.id)
        setLoading(false)
    }

    const handleReject = async () => {
        if (!confirm('¿Rechazar este reporte?')) return
        setLoading(true)
        await rejectItem(item.id)
        setLoading(false)
    }

    const handleResolve = async () => {
        if (!confirm('¿Marcar como resuelto?')) return
        setLoading(true)
        await adminUpdateItemStatus(item.id, 'resolved')
        setLoading(false)
    }

    // @ts-ignore
    const itemId = item.id || item.item_id || item.natales_item_id

    if (!itemId) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                <span className="font-bold text-red-600">Error: Reporte sin ID válido</span>
                <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(item, null, 2)}</pre>
            </div>
        )

    }

    return (
        <div className="p-4 bg-white dark:bg-zinc-950 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    {evidenceUrl && (
                        <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden bg-gray-100 border relative group">
                            <img
                                src={evidenceUrl}
                                alt="Evidencia"
                                className="w-full h-full object-cover"
                            />
                            <a
                                href={evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity"
                            >
                                Ver
                            </a>
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                item.status === 'published' ? 'bg-green-100 text-green-800' :
                                    item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-blue-100 text-blue-800'
                                }`}>
                                {item.status.toUpperCase()}
                            </span>
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-zinc-100">
                                {item.category?.name || 'General'}
                            </span>
                            <span className="text-xs text-zinc-500">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{item.description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/admin/items/${itemId}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center">
                        Ver / Editar
                    </Link>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={handlePublish}
                    disabled={loading || item.status === 'published'}
                >
                    <Check className="h-4 w-4 mr-1" /> Publicar
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={handleReject}
                    disabled={loading || item.status === 'rejected'}
                >
                    <X className="h-4 w-4 mr-1" /> Rechazar
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={handleResolve}
                    disabled={loading || item.status === 'resolved'}
                >
                    <Check className="h-4 w-4 mr-1" /> Marcar Resuelto
                </Button>

                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowUpdateForm(!showUpdateForm)}
                >
                    <Megaphone className="h-4 w-4 mr-1" /> Agregar Actualización
                </Button>
            </div>

            {showUpdateForm && (
                <form action={async (formData) => {
                    await adminAddUpdate(itemId, formData);
                    setShowUpdateForm(false);
                }} className="mt-4 p-4 bg-gray-50 rounded border">
                    <label className="block text-sm font-medium mb-1">Texto de actualización</label>
                    <textarea name="content" required className="w-full border rounded p-2 mb-2" rows={2} />
                    <label className="block text-sm font-medium mb-1">Link fuente (opcional)</label>
                    <input name="source_url" type="url" className="w-full border rounded p-2 mb-2" placeholder="https://..." />
                    <Button type="submit" size="sm">Publicar</Button>
                </form>
            )}
        </div>
    )
}
