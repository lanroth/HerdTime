import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { setVoterToken } from '@/lib/utils'
import type { VoteStatus } from '@/lib/database.types'

interface SubmitVoteArgs {
  pollId: string
  name: string
  comment: string
  selections: Record<string, VoteStatus> // poll_date_id -> status
  userId?: string
}

export function useSubmitVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ pollId, name, comment, selections, userId }: SubmitVoteArgs) => {
      // Insert participant
      const { data: participant, error: pErr } = await supabase
        .from('participants')
        .insert({ poll_id: pollId, name, comment: comment || null, voter_id: userId ?? null })
        .select()
        .single()
      if (pErr) throw pErr

      // Save voter_token for anonymous return-edit
      setVoterToken(pollId, participant.voter_token)

      // Insert votes
      const voteRows = Object.entries(selections).map(([poll_date_id, status]) => ({
        participant_id: participant.id,
        poll_date_id,
        status,
      }))
      if (voteRows.length > 0) {
        const { error: vErr } = await supabase.from('votes').insert(voteRows)
        if (vErr) throw vErr
      }

      return participant
    },
    onSuccess: (_data, { pollId }) => {
      void queryClient.invalidateQueries({ queryKey: ['participants', pollId] })
    },
  })
}

interface UpdateVoteArgs {
  participantId: string
  voterToken: string
  pollId: string
  name: string
  comment: string
  selections: Record<string, VoteStatus>
  userId?: string
}

export function useUpdateVote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ participantId, voterToken, name, comment, selections, userId }: UpdateVoteArgs) => {
      if (userId) {
        // Logged-in user: update directly via RLS
        const { error: pErr } = await supabase
          .from('participants')
          .update({ name, comment: comment || null })
          .eq('id', participantId)
          .eq('voter_id', userId)
        if (pErr) throw pErr

        for (const [poll_date_id, status] of Object.entries(selections)) {
          const { error } = await supabase
            .from('votes')
            .upsert({ participant_id: participantId, poll_date_id, status }, { onConflict: 'participant_id,poll_date_id' })
          if (error) throw error
        }
      } else {
        // Anonymous: use RPC with voter_token
        const { error: pErr } = await supabase.rpc('update_participant_as_voter', {
          p_participant_id: participantId,
          p_voter_token: voterToken,
          p_name: name,
          p_comment: comment || null,
        })
        if (pErr) throw pErr

        for (const [poll_date_id, status] of Object.entries(selections)) {
          const { error } = await supabase.rpc('upsert_vote_as_voter', {
            p_participant_id: participantId,
            p_voter_token: voterToken,
            p_poll_date_id: poll_date_id,
            p_status: status,
          })
          if (error) throw error
        }
      }
    },
    onSuccess: (_data, { pollId }) => {
      void queryClient.invalidateQueries({ queryKey: ['participants', pollId] })
    },
  })
}
