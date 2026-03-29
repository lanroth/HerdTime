import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href },
    })

  const signInWithGitHub = () =>
    supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.href },
    })

  const signInWithEmail = (email: string) =>
    supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href },
    })

  const signOut = () => supabase.auth.signOut()

  return { session, user, loading, signInWithGoogle, signInWithGitHub, signInWithEmail, signOut }
}
