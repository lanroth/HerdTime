import { useState } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { ArrowLeft, Copy, Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { usePoll } from '@/hooks/usePoll'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { toast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'

export function AdminPage() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const adminToken = searchParams.get('token')

  const { data: poll, isLoading, error } = usePoll(id)

  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [addingDates, setAddingDates] = useState(false)
  const [newDates, setNewDates] = useState<Date[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = (user && poll?.creator_id === user.id) || !!adminToken

  const shareUrl = `${window.location.origin}${window.location.pathname}${window.location.hash.replace('/admin', '')}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl)
    toast({ title: 'Poll link copied!' })
  }

  const startEdit = () => {
    setTitle(poll!.title)
    setDescription(poll!.description ?? '')
    setDeadline(poll!.deadline ?? '')
    setEditing(true)
  }

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (adminToken) {
        await supabase.rpc('update_poll_as_admin', {
          p_poll_id: id!,
          p_admin_token: adminToken,
          p_title: title,
          p_description: description || null,
          p_deadline: deadline || null,
        })
      } else {
        const { error } = await supabase
          .from('polls')
          .update({ title, description: description || null, deadline: deadline || null })
          .eq('id', id!)
        if (error) throw error
      }
      await queryClient.invalidateQueries({ queryKey: ['poll', id] })
      setEditing(false)
      toast({ title: 'Poll updated' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const addDates = async () => {
    if (newDates.length === 0) return
    setSaving(true)
    try {
      for (const d of newDates) {
        if (adminToken) {
          await supabase.rpc('add_poll_date_as_admin', {
            p_poll_id: id!,
            p_admin_token: adminToken,
            p_date: format(d, 'yyyy-MM-dd'),
          })
        } else {
          await supabase.from('poll_dates').insert({ poll_id: id!, date: format(d, 'yyyy-MM-dd') })
        }
      }
      await queryClient.invalidateQueries({ queryKey: ['poll', id] })
      setNewDates([])
      setAddingDates(false)
      toast({ title: 'Dates added' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const removeDate = async (dateId: string) => {
    try {
      if (adminToken) {
        await supabase.rpc('remove_poll_date_as_admin', {
          p_poll_id: id!,
          p_admin_token: adminToken,
          p_date_id: dateId,
        })
      } else {
        const { error } = await supabase.from('poll_dates').delete().eq('id', dateId)
        if (error) throw error
      }
      await queryClient.invalidateQueries({ queryKey: ['poll', id] })
      toast({ title: 'Date removed' })
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown', variant: 'destructive' })
    }
  }

  const deletePoll = async () => {
    if (!confirm('Delete this poll? This cannot be undone.')) return
    setDeleting(true)
    try {
      if (adminToken) {
        await supabase.rpc('delete_poll_as_admin', { p_poll_id: id!, p_admin_token: adminToken })
      } else {
        const { error } = await supabase.from('polls').delete().eq('id', id!)
        if (error) throw error
      }
      toast({ title: 'Poll deleted' })
      navigate('/')
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'Unknown', variant: 'destructive' })
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Poll not found</h2>
        <Button asChild><Link to="/">Go home</Link></Button>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold mb-2">Access denied</h2>
        <p className="text-muted-foreground mb-6">You don't have permission to manage this poll.</p>
        <Button asChild><Link to={`/poll/${id}`}>View poll</Link></Button>
      </div>
    )
  }

  const sortedDates = [...poll.poll_dates].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/poll/${id}`}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to poll
          </Link>
        </Button>
      </div>

      {/* Share */}
      <Card>
        <CardHeader>
          <CardTitle>Share this poll</CardTitle>
          <CardDescription>Send this link to participants so they can respond.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={shareUrl} readOnly className="font-mono text-sm" />
            <Button variant="outline" onClick={copyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Poll details</CardTitle>
            {!editing && (
              <Button variant="outline" size="sm" onClick={startEdit}>Edit</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={saveEdit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-title">Title *</Label>
                <Input id="admin-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-desc">Description</Label>
                <Textarea id="admin-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="admin-deadline">Response deadline</Label>
                <Input id="admin-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Title</dt>
              <dd className="font-medium">{poll.title}</dd>
              {poll.description && (
                <>
                  <dt className="text-muted-foreground">Description</dt>
                  <dd>{poll.description}</dd>
                </>
              )}
              {poll.deadline && (
                <>
                  <dt className="text-muted-foreground">Deadline</dt>
                  <dd>{format(parseISO(poll.deadline), 'MMM d, yyyy')}</dd>
                </>
              )}
            </dl>
          )}
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Date options</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setAddingDates((v) => !v)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add dates
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {addingDates && (
            <div className="border rounded-lg p-4 flex flex-col gap-3">
              <DayPicker
                mode="multiple"
                selected={newDates}
                onSelect={(dates) => setNewDates(dates ?? [])}
                disabled={[
                  { before: new Date() },
                  ...sortedDates.map((d) => parseISO(d.date)),
                ]}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addDates} disabled={saving || newDates.length === 0}>
                  {saving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Add {newDates.length > 0 ? `${newDates.length} date${newDates.length !== 1 ? 's' : ''}` : 'dates'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setAddingDates(false); setNewDates([]) }}>Cancel</Button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {sortedDates.map((d) => (
              <Badge key={d.id} variant="secondary" className="gap-1.5 pl-3 pr-2 py-1">
                {format(parseISO(d.date), 'EEE, MMM d')}
                <button
                  onClick={() => removeDate(d.id)}
                  className="ml-0.5 rounded-full hover:bg-destructive/20 p-0.5 transition-colors"
                  title="Remove date"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Delete this poll</p>
              <p className="text-sm text-muted-foreground">This action is permanent and cannot be undone.</p>
            </div>
            <Button variant="destructive" size="sm" onClick={deletePoll} disabled={deleting}>
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete poll
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
