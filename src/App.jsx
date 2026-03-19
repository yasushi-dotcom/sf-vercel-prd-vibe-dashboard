import { useState, useEffect } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import AppSidebar from '@/components/AppSidebar'
import Dashboard from '@/components/Dashboard'

const OWNER = 'yasushi-dotcom'

export default function App() {
  const [repos, setRepos] = useState([])
  const [selectedRepo, setSelectedRepo] = useState(null)

  useEffect(() => {
    fetch(`/api/github?path=${encodeURIComponent(`users/${OWNER}/repos?per_page=100&sort=updated`)}`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return
        const vibeRepos = data
          .filter(r => r.name.startsWith('sf-vibe-') || r.name.startsWith('sf-') && r.name.includes('-vibe-'))
          .map(r => ({ name: r.name, label: r.name, description: r.description || '' }))
        setRepos(vibeRepos)
        if (vibeRepos.length > 0) setSelectedRepo(vibeRepos[0])
      })
  }, [])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <AppSidebar repos={repos} selectedRepo={selectedRepo} onSelectRepo={setSelectedRepo} />
          <main className="flex-1 overflow-auto">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold text-muted-foreground">sf-vibe dashboard</h1>
            </div>
            {selectedRepo ? <Dashboard repo={selectedRepo} /> : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Loading projects...
              </div>
            )}
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
