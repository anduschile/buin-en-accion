'use client'

import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface Category {
    id: string
    name: string
    slug: string
    icon: string
}

interface CategorySelectorProps {
    categories: Category[]
    message?: string
}

export default function CategorySelector({ categories, message }: CategorySelectorProps) {
    const [showSecurityModal, setShowSecurityModal] = useState(false)

    if (categories.length === 0) {
        return (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 border-2 border-dashed rounded-2xl">
                <p className="text-zinc-500">No se pudieron cargar las categorías.</p>
                <Link href="/" className="text-blue-600 text-sm mt-4 inline-block hover:underline">Refrescar página</Link>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {message && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 rounded-xl text-sm italic">
                    {message}
                </div>
            )}
            <h2 className="text-xl font-bold text-center">¿Sobre qué quieres informar?</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {categories.map((cat) => {
                    const isSecurity = cat.slug === 'seguridad'

                    if (isSecurity) {
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setShowSecurityModal(true)}
                                className="group flex items-center gap-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 rounded-2xl p-5 transition-all text-left"
                            >
                                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                                <div>
                                    <span className="font-bold block text-zinc-800 dark:text-zinc-100">{cat.name}</span>
                                    <span className="text-xs text-zinc-400">Situaciones no urgentes</span>
                                </div>
                            </button>
                        )
                    }

                    return (
                        <Link
                            key={cat.id}
                            href={`/reportar?cat=${cat.slug}`}
                            className="group flex items-center gap-4 bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 rounded-2xl p-5 transition-all"
                        >
                            <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                            <div>
                                <span className="font-bold block text-zinc-800 dark:text-zinc-100">{cat.name}</span>
                                <span className="text-xs text-zinc-400">Toca para reportar</span>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Security modal (reused logic) */}
            {showSecurityModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h2 className="font-bold text-lg">¿Es una emergencia?</h2>
                        </div>
                        <p className="text-sm text-zinc-500 mb-4">Para emergencias, llama directamente:</p>
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {[
                                { num: '133', label: 'Carabineros', emoji: '👮' },
                                { num: '131', label: 'SAMU', emoji: '🚑' },
                                { num: '132', label: 'Bomberos', emoji: '🚒' },
                            ].map(e => (
                                <a
                                    key={e.num}
                                    href={`tel:${e.num}`}
                                    className="flex flex-col items-center gap-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl p-3 hover:bg-amber-100 transition-colors"
                                >
                                    <span className="text-2xl">{e.emoji}</span>
                                    <span className="font-bold text-amber-700 dark:text-amber-300 text-lg">{e.num}</span>
                                    <span className="text-xs text-zinc-500 text-[10px]">{e.label}</span>
                                </a>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSecurityModal(false)}
                                className="flex-1 py-2.5 rounded-lg border text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <Link
                                href="/reportar?cat=seguridad"
                                onClick={() => setShowSecurityModal(false)}
                                className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium text-center hover:bg-blue-700 transition-colors"
                            >
                                Continuar
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
