
import { z } from 'zod'

export const itemSchema = z.object({
    title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
    latitude: z.number(),
    longitude: z.number(),
    category_id: z.string().uuid('Categoría inválida'),
    traffic_level: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    evidence_path: z.string().optional(),
})

export const updateSchema = z.object({
    content: z.string().min(5, 'El contenido debe tener al menos 5 caracteres'),
    source_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

export type ItemFormData = z.infer<typeof itemSchema>
export type UpdateFormData = z.infer<typeof updateSchema>
