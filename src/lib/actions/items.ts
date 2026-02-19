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
    const rawData = {
        title: formData.get('title'),
        description: formData.get('description'),
        latitude: Number(formData.get('latitude')),
        longitude: Number(formData.get('longitude')),
        category_id: formData.get('category_id'),
        evidence: formData.get('evidence') as File | null,
    }

    // Validate non-file fields first
    const validatedFields = itemSchema.safeParse({
        ...rawData,
        evidence_path: rawData.evidence?.name ? 'temp' : undefined, // Check if file exists
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors }
    }

    let evidencePath = null


    // Handle file upload
    if (rawData.evidence && rawData.evidence.size > 0) {
        try {
            const file = rawData.evidence
            const fileExt = file.name.split('.').pop()
            const sanitizedFileName = file.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
            const fileName = `natales/${user.id}/${crypto.randomUUID()}-${sanitizedFileName}`

            const { error: uploadError } = await supabase.storage
                .from('natales_evidence')
                .upload(fileName, file, { upsert: false })

            if (uploadError) {
                console.error({ step: 'upload', error: uploadError })
                return { error: `Error subiendo imagen: ${uploadError.message}` }
            }
            evidencePath = fileName
        } catch (e) {
            console.error({ step: 'upload_exception', error: e })
            return { error: 'Error procesando la imagen.' }
        }
    }

    // Insert into DB
    const { error: insertError } = await supabase.from('natales_items').insert({
        title: validatedFields.data.title,
        description: validatedFields.data.description,
        latitude: validatedFields.data.latitude,
        longitude: validatedFields.data.longitude,
        category_id: validatedFields.data.category_id,
        created_by: user.id,
        evidence_path: evidencePath,
        kind: (formData.get('kind') as 'problem' | 'good') || 'problem',
        status: 'pending',
        // traffic_level removed to use DB default
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
