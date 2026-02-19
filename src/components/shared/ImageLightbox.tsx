'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageLightboxProps {
    isOpen: boolean
    src: string | null
    alt?: string
    onClose: () => void
}

export default function ImageLightbox({
    isOpen,
    src,
    alt,
    onClose,
}: ImageLightboxProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Close on ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!mounted || !isOpen || !src) return null

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
            onClick={onClose} // Close on backdrop click
            role="dialog"
            aria-modal="true"
        >
            {/* Close button */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                }}
                className="absolute top-4 right-4 z-[100000] p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Cerrar"
            >
                <X className="h-8 w-8" />
            </button>

            {/* Content Container - Stops propagation to prevent closing when clicking image */}
            <div
                className="relative w-full h-full p-4 flex items-center justify-center pointer-events-none"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={src}
                    alt={alt ?? 'Evidencia'}
                    className="max-w-full max-h-full object-contain pointer-events-auto rounded shadow-2xl select-none"
                />
            </div>
        </div>,
        document.body
    )
}
