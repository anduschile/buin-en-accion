
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { revalidatePath } from 'next/cache'

export default async function AdminCategoriesPage() {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('natales_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        redirect('/admin')
    }

    // Fetch categories
    const { data: categories } = await supabase
        .from('natales_categories')
        .select('*')
        .order('name')

    // Server Actions
    async function addCategory(formData: FormData) {
        'use server'
        const supabase = await createClient()
        const name = formData.get('name') as string
        const slug = formData.get('slug') as string
        const icon = formData.get('icon') as string

        if (!name || !slug) return

        await supabase.from('natales_categories').insert({ name, slug, icon })
        revalidatePath('/admin/categories')
    }

    async function deleteCategory(id: string) {
        'use server'
        const supabase = await createClient()
        await supabase.from('natales_categories').delete().eq('id', id)
        revalidatePath('/admin/categories')
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6">Administrar Categorías</h1>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border shadow-sm mb-8">
                <h2 className="text-lg font-semibold mb-4">Nueva Categoría</h2>
                <form action={addCategory} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input name="name" required className="w-full p-2 border rounded" placeholder="Ej: Infraestructura" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Slug</label>
                        <input name="slug" required className="w-full p-2 border rounded" placeholder="Ej: infraestructura" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium mb-1">Icono (Emoji/String)</label>
                        <input name="icon" className="w-full p-2 border rounded" placeholder="🏗️" />
                    </div>
                    <Button type="submit">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar
                    </Button>
                </form>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800 border-b">
                        <tr>
                            <th className="p-4 font-medium">Icono</th>
                            <th className="p-4 font-medium">Nombre</th>
                            <th className="p-4 font-medium">Slug</th>
                            <th className="p-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {categories?.map((cat) => (
                            <tr key={cat.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                <td className="p-4 text-2xl">{cat.icon}</td>
                                <td className="p-4 font-medium">{cat.name}</td>
                                <td className="p-4 text-zinc-500">{cat.slug}</td>
                                <td className="p-4 text-right">
                                    <form action={deleteCategory.bind(null, cat.id)} className="inline-block">
                                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {(!categories || categories.length === 0) && (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-zinc-500">
                                    No hay categorías registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
