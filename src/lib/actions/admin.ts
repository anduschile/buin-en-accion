'use server'

import { createClient } from '@/lib/supabase/server'
import { updateSchema } from '@/lib/validations/schema'
import { revalidatePath } from 'next/cache'

export async function adminUpdateItemStatus(
    itemId: string,
    status: 'published' | 'rejected' | 'resolved' | 'pending',
    trafficLevel?: 'low' | 'medium' | 'high' | 'critical'
) {
    const supabase = await createClient()

    // Verify role
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Check profile role
    const { data: profile } = await supabase
        .from('natales_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'editor', 'verifier'].includes(profile.role)) {
        return { error: 'No tienes permisos para realizar esta acción.' }
    }

    const updateData: Record<string, unknown> = { status }
    if (trafficLevel) {
        updateData.traffic_level = trafficLevel
    }

    const { error } = await supabase
        .from('natales_items')
        .update(updateData)
        .eq('id', itemId)

    if (error) {
        return { error: 'Error al actualizar el estado.' }
    }

    revalidatePath(`/item/${itemId}`)
    revalidatePath('/admin')
    revalidatePath('/semaforo')
    revalidatePath('/mapa')
}

export async function adminAddUpdate(itemId: string, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('natales_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
        return { error: 'No tienes permisos.' }
    }

    const rawData = {
        content: formData.get('content'),
        source_url: formData.get('source_url'),
    }

    const validated = updateSchema.safeParse(rawData)

    if (!validated.success) {
        return { error: validated.error.flatten().fieldErrors }
    }

    const { error } = await supabase.from('natales_updates').insert({
        item_id: itemId,
        content: validated.data.content,
        source_url: validated.data.source_url || null,
        created_by: user.id,
    })

    if (error) {
        return { error: 'Error al agregar la actualización.' }
    }

    revalidatePath(`/item/${itemId}`)
}

export async function publishItem(itemId: string) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('natales_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'editor', 'verifier'].includes(profile.role)) {
        return { error: 'No authorization' }
    }

    const { error } = await supabase
        .from('natales_items')
        .update({
            status: 'published',
            published_at: new Date().toISOString()
        })
        .eq('id', itemId)

    if (error) return { error: error.message }

    revalidatePath('/admin')
    revalidatePath('/mapa')
    revalidatePath('/semaforo')
    revalidatePath(`/item/${itemId}`)
}

export async function rejectItem(itemId: string) {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('natales_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile || !['admin', 'editor', 'verifier'].includes(profile.role)) {
        return { error: 'No authorization' }
    }

    const { error } = await supabase
        .from('natales_items')
        .update({ status: 'rejected' })
        .eq('id', itemId)

    if (error) return { error: error.message }

    revalidatePath('/admin')
}
