
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportForm from '@/components/report/ReportForm'

export default async function ReportPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch categories for the form
    const { data: categories } = await supabase
        .from('natales_categories')
        .select('*')
        .order('name')

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-2">Reportar Problema</h1>
            <p className="text-zinc-500 mb-8">
                Ayúdanos a identificar problemas en Puerto Natales via geolocalización.
            </p>

            <ReportForm categories={categories || []} />
        </div>
    )
}
