
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'
import { tenant } from '@/config/tenant'

export default function ThankYouPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="bg-green-100 p-4 rounded-full mb-6">
                <CheckCircle className="h-16 w-16 text-green-600" />
            </div>

            <h1 className="text-3xl font-bold mb-4">¡Reporte Enviado!</h1>

            <p className="text-xl text-zinc-600 mb-8 max-w-md">
                Gracias por contribuir a mejorar {tenant.name}.
                <br />
                <span className="font-semibold block mt-4">
                    Tu reporte ha quedado en estado "Pendiente".
                </span>
                <span className="text-sm block mt-2 text-zinc-500">
                    Un moderador lo revisará en breve para asegurar que cumpla con las normas de la comunidad antes de publicarlo en el mapa.
                </span>
            </p>

            <div className="flex gap-4">
                <Link href="/mapa">
                    <Button variant="outline">Volver al Mapa</Button>
                </Link>
                <Link href="/reportar">
                    <Button>Crear otro reporte</Button>
                </Link>
            </div>
        </div>
    )
}
