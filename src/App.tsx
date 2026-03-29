import { HashRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from '@/components/Navbar'
import { Toaster } from '@/components/ui/toaster'
import { HomePage } from '@/pages/HomePage'
import { CreatePage } from '@/pages/CreatePage'
import { PollPage } from '@/pages/PollPage'
import { AdminPage } from '@/pages/AdminPage'
import { DashboardPage } from '@/pages/DashboardPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/poll/:id" element={<PollPage />} />
          <Route path="/poll/:id/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        HerdTime — free &amp; open source.{' '}
        <a
          href="https://github.com/lanroth/HerdTime"
          className="underline hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
