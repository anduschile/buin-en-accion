
import { createClient } from '@/lib/supabase/server'
import PublicMapClient from '@/components/map/PublicMapClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MapPage() {
    const supabase = await createClient()

    const { data: rawItems } = await supabase
        .from('natales_items')
        .select('*, category:natales_categories(name)')
        .in('status', ['published', 'resolved'])

    const items = (rawItems || []).map((item) => {
        let evidence_url = null
        if (item.evidence_path) {
            // Use public URL directly
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            evidence_url = `${supabaseUrl}/storage/v1/object/public/natales_evidence/${item.evidence_path}`
        }
        return { ...item, evidence_url }
    })

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
            status: i.status,
            resolved_at: i.resolved_at,
            resolution_note: i.resolution_note,
            is_general: i.is_general,
        }))
        // Filter out items without valid numeric coordinates
        .filter(i => typeof i.latitude === 'number' && typeof i.longitude === 'number') as any

    return (
        <main className="h-[calc(100vh-4rem)]">
            <PublicMapClient items={mappedItems} />
        </main>
    )
}
