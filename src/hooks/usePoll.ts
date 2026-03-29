import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ParticipantWithVotes, PollWithDates } from '@/lib/database.types'

export function usePoll(pollId: string | undefined) {
  return useQuery({
    queryKey: ['poll', pollId],
    enabled: !!pollId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*, poll_dates(*)')
        .eq('id', pollId!)
        .single()
      if (error) throw error
      return data as PollWithDates
    },
  })
}

export function usePollParticipants(pollId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['participants', pollId],
    enabled: !!pollId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*, votes(*)')
        .eq('poll_id', pollId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as ParticipantWithVotes[]
    },
  })

  // Subscribe to real-time changes
  useEffect(() => {
    if (!pollId) return
    const channel = supabase
      .channel(`poll-${pollId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants', filter: `poll_id=eq.${pollId}` }, () => {
        void queryClient.invalidateQueries({ queryKey: ['participants', pollId] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => {
        void queryClient.invalidateQueries({ queryKey: ['participants', pollId] })
      })
      .subscribe()
    return () => { void supabase.removeChannel(channel) }
  }, [pollId, queryClient])

  return query
}

export function useUserPolls(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-polls', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select('*, poll_dates(*)')
        .eq('creator_id', userId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as PollWithDates[]
    },
  })
}
