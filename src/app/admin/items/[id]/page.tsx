
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { adminUpdateItemStatus, adminAddUpdate } from '@/lib/actions/admin'

import { TABLES } from '@/lib/tables'
import { tenant } from '@/config/tenant'

export default async function AdminItemEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    const { data: item } = await supabase
        .from(TABLES.items)
        .select(`
            *,
            category:${TABLES.categories}(id, name),
            updates:${TABLES.updates}(*),
            votes:${TABLES.votes}(count),
            user:${TABLES.profiles}(full_name, email)
        `)
        .eq('id', id)
        .single()

    if (!item) notFound()

    // Signed URL for evidence
    let evidence_url = null
    if (item.evidence_path) {
        const { data } = await supabase.storage
            .from(tenant.bucketEvidence)
            .createSignedUrl(item.evidence_path, 3600)
        evidence_url = data?.signedUrl || null
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/admin/pendientes" className="flex items-center text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver a Pendientes
                </Link>
                <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
                        ${item.status === 'published' ? 'bg-green-100 text-green-800' :
                            item.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                item.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                    </span>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
                        <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
                        <p className="text-zinc-600 whitespace-pre-wrap">{item.description}</p>

                        <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-500">
                            <span className="bg-zinc-100 px-2 py-1 rounded">Category: {item.category?.name}</span>
                            <span className="bg-zinc-100 px-2 py-1 rounded">Lat: {item.latitude.toFixed(5)}</span>
                            <span className="bg-zinc-100 px-2 py-1 rounded">Lng: {item.longitude.toFixed(5)}</span>
                        </div>
                    </div>

                    {evidence_url && (
                        <div className="rounded-lg overflow-hidden border">
                            <img src={evidence_url} alt="Evidencia" className="w-full h-auto object-cover" />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm space-y-4">
                        <h3 className="font-semibold text-lg">Acciones Rápidas</h3>

                        <div className="grid grid-cols-2 gap-2">
                            <form action={async () => {
                                'use server'
                                await adminUpdateItemStatus(id, 'published', 'low')
                            }}>
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Publicar (Verde)</Button>
                            </form>
                            <form action={async () => {
                                'use server'
                                await adminUpdateItemStatus(id, 'published', 'medium')
                            }}>
                                <Button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-700">Publicar (Amarillo)</Button>
                            </form>
                            <form action={async () => {
                                'use server'
                                await adminUpdateItemStatus(id, 'published', 'high')
                            }}>
                                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">Publicar (Rojo)</Button>
                            </form>
                            <form action={async () => {
                                'use server'
                                await adminUpdateItemStatus(id, 'pending')
                            }}>
                                <Button type="submit" variant="outline" className="w-full border-dashed">Volver a Pendiente</Button>
                            </form>
                            <form action={async () => {
                                'use server'
                                await adminUpdateItemStatus(id, 'rejected')
                            }} className="col-span-2">
                                <Button type="submit" variant="destructive" className="w-full">Rechazar</Button>
                            </form>
                        </div>
                    </div>

                    {/* Resolution */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Resolver Reporte</h3>
                        <form action={async (formData) => {
                            'use server'
                            const note = formData.get('resolution_note') as string
                            await adminUpdateItemStatus(id, 'resolved', undefined, note)
                        }} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nota de Resolución (Opcional)</label>
                                <textarea name="resolution_note" rows={2} className="w-full p-2 border rounded" placeholder="Ej: Se reparó el bache..." />
                            </div>
                            <Button type="submit" className="w-full bg-zinc-600 hover:bg-zinc-700">Marcar como Resuelto</Button>
                        </form>
                    </div>

                    {/* Updates */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm">
                        <h3 className="font-semibold text-lg mb-4">Agregar Actualización</h3>
                        <form action={async (formData) => {
                            'use server'
                            await adminAddUpdate(item.id, formData)
                        }} className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Contenido</label>
                                <textarea name="content" required rows={3} className="w-full p-2 border rounded" placeholder="Información oficial..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fuente URL (Opcional)</label>
                                <input name="source_url" type="url" className="w-full p-2 border rounded" placeholder="https://..." />
                            </div>
                            <Button type="submit" className="w-full">Guardar Actualización</Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
