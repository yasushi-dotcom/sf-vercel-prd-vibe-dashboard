const TIMEOUT_MS = 6000

// Check an Atlassian Statuspage-compatible endpoint (GitHub, Vercel, Anthropic all use this)
async function checkStatusPage(url) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: ctl.signal })
    if (!res.ok) return 'error'
    const data = await res.json()
    const indicator = data?.status?.indicator
    if (!indicator || indicator === 'none') return 'ready'
    if (indicator === 'minor' || indicator === 'maintenance') return 'building'
    return 'error' // major / critical
  } catch {
    return 'error'
  } finally {
    clearTimeout(t)
  }
}

// Simple HTTP reachability check (HEAD request)
async function checkReachable(url) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { method: 'HEAD', signal: ctl.signal })
    return res.ok ? 'ready' : 'error'
  } catch {
    return 'error'
  } finally {
    clearTimeout(t)
  }
}

export default async function handler(req, res) {
  // Cache for 60s on CDN edge, serve stale for up to 30s while revalidating
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30')

  const results = await Promise.allSettled([
    checkStatusPage('https://www.githubstatus.com/api/v2/status.json'),
    checkStatusPage('https://www.vercel-status.com/api/v2/status.json'),
    checkStatusPage('https://status.claude.com/api/v2/status.json'),
    checkReachable('https://login.salesforce.com'),
  ])

  const [github, vercel, claude, salesforce] = results.map(r =>
    r.status === 'fulfilled' ? r.value : 'error'
  )

  res.json({
    vercel,
    github,
    local: 'ready',       // local machine is always reachable if this page loads
    claude,
    'sf-ep': salesforce,
    'sf-ps': salesforce,
    'sf-starter': 'planned', // not yet active
  })
}
