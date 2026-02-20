
import { createClient } from '@/lib/supabase/server'
import AdminItemCard from '@/components/admin/AdminItemCard'

import { TABLES } from '@/lib/tables'

export const revalidate = 0

import { Database } from '@/lib/supabase/database.types'

type AdminItemProps = Database['public']['Tables']['buin_items']['Row'] & {
    category: Pick<Database['public']['Tables']['buin_categories']['Row'], 'name'> | null
}

export default async function AdminPendingPage() {
    const supabase = await createClient()

    const { data: rawItems } = await supabase
        .from(TABLES.items)
        .select(`*, category:${TABLES.categories}(name)`)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    const items = rawItems as unknown as AdminItemProps[]

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Moderación de Pendientes</h1>
            {items && items.length > 0 ? (
                <div className="grid gap-6">
                    {items.map((item) => (
                        <AdminItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <p className="text-zinc-500">No hay reportes pendientes de moderación.</p>
            )}
        </div>
    )
}
