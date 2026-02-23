
import Link from 'next/link'
import { tenant } from '@/config/tenant'
import CategoryButtons from './CategoryButtons'

export function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 bg-gradient-to-b from-white to-blue-50 dark:from-zinc-950 dark:to-zinc-900 overflow-hidden">
            <div className="relative z-10 max-w-3xl mx-auto w-full">
                <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold mb-5">
                    Participación vecinal • Buin 2026
                </span>

                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 dark:from-blue-400 dark:to-cyan-300">
                    {tenant.appName}
                </h1>

                <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 mb-4 max-w-xl mx-auto">
                    Reporta problemas en tu barrio. Obtén un <strong>código de seguimiento</strong> al instante.
                </p>

                <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-10">
                    Sin contraseña · Sin registro · Moderación antes de publicar
                </p>

                {/* 5 Category Buttons */}
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-4 uppercase tracking-wider">
                    ¿Qué quieres reportar?
                </p>
                <CategoryButtons />

                {/* Track by code */}
                <div className="mt-10 flex flex-col items-center gap-2">
                    <p className="text-xs text-zinc-400">¿Ya tienes un código de seguimiento?</p>
                    <TrackCodeForm />
                </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 pointer-events-none" />
        </section>
    )
}

function TrackCodeForm() {
    return (
        <form action="/r" method="GET" className="flex gap-2 w-full max-w-sm">
            <input
                name="code"
                type="text"
                placeholder="BUIN-260222-XXXXXX"
                className="flex-1 px-3 py-2 text-sm border rounded-lg dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <TrackRedirectButton />
        </form>
    )
}

function TrackRedirectButton() {
    // Server-rendered search redirect: submits form to /r?code=... 
    // we handle redirect in the /r page via GET param
    return (
        <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
            Ver estado
        </button>
    )
}
