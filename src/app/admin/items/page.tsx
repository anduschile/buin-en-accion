
import { createClient } from '@/lib/supabase/server'
import AdminItemCard from '@/components/admin/AdminItemCard'

export const revalidate = 0

export default async function AdminItemsPage() {
    const supabase = await createClient()

    const { data: items } = await supabase
        .from('natales_items')
        .select('*, category:natales_categories(name)')
        .order('created_at', { ascending: false })

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Todos los Reportes</h1>
            {items && items.length > 0 ? (
                <div className="grid gap-6">
                    {items.map((item) => (
                        <AdminItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <p className="text-zinc-500">No hay reportes registrados.</p>
            )}
        </div>
    )
}
