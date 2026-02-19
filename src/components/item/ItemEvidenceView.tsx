'use client'

import { useState } from 'react'
import ImageLightbox from '@/components/shared/ImageLightbox'
import { ZoomIn } from 'lucide-react'

export default function ItemEvidenceView({
    src,
    alt
}: {
    src: string | null
    alt: string
}) {
    const [lightboxOpen, setLightboxOpen] = useState(false)

    if (!src) return null

    return (
        <>
            <div
                className="group relative rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border dark:border-zinc-700 shadow-sm cursor-pointer"
                onClick={() => setLightboxOpen(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-auto object-cover max-h-[500px] transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 text-zinc-900 px-4 py-2 rounded-full font-medium text-sm shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <ZoomIn className="h-4 w-4" />
                        Ver pantalla completa
                    </div>
                </div>
            </div>

            <ImageLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                src={src}
                alt={alt}
            />
        </>
    )
}
