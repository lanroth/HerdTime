import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PollForm } from '@/components/PollForm'

export function CreatePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create a date poll</CardTitle>
          <CardDescription>
            Enter the event details, then pick the date options you'd like to offer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PollForm />
        </CardContent>
      </Card>
    </div>
  )
}
