import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { GitCommit, CircleDot, CheckCircle2, AlertCircle } from 'lucide-react'

const OWNER = 'yasushi-dotcom'

function priorityBadge(labels) {
  if (labels.some(l => l.name.toLowerCase().includes('high'))) return <Badge variant="destructive">High</Badge>
  if (labels.some(l => l.name.toLowerCase().includes('medium'))) return <Badge variant="secondary">Medium</Badge>
  if (labels.some(l => l.name.toLowerCase().includes('low'))) return <Badge variant="outline">Low</Badge>
  return null
}

export default function Dashboard({ repo }) {
  const [issues, setIssues] = useState([])
  const [commits, setCommits] = useState([])
  const [repoInfo, setRepoInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const base = `https://api.github.com/repos/${OWNER}/${repo.name}`
    Promise.all([
      fetch(`${base}/issues?state=all&per_page=10`).then(r => r.json()),
      fetch(`${base}/commits?per_page=5`).then(r => r.json()),
      fetch(base).then(r => r.json()),
    ]).then(([issuesData, commitsData, repoData]) => {
      setIssues(Array.isArray(issuesData) ? issuesData : [])
      setCommits(Array.isArray(commitsData) ? commitsData : [])
      setRepoInfo(repoData)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [repo.name])

  const openIssues = issues.filter(i => i.state === 'open')
  const closedIssues = issues.filter(i => i.state === 'closed')

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{repo.label}</h2>
        <p className="text-muted-foreground text-sm">{repo.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-12" /> : (
              <div className="flex items-center gap-2">
                <CircleDot className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{openIssues.length}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Closed Issues</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-12" /> : (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">{closedIssues.length}</span>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commits</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-12" /> : (
              <div className="flex items-center gap-2">
                <GitCommit className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{repoInfo?.open_issues_count !== undefined ? '5+' : '—'}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Issues */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : issues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No issues found.</p>
            ) : (
              issues.map((issue, idx) => (
                <div key={issue.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      {issue.state === 'open'
                        ? <CircleDot className="h-4 w-4 mt-0.5 shrink-0 text-green-500" />
                        : <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-purple-500" />
                      }
                      <div className="min-w-0">
                        <a
                          href={issue.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline truncate block"
                        >
                          #{issue.number} {issue.title}
                        </a>
                        <p className="text-xs text-muted-foreground">
                          {new Date(issue.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {priorityBadge(issue.labels)}
                  </div>
                  {idx < issues.length - 1 && <Separator className="mt-3" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Commits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Commits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : commits.length === 0 ? (
              <p className="text-sm text-muted-foreground">No commits found.</p>
            ) : (
              commits.map((commit, idx) => (
                <div key={commit.sha}>
                  <div className="flex items-start gap-2">
                    <GitCommit className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                    <div className="min-w-0">
                      <a
                        href={commit.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium hover:underline truncate block"
                      >
                        {commit.commit.message.split('\n')[0]}
                      </a>
                      <p className="text-xs text-muted-foreground">
                        {commit.sha.slice(0, 7)} · {new Date(commit.commit.author.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {idx < commits.length - 1 && <Separator className="mt-3" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
