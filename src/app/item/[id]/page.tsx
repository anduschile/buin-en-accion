
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import VoteButton from '@/components/item/VoteButton'
import { Button } from '@/components/ui/button'
import PublicMapClient from '@/components/map/PublicMapClient'

// Reuse PublicMap but with single item... wait, PublicMap takes items array. I can pass [item].

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { id } = await params

    // Fetch item with category, votes, updates
    const { data: item, error } = await supabase
        .from('natales_items')
        .select(`
      *,
      category:natales_categories(name, icon),
      votes:natales_votes(user_id),
      updates:natales_updates(
        id, content, source_url, created_at, created_by
      ),
      profiles:natales_profiles!items_user_id_fkey(full_name)
    `)
        .eq('id', id)
        .single()

    if (error || !item) {
        notFound()
    }

    // Get current user for vote check
    const { data: { user } } = await supabase.auth.getUser()
    const hasVoted = user ? item.votes.some((v: { user_id: string }) => v.user_id === user.id) : false
    const voteCount = item.votes.length

    // Signed URL
    let evidence_url = null
    if (item.evidence_path) {
        const { data } = await supabase.storage
            .from('natales_evidence')
            .createSignedUrl(item.evidence_path, 3600)
        evidence_url = data?.signedUrl || null
    }

    // Cast for map
    const mapItem = { ...item, evidence_url, category: Array.isArray(item.category) ? item.category[0] : item.category }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link href="/mapa" className="flex items-center text-sm text-zinc-500 hover:text-blue-600 mb-6 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al mapa
            </Link>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                {item.category?.name || 'General'}
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${item.status === 'published' ? 'bg-green-100 text-green-800' :
                                item.status === 'resolved' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'
                                }`}>
                                {item.status.toUpperCase()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h1>
                        <div className="flex items-center gap-4 text-sm text-zinc-500 mt-2">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(item.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {item.profiles?.full_name || 'Ciudadano'}
                            </span>
                        </div>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="text-lg whitespace-pre-wrap">{item.description}</p>
                    </div>

                    {evidence_url && (
                        <div className="rounded-xl overflow-hidden border bg-gray-50">
                            <img src={evidence_url} alt="Evidencia" className="w-full h-auto max-h-[500px] object-contain" />
                        </div>
                    )}

                    {/* Updates Section */}
                    {item.updates && item.updates.length > 0 && (
                        <div className="border-t pt-6 mt-8">
                            <h2 className="text-xl font-bold mb-4">Actualizaciones Oficiales</h2>
                            <div className="space-y-4">
                                {item.updates.map((update: { id: string; content: string; source_url: string | null; created_at: string }) => (
                                    <div key={update.id} className="p-4 bg-blue-50 dark:bg-zinc-900/50 rounded-lg border border-blue-100 dark:border-zinc-800">
                                        <p className="whitespace-pre-wrap mb-2">{update.content}</p>
                                        {update.source_url && (
                                            <a href={update.source_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                                                Fuente oficial →
                                            </a>
                                        )}
                                        <span className="block text-xs text-zinc-400 mt-2">
                                            {new Date(update.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl border shadow-sm text-center">
                        <div className="text-4xl font-bold mb-4">{voteCount}</div>
                        <div className="text-sm text-zinc-500 mb-6">Votos de prioridad</div>
                        {user ? (
                            <VoteButton itemId={item.id} initialVotes={voteCount} hasVoted={hasVoted} />
                        ) : (
                            <Link href="/login">
                                <Button className="w-full">Iniciar Sesión para Votar</Button>
                            </Link>
                        )}
                    </div>

                    <div className="h-[250px] rounded-xl overflow-hidden border">
                        <PublicMapClient items={[mapItem]} />
                    </div>
                </div>
            </div>
        </div>
    )
}
