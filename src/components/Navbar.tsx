import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, LayoutDashboard, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const { user, loading, signOut } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <Clock className="h-5 w-5 text-primary" />
          HerdTime
        </Link>

        <div className="flex items-center gap-2">
          {!loading && (
            <>
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="mr-1.5 h-4 w-4" />
                      My polls
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => signOut()}>
                    <LogOut className="mr-1.5 h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
                  <User className="mr-1.5 h-4 w-4" />
                  Sign in
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </header>
  )
}
