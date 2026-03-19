import { useState } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import AppSidebar from '@/components/AppSidebar'
import Dashboard from '@/components/Dashboard'

const REPOS = [
  { name: 'sf-vibe-coding-project', label: 'sf-vibe-coding', description: 'Partner Developer Edition' },
]

export default function App() {
  const [selectedRepo, setSelectedRepo] = useState(REPOS[0])

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <AppSidebar repos={REPOS} selectedRepo={selectedRepo} onSelectRepo={setSelectedRepo} />
          <main className="flex-1 overflow-auto">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold text-muted-foreground">sf-vibe dashboard</h1>
            </div>
            <Dashboard repo={selectedRepo} />
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  )
}
