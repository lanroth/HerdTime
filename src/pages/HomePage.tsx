import { Link } from 'react-router-dom'
import { ArrowRight, CalendarCheck, Share2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-3xl px-4 pt-20 pb-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Find a time that works{' '}
          <span className="text-primary">for everyone</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Create a free date poll, share it with your group, and instantly see which
          dates work best. No account needed.
        </p>
        <Button size="lg" asChild>
          <Link to="/create">
            Create a poll <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* How it works */}
      <section className="w-full max-w-4xl px-4 pb-20">
        <h2 className="text-2xl font-semibold text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">1. Create a poll</h3>
              <p className="text-sm text-muted-foreground">
                Enter a title and select the dates you want to offer as options.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">2. Share the link</h3>
              <p className="text-sm text-muted-foreground">
                Copy the link and share it with your group via chat, email, or wherever.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">3. Find the best date</h3>
              <p className="text-sm text-muted-foreground">
                Watch responses roll in and see at a glance which date suits everyone.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
