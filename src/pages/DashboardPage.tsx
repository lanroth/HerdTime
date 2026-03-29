import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { CalendarDays, Loader2, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/hooks/useAuth'
import { useUserPolls } from '@/hooks/usePoll'

export function DashboardPage() {
  const { user, loading } = useAuth()
  const { data: polls = [], isLoading } = useUserPolls(user?.id)
  const [authOpen, setAuthOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Sign in to see your polls</h2>
        <p className="text-muted-foreground mb-6">
          Your dashboard shows polls you created while signed in. Anonymous polls are accessed via their manage link.
        </p>
        <Button onClick={() => setAuthOpen(true)}>Sign in</Button>
        <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My polls</h1>
        <Button asChild>
          <Link to="/create">
            <Plus className="mr-1.5 h-4 w-4" />
            New poll
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : polls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center gap-4">
            <CalendarDays className="h-12 w-12 text-muted-foreground/40" />
            <div>
              <p className="font-medium">No polls yet</p>
              <p className="text-sm text-muted-foreground">Create your first poll to get started.</p>
            </div>
            <Button asChild>
              <Link to="/create">Create a poll</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {polls.map((poll) => (
            <Card key={poll.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">
                      <Link to={`/poll/${poll.id}`} className="hover:underline">
                        {poll.title}
                      </Link>
                    </CardTitle>
                    {poll.description && (
                      <CardDescription className="mt-0.5 truncate">{poll.description}</CardDescription>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/poll/${poll.id}/admin`}>
                      <Settings className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0 flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {poll.poll_dates.length} date{poll.poll_dates.length !== 1 ? 's' : ''}
                </Badge>
                {poll.deadline && (
                  <Badge variant="outline">
                    Closes {format(parseISO(poll.deadline), 'MMM d')}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  Created {format(parseISO(poll.created_at), 'MMM d, yyyy')}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
