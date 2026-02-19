import { CheckCircle2, Clock, XCircle, FileText } from 'lucide-react'

export function StatusExplainer() {
    const statuses = [
        {
            label: 'Pendiente',
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100 dark:bg-yellow-900/30',
            desc: 'Recibido y en revisión.'
        },
        {
            label: 'Publicado',
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-100 dark:bg-blue-900/30',
            desc: 'Visible en el mapa.'
        },
        {
            label: 'Resuelto',
            icon: CheckCircle2,
            color: 'text-zinc-600',
            bg: 'bg-zinc-100 dark:bg-zinc-800',
            desc: 'Solucionado oficialmente.'
        },
        {
            label: 'Rechazado',
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-100 dark:bg-red-900/30',
            desc: 'No cumple reglas.'
        }
    ]

    return (
        <section className="py-16 bg-white dark:bg-zinc-950">
            <div className="container mx-auto px-4 text-center">
                <h3 className="text-2xl font-bold mb-8">Estados del reporte</h3>
                <div className="flex flex-wrap justify-center gap-4">
                    {statuses.map((status, index) => (
                        <div key={index} className={`flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-200 dark:border-zinc-800 ${status.bg}`}>
                            <status.icon className={`w-4 h-4 ${status.color}`} />
                            <span className={`font-medium ${status.color}`}>{status.label}</span>
                            <span className="text-sm text-zinc-500 hidden sm:inline border-l pl-2 border-zinc-300 dark:border-zinc-700">
                                {status.desc}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
