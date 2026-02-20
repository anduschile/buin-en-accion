
import { createClient } from '@/lib/supabase/server'
import PublicMapClient from '@/components/map/PublicMapClient'

import { TABLES } from '@/lib/tables'
import { tenant } from '@/config/tenant'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { Database } from '@/lib/supabase/database.types'

type MapItemProps = Database['public']['Tables']['buin_items']['Row'] & {
    category: Pick<Database['public']['Tables']['buin_categories']['Row'], 'name'> | null
}

export default async function MapPage() {
    const supabase = await createClient()

    const { data: rawItems } = await supabase
        .from(TABLES.items)
        .select(`*, category:${TABLES.categories}(name)`)
        .in('status', ['published', 'resolved'])

    const items = (rawItems as unknown as MapItemProps[] || []).map((item) => {
        let evidence_url = null
        if (item.evidence_path) {
            // Use public URL directly
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            evidence_url = `${supabaseUrl}/storage/v1/object/public/${tenant.bucketEvidence}/${item.evidence_path}`
        }
        return { ...item, evidence_url }
    })

    // Cast for component with robust normalization
    const mappedItems = items
        .map(i => ({
            id: i.id,
            title: i.title,
            description: i.description ?? null,
            latitude: i.latitude,
            longitude: i.longitude,
            category: Array.isArray(i.category) ? i.category[0] : i.category,
            traffic_level: i.traffic_level,
            evidence_url: i.evidence_url ?? null,
            kind: i.kind,
            status: i.status,
            // @ts-ignore
            resolved_at: i.resolved_at,
            // @ts-ignore
            resolution_note: i.resolution_note,
            // @ts-ignore
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
