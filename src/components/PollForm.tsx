import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { CalendarIcon, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { setAdminToken } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/useAuth'

type Step = 'details' | 'dates'

export function PollForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('details')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setStep('dates')
  }

  const handleSubmit = async () => {
    if (selectedDates.length === 0) {
      toast({ title: 'Please select at least one date', variant: 'destructive' })
      return
    }
    setSubmitting(true)
    try {
      const { data: poll, error: pollErr } = await supabase
        .from('polls')
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          creator_id: user?.id ?? null,
          deadline: deadline || null,
        })
        .select()
        .single()
      if (pollErr) throw pollErr

      const dateRows = selectedDates.map((d) => ({
        poll_id: poll.id,
        date: format(d, 'yyyy-MM-dd'),
      }))
      const { error: datesErr } = await supabase.from('poll_dates').insert(dateRows)
      if (datesErr) throw datesErr

      // Save admin token locally
      setAdminToken(poll.id, poll.admin_token)

      navigate(`/poll/${poll.id}/admin?token=${poll.admin_token}`)
    } catch (err) {
      toast({
        title: 'Error creating poll',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime())

  if (step === 'dates') {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-semibold">Pick dates for "{title}"</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Click dates to select them. Click again to deselect.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="flex-1">
            <CardContent className="pt-4">
              <DayPicker
                mode="multiple"
                selected={selectedDates}
                onSelect={(dates) => setSelectedDates(dates ?? [])}
                disabled={{ before: new Date() }}
                classNames={{
                  today: 'font-bold text-primary',
                  selected: 'bg-primary text-primary-foreground rounded-full',
                  day_button: 'w-9 h-9 rounded-full hover:bg-accent transition-colors',
                }}
              />
            </CardContent>
          </Card>

          <div className="lg:w-64 flex flex-col gap-4">
            <div>
              <p className="text-sm font-medium mb-2">
                {selectedDates.length === 0
                  ? 'No dates selected yet'
                  : `${selectedDates.length} date${selectedDates.length !== 1 ? 's' : ''} selected`}
              </p>
              <div className="flex flex-wrap gap-2">
                {sortedDates.map((d) => (
                  <Badge
                    key={d.toISOString()}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedDates((prev) => prev.filter((x) => x.toISOString() !== d.toISOString()))
                    }
                  >
                    {format(d, 'MMM d')} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <Button variant="outline" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={submitting || selectedDates.length === 0}>
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating poll…</>
                ) : (
                  'Create poll'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleNext} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Poll title *</Label>
        <Input
          id="title"
          placeholder="e.g. Team dinner, Birthday party…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Any extra details for respondents…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="deadline" className="flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5" />
          Response deadline (optional)
        </Label>
        <Input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          min={format(new Date(), 'yyyy-MM-dd')}
        />
      </div>

      <Button type="submit" className="self-end" disabled={!title.trim()}>
        Next: pick dates <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  )
}
