import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { CalendarDays, Copy, Loader2, Pencil, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VoteGrid } from '@/components/VoteGrid'
import { VoteForm } from '@/components/VoteForm'
import { usePoll, usePollParticipants } from '@/hooks/usePoll'
import { useAuth } from '@/hooks/useAuth'
import { getVoterToken, getAdminToken } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

export function PollPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: poll, isLoading: pollLoading, error: pollError } = usePoll(id)
  const { data: participants = [], isLoading: partLoading } = usePollParticipants(id)

  const [showVoteForm, setShowVoteForm] = useState(false)

  const voterToken = id ? getVoterToken(id) : null
  const adminToken = id ? getAdminToken(id) : null

  const myParticipant = participants.find((p) => {
    if (user && p.voter_id === user.id) return true
    if (voterToken && p.voter_token === voterToken) return true
    return false
  })

  const shareUrl = window.location.href

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    toast({ title: 'Link copied!' })
  }

  if (pollLoading || partLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (pollError || !poll) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Poll not found</h2>
        <p className="text-muted-foreground mb-6">
          This poll may have been deleted or the link is incorrect.
        </p>
        <Button asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    )
  }

  const sortedDates = [...poll.poll_dates].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription className="mt-1 text-base">{poll.description}</CardDescription>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline" className="gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {sortedDates.length} date{sortedDates.length !== 1 ? 's' : ''}
                </Badge>
                {poll.deadline && (
                  <Badge variant="outline">
                    Closes {format(parseISO(poll.deadline), 'MMM d, yyyy')}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(adminToken || (user && poll.creator_id === user.id)) && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/poll/${id}/admin${adminToken ? `?token=${adminToken}` : ''}`}>
                    <Settings className="mr-1.5 h-3.5 w-3.5" />
                    Manage
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                Copy link
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <VoteGrid dates={poll.poll_dates} participants={participants} />
        </CardContent>
      </Card>

      {/* Vote / Edit */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {myParticipant ? 'Your response' : 'Add your response'}
            </CardTitle>
            {myParticipant && !showVoteForm && (
              <Button variant="outline" size="sm" onClick={() => setShowVoteForm(true)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {myParticipant && !showVoteForm ? (
            <div className="text-sm text-muted-foreground">
              You responded as <span className="font-medium text-foreground">{myParticipant.name}</span>.
              {myParticipant.comment && (
                <span> You left a comment: "{myParticipant.comment}"</span>
              )}
            </div>
          ) : (
            <>
              {myParticipant && (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Editing your response as <span className="font-medium">{myParticipant.name}</span>.
                  </p>
                  <Separator className="mb-4" />
                </>
              )}
              <VoteForm
                pollId={poll.id}
                pollDates={sortedDates}
                userId={user?.id}
                existingParticipant={myParticipant}
                voterToken={voterToken ?? undefined}
                onDone={() => setShowVoteForm(false)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
