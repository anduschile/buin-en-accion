
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, ListTodo, Users, FolderOpen } from 'lucide-react'

import { TABLES } from '@/lib/tables'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from(TABLES.profiles)
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'editor', 'verifier'].includes(profile.role)) {
        redirect('/')
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            <aside className="w-64 border-r bg-white dark:bg-zinc-950 hidden md:block">
                <div className="p-4">
                    <h2 className="font-bold text-lg mb-4">Backoffice</h2>
                    <nav className="space-y-1">
                        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900">
                            <LayoutDashboard className="h-4 w-4" />
                            Pendientes
                        </Link>
                        <Link href="/admin/items" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900">
                            <ListTodo className="h-4 w-4" />
                            Todos los Items
                        </Link>
                        {profile.role === 'admin' && (
                            <Link href="/admin/categories" className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900">
                                <FolderOpen className="h-4 w-4" />
                                Categorías
                            </Link>
                        )}
                    </nav>
                </div>
            </aside>
            <main className="flex-1 p-8 bg-gray-50 dark:bg-zinc-900">
                {children}
            </main>
        </div>
    )
}
