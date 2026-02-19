'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export default function ImagePreviewDialog({
    open,
    onOpenChange,
    url,
    title,
}: {
    open: boolean
    onOpenChange: (v: boolean) => void
    url: string | null
    title?: string
}) {
    if (!url) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black border-zinc-800">
                <DialogHeader className="sr-only">
                    <DialogTitle>{title ?? 'Evidencia'}</DialogTitle>
                    <DialogDescription>Vista previa de la imagen</DialogDescription>
                </DialogHeader>

                <div className="relative flex items-center justify-center min-h-[50vh] max-h-[85vh] bg-black/90">
                    <img
                        src={url}
                        alt={title ?? 'Evidencia'}
                        className="w-full h-full object-contain max-h-[80vh]"
                    />

                    <div className="absolute bottom-4 right-4">
                        <Button variant="secondary" size="sm" asChild>
                            <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                                <ExternalLink className="h-4 w-4" />
                                Abrir original
                            </a>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
