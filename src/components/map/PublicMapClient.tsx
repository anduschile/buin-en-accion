'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const PublicMap = dynamic(() => import('@/components/map/PublicMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-zinc-900">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-zinc-500">Cargando mapa ciudadana...</p>
            </div>
        </div>
    )
})

export default function PublicMapClient({ items }: {
    items: {
        id: string
        title: string
        description: string | null
        latitude: number
        longitude: number
        category: { name: string; icon?: string | null } | null
        traffic_level: string
        evidence_url: string | null
        kind?: 'problem' | 'good'
        status: string
        resolved_at?: string | null
        resolution_note?: string | null
    }[]
}) {
    // @ts-ignore dynamic import typing issue
    return <PublicMap items={items} />
}
