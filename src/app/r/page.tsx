
import { redirect } from 'next/navigation'

interface PageProps {
    searchParams: Promise<{ code?: string; t?: string }>
}

/**
 * /r?code=BUIN-... → redirect to /r/BUIN-...
 * This handles the Home page track-by-code form (GET form submit).
 */
export default async function RRedirectPage({ searchParams }: PageProps) {
    const { code, t } = await searchParams

    if (code && code.trim()) {
        const tokenQuery = t ? `?t=${encodeURIComponent(t)}` : ''
        redirect(`/r/${encodeURIComponent(code.trim())}${tokenQuery}`)
    }

    redirect('/')
}
