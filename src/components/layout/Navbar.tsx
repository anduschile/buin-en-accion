
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Map, TrafficCone, Siren, Menu, User } from 'lucide-react'

export async function Navbar() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <nav className="border-b bg-white dark:bg-zinc-950 dark:border-zinc-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
                    <TrafficCone className="h-6 w-6" />
                    <span>Natales en Acción</span>
                </Link>

                <div className="hidden md:flex items-center gap-6">
                    <Link href="/mapa" className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors">
                        <Map className="h-4 w-4" />
                        Mapa
                    </Link>
                    <Link href="/semaforo" className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors">
                        <Siren className="h-4 w-4" />
                        Semáforo
                    </Link>
                    <Link href="/reportar" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Reportar
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-zinc-500 hidden sm:inline">{user.email}</span>
                            <form action="/auth/signout" method="post">
                                <button className="text-sm font-medium text-red-500 hover:text-red-600">
                                    Salir
                                </button>
                            </form>
                        </div>
                    ) : (
                        <Link href="/login" className="text-sm font-medium bg-zinc-900 text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                            Ingresar
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    )
}
