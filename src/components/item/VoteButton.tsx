
'use client'

import { voteItem } from '@/lib/actions/items'
import { Button } from '@/components/ui/button'
import { ArrowUp } from 'lucide-react'
import { useTransition } from 'react'

export default function VoteButton({ itemId, initialVotes, hasVoted }: { itemId: string, initialVotes: number, hasVoted: boolean }) {
    const [isPending, startTransition] = useTransition()

    const handleVote = () => {
        startTransition(async () => {
            await voteItem(itemId)
        })
    }

    return (
        <Button
            onClick={handleVote}
            disabled={isPending}
            variant={hasVoted ? "default" : "outline"}
            className={`gap-2 ${hasVoted ? 'bg-green-600 hover:bg-green-700' : ''}`}
        >
            <ArrowUp className="h-4 w-4" />
            {hasVoted ? 'Votado' : 'Votar Prioridad'}
            <span className="ml-1 font-bold">{initialVotes}</span>
        </Button>
    )
}
