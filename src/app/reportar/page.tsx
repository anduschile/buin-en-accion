
import { createClient } from '@/lib/supabase/server'
import { TABLES } from '@/lib/tables'
import { tenant } from '@/config/tenant'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: `Reportar problema — ${tenant.appName}`,
    description: 'Reporta problemas en tu barrio. Sigue el estado de tu reporte con un código único.',
}

interface PageProps {
    searchParams: Promise<{ cat?: string }>
}

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import CategorySelector from '@/components/report/CategorySelector'

import ReportWizard from '@/components/report/ReportWizard'

export const revalidate = 0

import { getCategoryIcon } from '@/lib/constants/categories'

export default async function ReportarPage({ searchParams }: PageProps) {
    const { cat } = await searchParams
    const supabase = await createClient()

    // Normalize category slug
    const catSlug = cat?.toLowerCase().trim()

    // Fetch all categories
    const { data: categories, error: catError } = await supabase
        .from(TABLES.categories)
        .select('id, name, slug')
        .order('display_order', { ascending: true })

    const validCategories = (categories || []).map(c => ({
        ...c,
        icon: getCategoryIcon(c.slug)
    })).filter(
        (c): c is { id: string; name: string; slug: string; icon: string } => !!c.id && !!c.slug
    )

    const preSelectedCategory = catSlug
        ? (validCategories.find(c => c.slug === catSlug) ?? null)
        : null

    const isInvalidSlug = !!catSlug && !preSelectedCategory
    const isDevelopment = process.env.NODE_ENV === 'development'

    return (
        <div className="container mx-auto px-4 py-8 max-w-xl">
            {/* Debug info - Dev only */}
            {isDevelopment && (
                <div className="mb-4 p-2 bg-black text-[10px] font-mono text-green-400 rounded border border-green-900">
                    DEBUG: cat_param="{cat}" | slug="{catSlug}" | found={preSelectedCategory ? 'YES' : 'NO'} | cats_count={validCategories.length}
                </div>
            )}

            <div className="mb-8">
                <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                    ← Volver al inicio
                </Link>
                <h1 className="text-3xl font-bold mt-2">Crear Reporte</h1>
            </div>

            {catError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
                    Error cargando categorías: {catError.message}
                </div>
            )}

            {!preSelectedCategory ? (
                <CategorySelector
                    categories={validCategories}
                    message={isInvalidSlug ? "La categoría seleccionada no es válida. Por favor elige una de la lista." : undefined}
                />
            ) : (
                <ReportWizard
                    categories={validCategories}
                    preSelectedCategory={preSelectedCategory}
                />
            )}
        </div>
    )
}
