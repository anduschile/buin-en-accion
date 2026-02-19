'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold mb-4">¡Ups! Algo salió mal</h2>
            <p className="text-zinc-500 mb-6 max-w-md">
                Ocurrió un error inesperado al cargar el formulario. Si estabas intentando subir una foto muy pesada, por favor intenta con una más liviana o refresca la página.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => reset()}>Intentar nuevamente</Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Volver al inicio
                </Button>
            </div>
        </div>
    )
}
