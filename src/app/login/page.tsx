'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Mail, AlertCircle, CheckCircle2, Timer } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [cooldown, setCooldown] = useState<number>(0)

    useEffect(() => {
        const stored = localStorage.getItem('pea_login_cooldown_until')
        if (stored) {
            const until = parseInt(stored, 10)
            const remaining = Math.ceil((until - Date.now()) / 1000)
            if (remaining > 0) {
                setCooldown(remaining)
            } else {
                localStorage.removeItem('pea_login_cooldown_until')
            }
        }
    }, [])

    useEffect(() => {
        if (cooldown <= 0) return

        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    localStorage.removeItem('pea_login_cooldown_until')
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [cooldown])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (cooldown > 0) return

        setLoading(true)
        setMessage('')
        setError('')

        const supabase = createClient()
        try {
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${siteUrl}/auth/callback`,
                },
            })

            if (error) {
                console.error('OTP error', error)
                if (error.status === 429 || error.message.toLowerCase().includes('rate limit')) {
                    setError('Demasiados intentos. Espera un momento y vuelve a intentar.')
                    // Ensure cooldown helps preventing spam even if server rejected
                    const cooldownTime = 60 // 60 seconds
                    const until = Date.now() + (cooldownTime * 1000)
                    localStorage.setItem('pea_login_cooldown_until', until.toString())
                    setCooldown(cooldownTime)
                } else {
                    setError(error.message)
                }
            } else {
                setMessage('Listo. Revisa tu bandeja de entrada y spam.')
                const cooldownTime = 60 // 60 seconds
                const until = Date.now() + (cooldownTime * 1000)
                localStorage.setItem('pea_login_cooldown_until', until.toString())
                setCooldown(cooldownTime)
            }
        } catch (err: any) {
            console.error('Unexpected login error:', err)
            setError(err.message || 'Ocurrió un error inesperado.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Ingresar para reportar</h2>
                    <p className="text-sm text-zinc-500 mt-2">
                        Te enviaremos un enlace de acceso a tu correo. Sin contraseñas.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            disabled={loading || cooldown > 0}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-800"
                            placeholder="tu@email.com"
                        />
                    </div>

                    {message && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex gap-3 items-start">
                            <CheckCircle2 className="h-5 w-5 shrink-0" />
                            <span>{message}</span>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm flex gap-3 items-start">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold">Error al ingresar:</span>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <Button
                            type="submit"
                            className="w-full h-12 text-base gap-2 transition-all"
                            disabled={loading || cooldown > 0}
                        >
                            {cooldown > 0 ? (
                                <>
                                    <Timer className="h-4 w-4 animate-pulse" />
                                    <span>Reintentar en {cooldown}s</span>
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4" />
                                    {loading ? 'Enviando...' : 'Enviar enlace de acceso'}
                                </>
                            )}
                        </Button>
                        <p className="text-center text-xs text-zinc-500">
                            Haz clic para recibir el enlace en tu correo
                        </p>
                    </div>
                </form>
            </div>

            {/* Dev Helper - Only in Development */}
            {process.env.NODE_ENV !== 'production' && (
                <div className="mt-8 p-4 max-w-md bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                    <p className="font-bold mb-2">🔧 Ayuda para Desarrolladores (Dev Mode)</p>
                    <p className="mb-1">Si falla, revisa en Supabase: <strong>Authentication → URL Configuration</strong>:</p>
                    <ul className="list-disc list-inside space-y-1 ml-1">
                        <li>Site URL: <code>http://localhost:3000</code></li>
                        <li>Redirect URLs: <code>http://localhost:3000/auth/callback</code></li>
                    </ul>
                </div>
            )}
        </div>
    )
}
