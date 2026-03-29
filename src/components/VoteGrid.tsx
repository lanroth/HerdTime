import { format, parseISO } from 'date-fns'
import { Check, Minus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ParticipantWithVotes, VoteStatus } from '@/lib/database.types'

interface VoteGridProps {
  dates: Array<{ id: string; date: string }>
  participants: ParticipantWithVotes[]
}

const statusConfig: Record<VoteStatus, { icon: React.ReactNode; bg: string; text: string }> = {
  yes: {
    icon: <Check className="h-3.5 w-3.5" />,
    bg: 'bg-green-100',
    text: 'text-green-700',
  },
  maybe: {
    icon: <Minus className="h-3.5 w-3.5" />,
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
  },
  no: {
    icon: <X className="h-3.5 w-3.5" />,
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
}

export function VoteGrid({ dates, participants }: VoteGridProps) {
  const sortedDates = [...dates].sort((a, b) => a.date.localeCompare(b.date))

  if (participants.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No responses yet. Share this poll to get started!
      </p>
    )
  }

  // Count yes+maybe per date
  const bestDates = sortedDates.map((d) => {
    const yesMaybe = participants.filter((p) => {
      const v = p.votes.find((v) => v.poll_date_id === d.id)
      return v?.status === 'yes' || v?.status === 'maybe'
    }).length
    const yes = participants.filter((p) => {
      const v = p.votes.find((v) => v.poll_date_id === d.id)
      return v?.status === 'yes'
    }).length
    return { id: d.id, yesMaybe, yes }
  })

  const maxYes = Math.max(...bestDates.map((d) => d.yes))

  return (
    <div className="overflow-x-auto">
      <table className="text-sm">
        <thead>
          <tr>
            <th className="text-left font-medium text-muted-foreground pr-4 py-2 min-w-[120px]">
              Participant
            </th>
            {sortedDates.map((d) => {
              const stats = bestDates.find((b) => b.id === d.id)!
              const isBest = maxYes > 0 && stats.yes === maxYes
              return (
                <th
                  key={d.id}
                  className={cn(
                    'px-2 py-2 text-center font-medium min-w-[80px]',
                    isBest && 'text-green-700'
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(d.date), 'EEE')}
                    </span>
                    <span>{format(parseISO(d.date), 'MMM d')}</span>
                    {isBest && (
                      <span className="text-[10px] font-normal bg-green-100 text-green-700 rounded px-1 mt-0.5">
                        Best
                      </span>
                    )}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="pr-4 py-2 font-medium">
                <div>
                  {p.name}
                  {p.comment && (
                    <p className="text-xs font-normal text-muted-foreground truncate max-w-[150px]" title={p.comment}>
                      "{p.comment}"
                    </p>
                  )}
                </div>
              </td>
              {sortedDates.map((d) => {
                const vote = p.votes.find((v) => v.poll_date_id === d.id)
                const status: VoteStatus = vote?.status ?? 'no'
                const cfg = statusConfig[status]
                return (
                  <td key={d.id} className="px-2 py-2 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center justify-center w-7 h-7 rounded-full',
                        cfg.bg,
                        cfg.text
                      )}
                    >
                      {cfg.icon}
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}

          {/* Summary row */}
          <tr className="border-t bg-muted/30">
            <td className="pr-4 py-2 text-xs font-semibold text-muted-foreground">
              {participants.length} response{participants.length !== 1 ? 's' : ''}
            </td>
            {bestDates.map((d) => (
              <td key={d.id} className="px-2 py-2 text-center text-xs">
                <span className="text-green-700 font-medium">{d.yes}</span>
                {d.yesMaybe > d.yes && (
                  <span className="text-muted-foreground"> (+{d.yesMaybe - d.yes})</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
