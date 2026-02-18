
import { createClient } from '@/lib/supabase/server'
import PublicMapClient from '@/components/map/PublicMapClient'

export const revalidate = 60 // Revalidate every minute

export default async function MapPage() {
    const supabase = await createClient()

    const { data: rawItems } = await supabase
        .from('natales_items')
        .select('*, category:natales_categories(name)')
        .eq('status', 'published')

    const items = await Promise.all((rawItems || []).map(async (item) => {
        let evidence_url = null
        if (item.evidence_path) {
            const { data } = await supabase.storage
                .from('natales_evidence')
                .createSignedUrl(item.evidence_path, 3600) // 1 hour
            evidence_url = data?.signedUrl || null
        }
        return { ...item, evidence_url }
    }))

    // Cast for component with robust normalization
    const mappedItems = items
        .map(i => ({
            id: i.id,
            title: i.title,
            description: i.description ?? null,
            // Handle both latitude/longitude and lat/lng
            latitude: (i.latitude ?? i.lat) as number | undefined,
            longitude: (i.longitude ?? i.lng) as number | undefined,
            category: Array.isArray(i.category) ? i.category[0] : i.category,
            // Handle both traffic_level and traffic

            traffic_level: (i.traffic_level ?? i.traffic) as string,
            evidence_url: i.evidence_url ?? null,
            kind: i.kind,
        }))
        // Filter out items without valid numeric coordinates
        .filter(i => typeof i.latitude === 'number' && typeof i.longitude === 'number') as any

    return (
        <main className="h-[calc(100vh-4rem)]">
            <PublicMapClient items={mappedItems} />
        </main>
    )
}
