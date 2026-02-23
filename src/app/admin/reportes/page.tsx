
import { createClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/tables'
import AdminReportCard from '@/components/admin/AdminReportCard'
import type { Database } from '@/lib/supabase/database.types'

export const revalidate = 0

type Report = Database['public']['Tables']['buin_reports']['Row']
type Category = Pick<Database['public']['Tables']['buin_categories']['Row'], 'name' | 'slug'>

type ReportWithCategory = Report & { category: Category | null }

interface PageProps {
    searchParams: Promise<{ s?: string }>
}

const STATUS_TABS = [
    { id: 'pending', label: 'Pendientes', color: 'amber' },
    { id: 'published', label: 'Publicados', color: 'blue' },
    { id: 'routed', label: 'Derivados', color: 'purple' },
    { id: 'in_progress', label: 'En proceso', color: 'indigo' },
    { id: 'resolved', label: 'Resueltos', color: 'green' },
    { id: 'rejected', label: 'Rechazados', color: 'red' },
]

export default async function AdminReportesPage({ searchParams }: PageProps) {
    const { s = 'pending' } = await searchParams
    const supabase = await createClient()

    // Fetch report counts for each status
    const { data: countsData } = await supabase
        .from(TABLES.reports)
        .select('status')

    const counts: Record<string, number> = {}
    countsData?.forEach(r => {
        counts[r.status] = (counts[r.status] || 0) + 1
    })

    const { data: rawReports, error } = await supabase
        .from(TABLES.reports)
        .select(`*, category:buin_categories(name, slug)`)
        .eq('status', s)
        .order('created_at', { ascending: s === 'pending' }) // Newest first for most, oldest for pending

    if (error) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Gestión de Reportes</h1>
                <p className="text-red-500 text-sm">Error cargando reportes: {error.message}</p>
            </div>
        )
    }

    const reports = (rawReports || []) as unknown as ReportWithCategory[]

    return (
        <div className="p-1 md:p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-4">Gestión de Reportes</h1>

                {/* Tabs */}
                <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide border-b border-zinc-200 dark:border-zinc-800">
                    {STATUS_TABS.map(tab => {
                        const active = s === tab.id
                        const count = counts[tab.id] || 0
                        return (
                            <a
                                key={tab.id}
                                href={`/admin/reportes?s=${tab.id}`}
                                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${active
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                                    }`}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                        {count}
                                    </span>
                                )}
                            </a>
                        )
                    })}
                </div>
            </div>

            {reports.length === 0 ? (
                <div className="text-center py-16 text-zinc-400">
                    <p className="text-4xl mb-3">📭</p>
                    <p>No hay reportes en estado "{STATUS_TABS.find(t => t.id === s)?.label}".</p>
                </div>
            ) : (
                <div className="grid gap-4 max-w-4xl">
                    {reports.map(report => (
                        <AdminReportCard key={report.id} report={report} />
                    ))}
                </div>
            )}
        </div>
    )
}
