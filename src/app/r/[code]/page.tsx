
import { createClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/tables'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Database } from '@/lib/supabase/database.types'
import { Clock, CheckCircle2, MapPin, XCircle, RefreshCw } from 'lucide-react'

type Report = Database['public']['Tables']['buin_reports']['Row']
type ReportUpdate = Database['public']['Tables']['buin_report_updates']['Row']
type Category = Database['public']['Tables']['buin_categories']['Row']

interface PageProps {
    params: Promise<{ code: string }>
    searchParams: Promise<{ t?: string }>
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
    pending: {
        label: 'En revisión',
        icon: <Clock className="h-5 w-5" />,
        color: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
    },
    published: {
        label: 'Publicado',
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: 'text-blue-700 dark:text-blue-300',
        bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
    },
    routed: {
        label: 'Derivado',
        icon: <RefreshCw className="h-5 w-5" />,
        color: 'text-purple-700 dark:text-purple-300',
        bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700',
    },
    in_progress: {
        label: 'En proceso',
        icon: <RefreshCw className="h-5 w-5" />,
        color: 'text-indigo-700 dark:text-indigo-300',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700',
    },
    resolved: {
        label: 'Resuelto ✓',
        icon: <CheckCircle2 className="h-5 w-5" />,
        color: 'text-green-700 dark:text-green-300',
        bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    },
    rejected: {
        label: 'No aprobado',
        icon: <XCircle className="h-5 w-5" />,
        color: 'text-red-700 dark:text-red-300',
        bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
    },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { code } = await params
    return {
        title: `Reporte ${code} — Buin en Acción`,
        description: `Sigue el estado del reporte ${code} en Buin en Acción.`,
        robots: 'noindex',
    }
}

export default async function ReportTrackingPage({ params, searchParams }: PageProps) {
    const { code } = await params
    const { t } = await searchParams
    const supabase = await createClient()

    // 1. Try to fetch with token (owner access)
    let report: (Report & { category: Category | null }) | null = null
    if (t) {
        const { data } = await supabase.rpc('get_buin_report_by_token', { p_code: code, p_token: t }).maybeSingle()
        if (data) {
            const reportData = data as any
            // Fetch category separately
            const { data: cat } = await supabase.from(TABLES.categories).select('name, icon').eq('id', reportData.category_id).maybeSingle()
            report = { ...reportData, category: cat as Category | null }
        }
    }

    // 2. If no token or not found with token, try public fetch (published+ only)
    if (!report) {
        const { data } = await supabase
            .from(TABLES.reports)
            .select(`*, category:buin_categories(name, slug, icon, route_hint)`)
            .eq('code', code)
            .maybeSingle() as { data: (Report & { category: Category | null }) | null }
        report = data
    }

    // Fetch status updates (only visible for public statuses via RLS, or all if accessed via token)
    const { data: updates } = report
        ? await supabase
            .from(TABLES.report_updates)
            .select('*')
            .eq('report_id', report.id)
            .order('created_at', { ascending: true })
        : { data: [] }

    // Case 1: Report not found at all (either code doesn't exist, or it's pending and no valid token was provided)
    if (!report) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <div className="text-5xl mb-4">🔒</div>
                <h1 className="text-2xl font-bold mb-2">Acceso restringido</h1>
                <p className="text-zinc-500 mb-2">
                    El reporte <strong className="font-mono">{code}</strong> está en revisión o no existe.
                </p>
                <p className="text-zinc-400 text-sm mb-8">
                    Si eres el autor, usa el <strong>enlace privado</strong> que recibiste en el voucher.
                </p>
                <Link href="/" className="text-blue-600 hover:underline text-sm">
                    Volver al inicio
                </Link>
            </div>
        )
    }

    const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.published
    const category = report.category

    // Case 2: Rejected — show limited info
    if (report.status === 'rejected') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <div className="text-5xl mb-4">❌</div>
                <h1 className="text-2xl font-bold mb-2">Reporte no aprobado</h1>
                <p className="text-zinc-500 mb-8 text-sm">
                    El reporte <strong className="font-mono">{code}</strong> no pudo ser publicado porque no cumplió con las normas de la comunidad.
                    <br /><br />
                    Si crees que fue un error, puedes crear un nuevo reporte.
                </p>
                <Link href="/reportar" className="text-blue-600 hover:underline text-sm">
                    Crear nuevo reporte
                </Link>
            </div>
        )
    }

    // Case 3: Pending (owner can see, or we reached here via RLS — show "in review")
    if (report.status === 'pending') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <div className="text-5xl mb-4">⏳</div>
                <h1 className="text-2xl font-bold mb-2">Tu reporte está en revisión</h1>
                <p className="text-zinc-500 text-sm mb-2">
                    Código: <strong className="font-mono text-blue-700 dark:text-blue-300">{code}</strong>
                </p>
                {category && (
                    <p className="text-sm text-zinc-400 mb-6">
                        {category.icon} {category.name}
                    </p>
                )}
                <p className="text-zinc-400 text-sm mb-8">
                    Un moderador revisará tu reporte en las próximas 24–48h hábiles.
                    Una vez aprobado, aparecerá aquí el detalle completo.
                </p>
                <Link href="/" className="text-blue-600 hover:underline text-sm">
                    Volver al inicio
                </Link>
            </div>
        )
    }

    // Case 4: Public report (published, routed, in_progress, resolved)
    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Back */}
            <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-4 inline-block">
                ← Volver al inicio
            </Link>

            {/* Code header */}
            <div className="mb-6">
                <p className="text-xs text-zinc-400 font-mono mb-1">{code}</p>
                <h1 className="text-2xl font-bold">
                    {category?.icon} Reporte de {category?.name || 'problema'}
                </h1>
            </div>

            {/* Status badge */}
            <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 mb-6 ${statusConfig.bg}`}>
                <span className={statusConfig.color}>{statusConfig.icon}</span>
                <div>
                    <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
                    <p className="text-xs text-zinc-500">
                        Última actualización: {new Date(report.updated_at).toLocaleDateString('es-CL', {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 mb-4">
                <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2">Descripción</h2>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">{report.description}</p>
            </div>

            {/* Location */}
            {(report.lat || report.address_text) && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 mb-4">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> Ubicación
                    </h2>
                    {report.address_text && (
                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{report.address_text}</p>
                    )}
                    {report.lat && report.lng && (
                        <a
                            href={`https://www.google.com/maps?q=${report.lat},${report.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                        >
                            Ver en Google Maps ↗
                        </a>
                    )}
                </div>
            )}

            {/* Evidence */}
            {report.evidence_urls && Array.isArray(report.evidence_urls) && report.evidence_urls.length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5 mb-4">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">Evidencia</h2>
                    <div className="grid grid-cols-2 gap-2">
                        {(report.evidence_urls as string[]).map((url, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                key={i}
                                src={url}
                                alt={`Evidencia ${i + 1}`}
                                className="rounded-lg object-cover w-full h-40 border"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Created date */}
            <p className="text-xs text-zinc-400 text-right mb-4">
                Reportado el {new Date(report.created_at).toLocaleDateString('es-CL', {
                    year: 'numeric', month: 'long', day: 'numeric'
                })}
            </p>

            {/* Status history */}
            {updates && (updates as ReportUpdate[]).length > 0 && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border p-5">
                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-4">
                        Historial de seguimiento
                    </h2>
                    <div className="space-y-4">
                        {(updates as ReportUpdate[]).map((u) => {
                            const cfg = STATUS_CONFIG[u.to_status]
                            return (
                                <div key={u.id} className="flex gap-3">
                                    <div className={`shrink-0 pt-0.5 ${cfg?.color || 'text-zinc-500'}`}>
                                        {cfg?.icon || <RefreshCw className="h-4 w-4" />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold ${cfg?.color || 'text-zinc-700'}`}>
                                            {cfg?.label || u.to_status}
                                        </p>
                                        {u.note && (
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">{u.note}</p>
                                        )}
                                        <p className="text-xs text-zinc-400 mt-1">
                                            {new Date(u.created_at).toLocaleDateString('es-CL', {
                                                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
