
'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

const MiniMap = dynamic(() => import('./MiniMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-zinc-100 dark:bg-zinc-800 animate-pulse flex flex-col items-center justify-center text-zinc-400 rounded-2xl">
            <MapPin className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm font-medium">Cargando mapa...</p>
        </div>
    )
})

interface Item {
    id: string
    title: string
    latitude: number
    longitude: number
    kind?: 'problem' | 'good'
}

export default function MiniMapPreview({ items }: { items: Item[] }) {
    if (!items || items.length === 0) {
        return (
            <div className="h-full w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                    <MapPin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Aún no hay reportes en el mapa</h3>
                <p className="text-sm text-zinc-500 max-w-[200px]">
                    Sé el primero en reportar un problema o destacar un acierto.
                </p>
            </div>
        )
    }

    return (
        <div className="h-[300px] md:h-[400px] w-full">
            <MiniMap items={items} />
        </div>
    )
}
