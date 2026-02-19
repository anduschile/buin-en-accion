export function getEvidencePublicUrl(path: string | null): string | null {
    if (!path) return null
    if (path.startsWith('http')) return path

    // Use environment variable or fallback to a relative path if needed, 
    // but for Supabase it's usually standard.
    // User requested format: ${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/natales_evidence/${path}

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
        console.error('NEXT_PUBLIC_SUPABASE_URL is not defined')
        return null
    }

    // Ensure no double slashes if path starts with /
    const cleanPath = path.startsWith('/') ? path.slice(1) : path

    return `${supabaseUrl}/storage/v1/object/public/natales_evidence/${cleanPath}`
}
