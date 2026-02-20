// src/app/item/[id]/page.tsx
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, AlertTriangle, CheckCircle2, ThumbsUp } from 'lucide-react'
import VoteButton from '@/components/item/VoteButton'
import ItemEvidenceView from '@/components/item/ItemEvidenceView'
import { Button } from '@/components/ui/button'
import { TABLES } from '@/lib/tables'
import { tenant } from '@/config/tenant'
import { Database } from '@/lib/supabase/database.types'

type ItemDetailProps = Database['public']['Tables']['buin_items']['Row'] & {
    category: Pick<Database['public']['Tables']['buin_categories']['Row'], 'id' | 'name' | 'slug'> | null
    votes: { count: number }[]
    resolution_note?: string | null
    resolved_at?: string | null
    published_at?: string | null
}

export const revalidate = 0

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // Definitive UUID Guard
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!id || !uuidRegex.test(id)) {
        console.error(`Invalid UUID accessed: ${id}`)
        return (
            <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold mb-3 text-red-600 dark:text-red-400">Enlace inválido</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                    El identificador del reporte no es válido.
                </p>
                <Link href="/mapa">
                    <Button size="lg">Volver al Mapa</Button>
                </Link>
            </div>
        )
    }

    // 1. Fetch item with category & votes using the specific requested query + resolution fields
    const { data: rawItem, error } = await supabase
        .from(TABLES.items)
        .select(`
            id,
            title,
            description,
            latitude,
            longitude,
            status,
            kind,
            traffic_level,
            created_at,
            published_at,
            resolved_at,
            resolution_note,
            evidence_path,
            category:${TABLES.categories}(id, name, slug),
            votes:${TABLES.votes}(count)
        `)
        .eq('id', id)
        .maybeSingle()

    const item = rawItem as unknown as ItemDetailProps

    // 2. Handle not found or RLS restriction gracefully
    if (error) {
        // Log real error for diagnosis but show friendly UI
        console.error('ITEM_QUERY_ERROR', { id, error })
    }

    if (error || !item) {
        return (
            <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="h-10 w-10 text-zinc-400" />
                </div>
                <h1 className="text-3xl font-bold mb-3 text-zinc-900 dark:text-zinc-100">Reporte no encontrado</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto">
                    Es posible que el reporte no exista, haya sido eliminado, o esté en proceso de moderación.
                </p>
                <Link href="/mapa">
                    <Button size="lg">Volver al Mapa</Button>
                </Link>
            </div>
        )
    }

    // 3. Get signed URL for evidence if exists
    let evidenceUrl = null
    if (item.evidence_path) {
        const { data } = await supabase.storage
            .from(tenant.bucketEvidence)
            .getPublicUrl(item.evidence_path)

        evidenceUrl = data?.publicUrl
    }

    // 4. Check if current user voted
    const { data: { user } } = await supabase.auth.getUser()
    let hasVoted = false
    if (user) {
        const { data: vote } = await supabase
            .from(TABLES.votes)
            .select('*')
            .eq('item_id', item.id)
            .eq('created_by', user.id)
            .single()
        hasVoted = !!vote
    }

    const voteCount = item.votes?.[0]?.count || 0

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <div className="mb-6">
                <Link href="/mapa" className="inline-flex items-center text-sm text-zinc-500 hover:text-blue-600 transition-colors mb-4">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Volver al Mapa
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {/* Category Badge */}
                            <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide">
                                {/* @ts-ignore */}
                                {(Array.isArray(item.category) ? item.category[0]?.name : item.category?.name) || 'General'}
                            </span>

                            {/* Status Badges */}
                            {item.status === 'resolved' && (
                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Resuelto
                                </span>
                            )}
                            {item.kind === 'good' && (
                                <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                                    <ThumbsUp className="h-3 w-3" /> Acierto
                                </span>
                            )}
                            {item.status === 'pending' && (
                                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wide flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> Pendiente (Moderación)
                                </span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 leading-tight">
                            {item.title}
                        </h1>
                    </div>

                    <div className="flex flex-col items-center min-w-[80px]">
                        <VoteButton
                            itemId={item.id}
                            initialVotes={voteCount}
                            hasVoted={hasVoted}
                        />
                    </div>
                </div>
            </div>

            {/* Resolved Banner */}
            {item.status === 'resolved' && (
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 mb-8 shadow-sm">
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        Reporte Resuelto
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-base mb-2">
                        {item.resolution_note || 'Este reporte ha sido marcado como resuelto por la administración.'}
                    </p>
                    {item.resolved_at && (
                        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide">
                            Resuelto el {new Date(item.resolved_at).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )}

            {/* Content Body */}
            <div className="grid gap-8">
                {/* Evidence Image */}
                {evidenceUrl && (
                    <ItemEvidenceView
                        src={evidenceUrl}
                        alt={`Evidencia de ${item.title}`}
                    />
                )}

                {/* Description */}
                <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-2">Descripción</h3>
                    <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                        {item.description}
                    </p>
                </div>

                {/* Metadata Footer */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-zinc-500 border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-4">
                    <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Reportado el {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                            {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
