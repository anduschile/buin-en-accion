
import { createClient } from '@/lib/supabase/server'
import SemaforoClient from '@/components/semaforo/SemaforoClient'

export const revalidate = 60

export default async function SemaforoPage() {
    const supabase = await createClient()

    // Fetch items with votes
    // Note: For large datasets, use a view or RPC for vote counting. 
    // For MVP, we fetch published items and their votes.
    const { data: items } = await supabase
        .from('natales_items')
        .select(`
      *,
      category:natales_categories(name),
      votes:natales_votes(count)
    `)
        .eq('status', 'published')

    // Process and sort by vote count
    const rankedItems = (items || []).map((item) => ({
        ...item,
        vote_count: (item.votes?.[0] as { count: number } | undefined)?.count || 0,
        category_name: (item.category as { name: string } | null)?.name || 'General',
        is_general: item.is_general
    })).sort((a, b) => b.vote_count - a.vote_count)



    // Use a client component for tabs
    return (
        <SemaforoClient items={rankedItems} />
    )
}
