import { createClient } from '@/lib/supabase/client'

/**
 * Generates a public URL for an evidence file path.
 * Returs null if path is empty.
 */
export function getEvidencePublicUrl(evidencePath: string | null): string | null {
    if (!evidencePath) return null

    // If it's already a full URL, return it
    if (evidencePath.startsWith('http')) return evidencePath

    const supabase = createClient()
    const { data } = supabase.storage.from('natales_evidence').getPublicUrl(evidencePath)

    return data.publicUrl || null
}
