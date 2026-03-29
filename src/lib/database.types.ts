export type VoteStatus = 'yes' | 'no' | 'maybe'

export interface Database {
  public: {
    PostgrestVersion: '12'
    Tables: {
      polls: {
        Row: {
          id: string
          title: string
          description: string | null
          creator_id: string | null
          admin_token: string
          deadline: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          creator_id?: string | null
          admin_token?: string
          deadline?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          deadline?: string | null
        }
        Relationships: []
      }
      poll_dates: {
        Row: {
          id: string
          poll_id: string
          date: string
        }
        Insert: {
          id?: string
          poll_id: string
          date: string
        }
        Update: {
          date?: string
        }
        Relationships: [
          {
            foreignKeyName: 'poll_dates_poll_id_fkey'
            columns: ['poll_id']
            isOneToOne: false
            referencedRelation: 'polls'
            referencedColumns: ['id']
          }
        ]
      }
      participants: {
        Row: {
          id: string
          poll_id: string
          name: string
          voter_id: string | null
          voter_token: string
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          poll_id: string
          name: string
          voter_id?: string | null
          voter_token?: string
          comment?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          comment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'participants_poll_id_fkey'
            columns: ['poll_id']
            isOneToOne: false
            referencedRelation: 'polls'
            referencedColumns: ['id']
          }
        ]
      }
      votes: {
        Row: {
          id: string
          participant_id: string
          poll_date_id: string
          status: VoteStatus
        }
        Insert: {
          id?: string
          participant_id: string
          poll_date_id: string
          status: VoteStatus
        }
        Update: {
          status?: VoteStatus
        }
        Relationships: [
          {
            foreignKeyName: 'votes_participant_id_fkey'
            columns: ['participant_id']
            isOneToOne: false
            referencedRelation: 'participants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'votes_poll_date_id_fkey'
            columns: ['poll_date_id']
            isOneToOne: false
            referencedRelation: 'poll_dates'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      update_poll_as_admin: {
        Args: {
          p_poll_id: string
          p_admin_token: string
          p_title?: string | null
          p_description?: string | null
          p_deadline?: string | null
        }
        Returns: undefined
      }
      delete_poll_as_admin: {
        Args: { p_poll_id: string; p_admin_token: string }
        Returns: undefined
      }
      add_poll_date_as_admin: {
        Args: { p_poll_id: string; p_admin_token: string; p_date: string }
        Returns: undefined
      }
      remove_poll_date_as_admin: {
        Args: { p_poll_id: string; p_admin_token: string; p_date_id: string }
        Returns: undefined
      }
      update_participant_as_voter: {
        Args: {
          p_participant_id: string
          p_voter_token: string
          p_name?: string | null
          p_comment?: string | null
        }
        Returns: undefined
      }
      upsert_vote_as_voter: {
        Args: {
          p_participant_id: string
          p_voter_token: string
          p_poll_date_id: string
          p_status: string
        }
        Returns: undefined
      }
    }
    Enums: Record<string, never>
  }
}

// Convenience types for joined queries
export interface PollWithDates {
  id: string
  title: string
  description: string | null
  creator_id: string | null
  admin_token: string
  deadline: string | null
  created_at: string
  poll_dates: Array<{ id: string; date: string }>
}

export interface ParticipantWithVotes {
  id: string
  poll_id: string
  name: string
  voter_id: string | null
  voter_token: string
  comment: string | null
  created_at: string
  votes: Array<{ id: string; poll_date_id: string; status: VoteStatus }>
}
