'use server'

import { createClient } from '@/lib/supabase/server'
import { itemSchema } from '@/lib/validations/schema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export async function createItem(formData: FormData) {
    const supabase = await createClient()

    // Get current user
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Debes iniciar sesión para reportar.' }
    }

    // Parse fields
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category_id = formData.get('category_id') as string
    const kind = formData.get('kind') as string
    const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
    const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
    const is_general = formData.get('is_general') === 'true'

    // Validation
    if (!title || !description || !category_id || !kind) {
        return { error: 'Faltan campos obligatorios' }
    }

    if (!is_general && (latitude === null || longitude === null)) {
        return { error: 'La ubicación es obligatoria para este tipo de reporte.' }
    }

    let evidence_path = null
    const evidenceFile = formData.get('evidence') as File

    // Handle file upload
    if (evidenceFile && evidenceFile.size > 0 && evidenceFile.name !== 'undefined') {
        try {
            const fileExt = evidenceFile.name.split('.').pop()
            const sanitizedFileName = evidenceFile.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            const fileName = `natales/${user.id}/${crypto.randomUUID()}-${sanitizedFileName}`

            const { error: uploadError } = await supabase.storage
                .from('natales_evidence')
                .upload(fileName, evidenceFile, { upsert: false })

            if (uploadError) {
                console.error({ step: 'upload', error: uploadError })
                return { error: `Error subiendo imagen: ${uploadError.message}` }
            }
            evidence_path = fileName
        } catch (e) {
            console.error({ step: 'upload_exception', error: e })
            return { error: 'Error procesando la imagen.' }
        }
    }

    // Insert into DB
    const { error: insertError } = await supabase.from('natales_items').insert({
        title,
        description,
        latitude,
        longitude,
        category_id,
        created_by: user.id,
        evidence_path,
        kind,
        status: 'pending',
        is_general
    })

    if (insertError) {
        console.error({ step: 'insert', error: insertError })
        return { error: `Error guardando reporte: ${insertError.message} (Code: ${insertError.code})` }
    }

    revalidatePath('/')
    revalidatePath('/mapa')
    redirect('/gracias')
}

export async function voteItem(itemId: string, type: 'priority' = 'priority') {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Debes iniciar sesión para votar.' }
    }

    // Check if already voted
    const { data: existingVote } = await supabase
        .from('natales_votes')
        .select('*')
        .eq('item_id', itemId)
        .eq('created_by', user.id)
        .single()

    if (existingVote) {
        // Toggle vote (remove it)
        await supabase
            .from('natales_votes')
            .delete()
            .eq('item_id', itemId)
            .eq('created_by', user.id)
    } else {
        // Insert vote
        await supabase.from('natales_votes').insert({
            item_id: itemId,
            created_by: user.id
        })
    }

    revalidatePath(`/item/${itemId}`)
    revalidatePath('/semaforo')
}
