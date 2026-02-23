
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AlertTriangle, Phone } from 'lucide-react'

const CATEGORIES = [
    { slug: 'basura', icon: '🗑️', name: 'Basura', desc: 'Contenedores, microbasurales, escombros' },
    { slug: 'alumbrado', icon: '💡', name: 'Alumbrado público', desc: 'Luminarias quemadas o en mal estado' },
    { slug: 'limpieza', icon: '🌿', name: 'Limpieza / pasto', desc: 'Bandejones, pasto sin cortar, canales' },
    { slug: 'veredas', icon: '🛣️', name: 'Veredas / calles', desc: 'Baches, veredas rotas, pavimento' },
    { slug: 'seguridad', icon: '🔒', name: 'Seguridad', desc: 'Situaciones no urgentes de seguridad' },
]

export default function CategoryButtons() {
    const [showSecurityModal, setShowSecurityModal] = useState(false)

    return (
        <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto w-full px-4">
                {CATEGORIES.map((cat, i) => {
                    const isLast = i === CATEGORIES.length - 1
                    const isSecurity = cat.slug === 'seguridad'

                    if (isSecurity) {
                        return (
                            <button
                                key={cat.slug}
                                onClick={() => setShowSecurityModal(true)}
                                className={`col-span-2 sm:col-span-1 ${isLast ? 'sm:col-span-2 sm:max-w-xs sm:mx-auto sm:w-full' : ''} group flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 rounded-2xl p-5 transition-all duration-200 hover:shadow-md cursor-pointer`}
                            >
                                <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                                <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">{cat.name}</span>
                                <span className="text-xs text-zinc-400 text-center">{cat.desc}</span>
                            </button>
                        )
                    }

                    return (
                        <Link
                            key={cat.slug}
                            href={`/reportar?cat=${cat.slug}`}
                            className="group flex flex-col items-center gap-2 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 hover:border-blue-400 rounded-2xl p-5 transition-all duration-200 hover:shadow-md"
                        >
                            <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                            <span className="font-semibold text-sm text-zinc-800 dark:text-zinc-100">{cat.name}</span>
                            <span className="text-xs text-zinc-400 text-center">{cat.desc}</span>
                        </Link>
                    )
                })}
            </div>

            {/* Security modal */}
            {showSecurityModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-sm w-full p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h2 className="font-bold text-lg">¿Es una emergencia?</h2>
                        </div>

                        <p className="text-sm text-zinc-500 mb-4">
                            Para emergencias, llama directamente:
                        </p>

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
                                    <span className="text-xs text-zinc-500">{e.label}</span>
                                </a>
                            ))}
                        </div>

                        <p className="text-xs text-zinc-400 mb-5">
                            Esta plataforma es para situaciones <strong>no urgentes</strong> como iluminación deficiente en zonas oscuras, vandalismo sin heridos, etc.
                        </p>

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
                                Continuar con reporte
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
