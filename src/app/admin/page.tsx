
import { createClient } from '@/lib/supabase/server'
import AdminItemCard from '@/components/admin/AdminItemCard'

export const revalidate = 0 // Always fresh

export default async function AdminDashboard() {
    const supabase = await createClient()

    // Fetch pending items
    const { data: items } = await supabase
        .from('natales_items')
        .select('*, category:natales_categories(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Reportes Pendientes</h1>
            {items && items.length > 0 ? (
                <div className="grid gap-6">
                    {items.map((item) => (
                        <AdminItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <p className="text-zinc-500">No hay reportes pendientes de revisión.</p>
            )}
        </div>
    )
}
