// System architecture data — edit this file to add/remove systems and connections
// No code changes needed in the diagram component itself

export const NODE_W = 160
export const NODE_H = 72

// Vercel-style status colors and labels
export const STATUS_CONFIG = {
  ready:    { color: '#17c964', label: 'Ready' },
  building: { color: '#f5a524', label: 'Building' },
  error:    { color: '#f31260', label: 'Error' },
  planned:  { color: '#71717a', label: 'Planned' },
  paused:   { color: '#889096', label: 'Paused' },
}

export const layers = [
  { id: 'UI',       label: 'UI',       y1: 20,  y2: 135, color: '#eff6ff' },
  { id: 'DevOps',   label: 'DevOps',   y1: 155, y2: 315, color: '#f0fdf4' },
  { id: 'AI',       label: 'AI',       y1: 335, y2: 435, color: '#faf5ff' },
  { id: 'Platform', label: 'Platform', y1: 455, y2: 590, color: '#fff7ed' },
]

export const nodes = [
  {
    id: 'vercel',
    label: 'Vercel',
    sublabel: 'sf-vibe-dashboard.vercel.app',
    layer: 'UI',
    status: 'ready',
    x: 580, y: 77,
    detail: {
      tech: ['React', 'Vite', 'Shadcn/ui', 'Serverless Functions (Node.js)'],
      apis: ['/api/github (proxy — hides token from browser)'],
      notes: 'Production dashboard. Auto-deploys from GitHub main branch via webhook.',
    },
  },
  {
    id: 'github',
    label: 'GitHub',
    sublabel: 'yasushi-dotcom',
    layer: 'DevOps',
    status: 'ready',
    x: 300, y: 235,
    detail: {
      tech: ['Git', 'GitHub Issues', 'GitHub Actions'],
      apis: ['REST API v3', 'Webhooks (HTTPS)'],
      notes: 'Source control and issue tracking for all sf-vibe projects.',
    },
  },
  {
    id: 'local',
    label: 'Local Machine',
    sublabel: 'Claude Code · SF CLI · git',
    layer: 'DevOps',
    status: 'ready',
    x: 860, y: 235,
    detail: {
      tech: ['Claude Code', 'Salesforce CLI', 'Node.js', 'git'],
      apis: [],
      notes: 'Primary development environment. All deploy/retrieve runs from here.',
    },
  },
  {
    id: 'claude',
    label: 'Claude / MCP',
    sublabel: 'claude-sonnet-4-6',
    layer: 'AI',
    status: 'ready',
    x: 580, y: 375,
    detail: {
      tech: ['Claude Sonnet 4.6', 'MCP (Model Context Protocol)', 'GitHub MCP server', 'Salesforce MCP server'],
      apis: ['GitHub REST (via MCP)', 'Salesforce REST/Metadata (via MCP)'],
      notes: 'AI-driven development via Claude Code. MCP servers run as local subprocesses.',
    },
  },
  {
    id: 'sf-ep',
    label: 'SF EP Dev',
    sublabel: 'my-dev-org · Enterprise',
    layer: 'Platform',
    status: 'ready',
    x: 220, y: 520,
    detail: {
      tech: ['Salesforce Enterprise Edition', 'Apex', 'LWC', 'Flows', 'Triggers'],
      apis: ['Tooling API', 'Metadata API', 'REST API'],
      notes: 'Enterprise Platform developer org. Programmatic development (Apex, LWC).',
    },
  },
  {
    id: 'sf-ps',
    label: 'SF PS Dev',
    sublabel: 'Pro Suite dev org',
    layer: 'Platform',
    status: 'ready',
    x: 580, y: 520,
    detail: {
      tech: ['Salesforce Pro Suite', 'Flows', 'Layouts', 'Custom Fields'],
      apis: ['Metadata API', 'REST API'],
      notes: 'Pro Suite developer org. Declarative development (config/admin).',
    },
  },
  {
    id: 'sf-starter',
    label: 'SF Starter Prod',
    sublabel: 'ss-prd · Starter Suite',
    layer: 'Platform',
    status: 'planned',
    x: 940, y: 520,
    detail: {
      tech: ['Salesforce Starter Suite'],
      apis: ['Metadata API', 'REST API'],
      notes: 'Starter Suite production org (alias: ss-prd). Org confirmed connected. Retrieve only — deployment not yet validated. Codex workstream setup in progress.',
    },
  },
]

export const edges = [
  {
    id: 'vercel-github',
    from: 'vercel',
    to: 'github',
    label: 'REST / Webhooks',
    bidirectional: true,
    // Enter GitHub right face offset up — separates from local-github (y=235) and claude-github (y=249)
    entryOffset: -18,
    detail: {
      protocol: 'HTTPS',
      auth: 'GitHub Token (Vercel env var) + Webhook secret',
      direction: 'Vercel → GitHub (read data), GitHub → Vercel (deploy trigger)',
      notes: 'Dashboard reads repo/issue/commit data. GitHub webhooks trigger auto-deploy on push to main.',
    },
  },
  {
    id: 'local-github',
    from: 'local',
    to: 'github',
    label: 'SSH / HTTPS',
    bidirectional: true,
    // Exits Local left at y=235 center — anchor for the other offset exits
    detail: {
      protocol: 'SSH / HTTPS',
      auth: 'SSH key + GitHub PAT',
      direction: 'bidirectional',
      notes: 'git push/pull. Pushing to main triggers a Vercel deployment automatically.',
    },
  },
  {
    id: 'local-claude',
    from: 'local',
    to: 'claude',
    label: 'Claude Code',
    bidirectional: true,
    // Exit Local left shifted down (+24) so it doesn't share the same exit point as local-github
    exitOffset: 24,
    detail: {
      protocol: 'Local process (stdin/stdout + API)',
      auth: 'Anthropic API key (env var)',
      direction: 'bidirectional',
      notes: 'Claude Code runs in the terminal. MCP servers are spawned as local subprocesses per project .mcp.json.',
    },
  },
  {
    id: 'local-sf-ep',
    from: 'local',
    to: 'sf-ep',
    label: 'SF CLI',
    bidirectional: true,
    // Exit Local left shifted up (-16); enter SF EP from its left face.
    // Routes through x=460 which is left of Claude box — avoids crossing Claude.
    exitOffset: -16,
    entryFace: 'left',
    detail: {
      protocol: 'REST / Metadata API',
      auth: 'OAuth2 (SF CLI login)',
      direction: 'Local ↔ SF org',
      notes: 'sf project deploy/retrieve. Authenticated via SF CLI org alias my-dev-org.',
    },
  },
  {
    id: 'local-sf-ps',
    from: 'local',
    to: 'sf-ps',
    label: 'SF CLI',
    bidirectional: true,
    // Exit Local bottom (x=840, avoiding SF Starter box at x=860+),
    // go straight down then left to SF PS right face — bypasses Claude entirely.
    exitFace: 'bottom',
    exitOffset: -20,
    entryFace: 'right',
    routing: 'L-vertical',
    detail: {
      protocol: 'REST / Metadata API',
      auth: 'OAuth2 (SF CLI login)',
      direction: 'Local ↔ SF org',
      notes: 'sf project deploy/retrieve for Pro Suite org.',
    },
  },
  {
    id: 'claude-github',
    from: 'claude',
    to: 'github',
    label: 'GitHub MCP',
    // Enter GitHub right face offset down (+14) — separates from local-github (y=235)
    entryOffset: 14,
    detail: {
      protocol: 'MCP → GitHub REST API',
      auth: 'GitHub PAT (in .mcp.json)',
      direction: 'Claude → GitHub',
      notes: 'Read/write issues, PRs, file contents, commits via GitHub MCP server.',
    },
  },
  {
    id: 'claude-sf-ep',
    from: 'claude',
    to: 'sf-ep',
    label: 'SF MCP',
    // Exit Claude bottom offset left (-16); enter SF EP top — separates from claude-sf-ps exit
    exitOffset: -16,
    entryFace: 'top',
    detail: {
      protocol: 'MCP → Salesforce REST/Metadata API',
      auth: 'OAuth2 (via SF CLI)',
      direction: 'Claude → SF org',
      notes: 'SOQL queries, metadata operations, org inspection via Salesforce MCP server.',
    },
  },
  {
    id: 'local-sf-starter',
    from: 'local',
    to: 'sf-starter',
    label: 'SF CLI (retrieve only)',
    bidirectional: false,
    exitFace: 'bottom',
    exitOffset: 20,
    entryFace: 'top',
    detail: {
      protocol: 'REST / Metadata API',
      auth: 'OAuth2 (SF CLI login, alias: ss-prd)',
      direction: 'Local ← SF Starter Prod (retrieve only)',
      notes: 'Metadata retrieved once from Starter Suite production. Deployment not yet validated — extraction only for now.',
    },
  },
  {
    id: 'claude-sf-ps',
    from: 'claude',
    to: 'sf-ps',
    label: 'SF MCP',
    // Exit Claude bottom offset right (+16) — separates from claude-sf-ep exit
    exitOffset: 16,
    detail: {
      protocol: 'MCP → Salesforce REST/Metadata API',
      auth: 'OAuth2 (via SF CLI)',
      direction: 'Claude → SF org',
      notes: 'SOQL queries, metadata operations for Pro Suite org.',
    },
  },
]
