export const CATEGORY_ICONS: Record<string, string> = {
    basura: '🗑️',
    alumbrado: '💡',
    limpieza: '🌿',
    veredas: '🛣️',
    seguridad: '🔒',
}

export function getCategoryIcon(slug: string | null | undefined): string {
    if (!slug) return '❓'
    return CATEGORY_ICONS[slug.toLowerCase()] || '📋'
}
