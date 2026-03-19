import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { GitBranch } from 'lucide-react'

export default function AppSidebar({ repos, selectedRepo, onSelectRepo }) {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GitBranch className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm">sf-vibe</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {repos.map((repo) => (
                <SidebarMenuItem key={repo.name}>
                  <SidebarMenuButton
                    isActive={selectedRepo.name === repo.name}
                    onClick={() => onSelectRepo(repo)}
                  >
                    <span>{repo.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
