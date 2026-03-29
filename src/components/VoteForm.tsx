import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { Check, X, Minus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useSubmitVote, useUpdateVote } from '@/hooks/useVote'
import { toast } from '@/hooks/use-toast'
import type { VoteStatus, ParticipantWithVotes } from '@/lib/database.types'

interface VoteFormProps {
  pollId: string
  pollDates: Array<{ id: string; date: string }>
  userId?: string
  existingParticipant?: ParticipantWithVotes
  voterToken?: string
  onDone?: () => void
}

const STATUS_CYCLE: VoteStatus[] = ['yes', 'maybe', 'no']

function nextStatus(current: VoteStatus | undefined): VoteStatus {
  const idx = current ? STATUS_CYCLE.indexOf(current) : -1
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

const statusConfig: Record<VoteStatus, { icon: React.ReactNode; label: string; classes: string }> = {
  yes: {
    icon: <Check className="h-4 w-4" />,
    label: 'Yes',
    classes: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200',
  },
  maybe: {
    icon: <Minus className="h-4 w-4" />,
    label: 'Maybe',
    classes: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200',
  },
  no: {
    icon: <X className="h-4 w-4" />,
    label: 'No',
    classes: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200',
  },
}

export function VoteForm({ pollId, pollDates, userId, existingParticipant, voterToken, onDone }: VoteFormProps) {
  const isEditing = !!existingParticipant

  const initialSelections = isEditing
    ? Object.fromEntries(existingParticipant.votes.map((v) => [v.poll_date_id, v.status as VoteStatus]))
    : Object.fromEntries(pollDates.map((d) => [d.id, 'yes' as VoteStatus]))

  const [name, setName] = useState(existingParticipant?.name ?? '')
  const [comment, setComment] = useState(existingParticipant?.comment ?? '')
  const [selections, setSelections] = useState<Record<string, VoteStatus>>(initialSelections)

  const submitVote = useSubmitVote()
  const updateVote = useUpdateVote()

  const isLoading = submitVote.isPending || updateVote.isPending

  const toggleDate = (dateId: string) => {
    setSelections((prev) => ({ ...prev, [dateId]: nextStatus(prev[dateId]) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    try {
      if (isEditing && existingParticipant && voterToken) {
        await updateVote.mutateAsync({
          participantId: existingParticipant.id,
          voterToken,
          pollId,
          name: name.trim(),
          comment,
          selections,
          userId,
        })
        toast({ title: 'Response updated!' })
      } else {
        await submitVote.mutateAsync({ pollId, name: name.trim(), comment, selections, userId })
        toast({ title: 'Response submitted!' })
      }
      onDone?.()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save response',
        variant: 'destructive',
      })
    }
  }

  const sortedDates = [...pollDates].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="voter-name">Your name *</Label>
        <Input
          id="voter-name"
          placeholder="Jane Smith"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus={!isEditing}
        />
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Your availability</p>
        <p className="text-xs text-muted-foreground mb-3">
          Click to cycle through: Yes → Maybe → No
        </p>
        <div className="flex flex-wrap gap-2">
          {sortedDates.map((d) => {
            const status = selections[d.id] ?? 'yes'
            const cfg = statusConfig[status]
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleDate(d.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  cfg.classes
                )}
              >
                {cfg.icon}
                {format(parseISO(d.date), 'EEE, MMM d')}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="comment">Comment (optional)</Label>
        <Textarea
          id="comment"
          placeholder="Any notes or constraints…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={isLoading || !name.trim()}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Update response' : 'Submit response'}
      </Button>
    </form>
  )
}
