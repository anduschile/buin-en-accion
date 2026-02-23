'use client'

import React, { useState } from 'react'
import { Check, Copy, ChevronDown, ChevronUp, User, Phone, Mail, Save, Loader2, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface VoucherClientProps {
    code: string
    token: string
    categoryName: string | null
    categoryIcon: string | null
    routeHint: string | null
    status: string
    initialContact?: {
        name: string
        phone: string
        email: string
    }
}

export default function VoucherClient({
    code,
    token,
    categoryName,
    categoryIcon,
    routeHint,
    status,
    initialContact = { name: '', phone: '', email: '' }
}: VoucherClientProps) {
    const [copied, setCopied] = useState(false)
    const [linkCopied, setLinkCopied] = useState(false)

    // Contact form state
    const [isContactOpen, setIsContactOpen] = useState(false)
    const [contact, setContact] = useState(initialContact)
    const [isSaving, setIsSaving] = useState(false)
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const supabase = createClient()
    const privateLink = typeof window !== 'undefined' ? `${window.location.origin}/voucher?code=${code}&t=${token}` : ''

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch { }
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(privateLink)
            setLinkCopied(true)
            setTimeout(() => setLinkCopied(false), 2000)
        } catch { }
    }

    const handleSaveContact = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        setErrorMsg('')
        setSaveStatus('idle')

        if (process.env.NODE_ENV === 'development') {
            console.log('[contact] starting update...', { code, token, contact })
        }

        // Simple validation
        if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
            setErrorMsg('Email inválido')
            setIsSaving(false)
            return
        }

        try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('update_buin_report_contact_by_token', {
                p_code: code,
                p_token: token,
                p_contact_name: contact.name.trim() || null,
                p_contact_phone: contact.phone.trim() || null,
                p_contact_email: contact.email.trim() || null
            })

            console.log('[contact] update rpc result:', { data: rpcData, error: rpcError })

            if (rpcError) {
                setErrorMsg(rpcError.message)
                setSaveStatus('error')
                return
            }

            if (rpcData === true) {
                setErrorMsg('') // CLEAR ERROR ALWAYS ON SUCCESS
                setSaveStatus('success')
                console.log('[contact] success set to true')
                // Note: No automatic refetch here to avoid RLS false errors
                setTimeout(() => setSaveStatus('idle'), 3000)
            } else {
                setErrorMsg('Enlace inválido o reporte no encontrado')
                setSaveStatus('error')
                console.log('[contact] data was not true:', rpcData)
            }
        } catch (err: any) {
            console.error('[contact] update rpc exception:', err)
            setErrorMsg(err.message || 'Error inesperado')
            setSaveStatus('error')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Success icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-5">
                        <CheckCircle className="h-14 w-14 text-green-600 dark:text-green-400" />
                    </div>
                </div>

                <h1 className="text-3xl font-extrabold text-center mb-1">¡Reporte Recibido!</h1>
                <p className="text-center text-zinc-500 text-sm mb-1">
                    Tu reporte está en revisión. Guarda este código y enlace para seguimiento privado.
                </p>
                <p className="text-center text-amber-600 dark:text-amber-500 text-[10px] font-bold uppercase mb-8">
                    ⚠️ Este enlace es privado. No lo compartas.
                </p>

                {/* Voucher card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg p-6 mb-6">
                    {/* Category */}
                    {categoryName && (
                        <div className="flex items-center gap-2 mb-4 text-sm text-zinc-500">
                            <span className="text-xl">{categoryIcon}</span>
                            <span className="font-semibold">{categoryName}</span>
                        </div>
                    )}

                    {/* Code */}
                    <div className="text-center mb-4">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                            Tu código de seguimiento
                        </p>
                        <div className="flex items-center justify-center gap-2 group">
                            <div className="font-mono text-2xl font-extrabold tracking-widest text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-xl py-4 px-6 border border-blue-200 dark:border-blue-700 w-full">
                                {code}
                            </div>
                            <button
                                onClick={copyCode}
                                className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-400 hover:text-blue-600 border border-transparent hover:border-blue-200"
                                title="Copiar código"
                            >
                                {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-500">Estado</span>
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                <span className="font-bold text-amber-600 uppercase text-xs">
                                    {status === 'pending' ? 'Pendiente' : status}
                                </span>
                            </div>
                        </div>
                        {routeHint && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-200">
                                <span className="font-bold mr-1">Ruta sugerida:</span> {routeHint}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact Edit Section (Collapsible) */}
                <div className="w-full bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6 transition-all shadow-sm">
                    <button
                        onClick={() => setIsContactOpen(!isContactOpen)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">Datos de contacto</h3>
                                <p className="text-[10px] text-zinc-500 italic">Opcional para recibir actualizaciones</p>
                            </div>
                        </div>
                        {isContactOpen ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />}
                    </button>

                    {isContactOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-zinc-50 dark:border-zinc-800/50">
                            <form onSubmit={handleSaveContact} className="space-y-3">
                                <div className="space-y-2">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                                            <User className="h-3.5 w-3.5" />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Nombre completo"
                                            className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            value={contact.name}
                                            onChange={e => setContact({ ...contact, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                                                <Phone className="h-3.5 w-3.5" />
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="Teléfono"
                                                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                value={contact.phone}
                                                onChange={e => setContact({ ...contact, phone: e.target.value.replace(/[^0-9+]/g, '') })}
                                            />
                                        </div>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                                                <Mail className="h-3.5 w-3.5" />
                                            </div>
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                                value={contact.email}
                                                onChange={e => setContact({ ...contact, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {errorMsg && (
                                    <p className="text-[10px] text-red-500 font-bold px-1">{errorMsg}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${saveStatus === 'success'
                                        ? 'bg-green-500 text-white shadow-green-100 dark:shadow-none'
                                        : 'bg-zinc-900 dark:bg-white dark:text-black text-white hover:opacity-90'
                                        } disabled:opacity-50`}
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : saveStatus === 'success' ? (
                                        <><Check className="h-3.5 w-3.5" /> Cambios guardados</>
                                    ) : (
                                        <><Save className="h-3.5 w-3.5" /> Guardar datos</>
                                    )}
                                </button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Private Link Section */}
                <div className="mb-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 text-center">
                        Enlace de seguimiento privado
                    </p>
                    <div className="bg-zinc-100 dark:bg-zinc-800/50 p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-[10px] font-mono break-all text-zinc-500 dark:text-zinc-400 mb-4 text-center">
                        {privateLink}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={copyLink}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            {linkCopied ? (
                                <><Check className="h-5 w-5" /> ¡Enlace copiado!</>
                            ) : (
                                <><Copy className="h-5 w-5" /> Copiar enlace privado</>
                            )}
                        </button>

                        <div className="flex gap-2">
                            <Link href={`/r/${encodeURIComponent(code)}?t=${token}`} className="flex-1">
                                <Button variant="outline" className="w-full flex items-center gap-2 rounded-2xl py-6 border-zinc-200 dark:border-zinc-800">
                                    <ExternalLink className="h-4 w-4 text-zinc-400" />
                                    <span className="text-xs">Ver reporte</span>
                                </Button>
                            </Link>
                            <Link href="/" className="flex-1">
                                <Button variant="ghost" className="w-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-medium py-6">
                                    Finalizar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <div className="text-center">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                        Buin en Acción
                    </p>
                </div>
            </div>
        </div>
    )
}
