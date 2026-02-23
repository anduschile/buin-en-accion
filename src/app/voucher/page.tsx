import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import VoucherClient from './VoucherClient'
import { getCategoryIcon } from '@/lib/constants/categories'

export const metadata: Metadata = {
    title: 'Reporte Recibido — Buin en Acción',
    robots: 'noindex', // Vouchers are not indexed
}

interface PageProps {
    searchParams: Promise<{ code?: string; t?: string }>
}

export default async function VoucherPage({ searchParams }: PageProps) {
    const { code, t } = await searchParams

    if (!code) {
        notFound()
    }

    const supabase = await createClient()
    let report = null

    if (t) {
        // Fetch via secure RPC (includes category metadata)
        const { data } = await supabase.rpc('get_buin_report_by_token', {
            p_code: code,
            p_token: t
        }).maybeSingle()
        report = data
    }

    if (!report) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                <div className="text-5xl mb-4">{!t ? '🔐' : '🔍'}</div>
                <h1 className="text-2xl font-bold mb-2">
                    {!t ? 'Enlace privado requerido' : 'Reporte no encontrado'}
                </h1>
                <p className="text-zinc-500 mb-6">
                    {!t
                        ? 'Para ver este voucher necesitas el enlace privado completo que incluye el token de seguridad.'
                        : `No encontramos un reporte con el código ${code} o el token es inválido.`}
                    <br />
                    <span className="text-[10px] text-zinc-400 mt-2 block">ID recibido: {code}</span>
                </p>
                <Link
                    href="/"
                    className="text-blue-600 hover:underline text-sm"
                >
                    Volver al inicio
                </Link>
            </div>
        )
    }

    const r = report as any

    return (
        <VoucherClient
            code={r.code}
            token={t as string}
            categoryName={r.category_name || null}
            categoryIcon={getCategoryIcon(r.category_slug)}
            routeHint={r.category_route_hint || null}
            status={r.status}
            initialContact={{
                name: r.contact_name || '',
                phone: r.contact_phone || '',
                email: r.contact_email || ''
            }}
        />
    )
}
