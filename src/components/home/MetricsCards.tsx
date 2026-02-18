
import { CheckCircle2, Clock, MapPin } from 'lucide-react'

interface MetricsProps {
    published: number
    inReview: number
    aciertos: number
}

export default function MetricsCards({ published, inReview, aciertos }: MetricsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 container mx-auto px-4 -mt-12 relative z-10">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    <MapPin className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-3xl font-bold">{published}</p>
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">Reportes Publicados</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
                    <Clock className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-3xl font-bold">{inReview}</p>
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">En Revisión</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-3xl font-bold">{aciertos}</p>
                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wide">Aciertos Destacados</p>
                </div>
            </div>
        </div>
    )
}
