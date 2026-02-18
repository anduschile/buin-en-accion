
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function normalizeTrafficLevel(level: string | null | undefined): 'low' | 'medium' | 'high' {
    if (!level) return 'low'
    switch (level) {
        case 'critical':
        case 'high': return 'high'
        case 'medium': return 'medium'
        case 'low':
        default: return 'low'
    }
}
