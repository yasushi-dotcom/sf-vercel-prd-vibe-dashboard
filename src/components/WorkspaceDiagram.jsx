import { ChevronDown, GitBranch, Server, Cloud, Cpu, Link } from 'lucide-react'

// ---- Tier color tokens ----
const C = {
  tier1:       { bg: '#fff7ed', border: '#f4a261', dot: '#e76f51', chipBg: '#f4a261', chipText: '#000' },
  tier2claude: { bg: '#eff6ff', border: '#457b9d', dot: '#457b9d', chipBg: '#457b9d', chipText: '#fff' },
  tier2codex:  { bg: '#f0fdfa', border: '#2a9d8f', dot: '#2a9d8f', chipBg: '#2a9d8f', chipText: '#fff' },
  tier3claude: { bg: '#f0f9ff', border: '#7ec8d8', dot: '#457b9d', chipBg: '#a8dadc', chipText: '#0f172a' },
  tier3codex:  { bg: '#f0fdf4', border: '#6cbf94', dot: '#2a9d8f', chipBg: '#95d5b2', chipText: '#0f172a' },
  template:    { bg: '#fefce8', border: '#e9c46a', dot: '#d4a012', chipBg: '#e9c46a', chipText: '#000' },
  infra:       { bg: '#f8fafc', border: '#cbd5e1', dot: '#94a3b8', chipBg: '#e2e8f0', chipText: '#334155' },
  cloud:       { bg: '#f1f5f9', border: '#94a3b8', dot: '#64748b', chipBg: '#e2e8f0', chipText: '#0f172a' },
  tool:        { bg: '#faf5ff', border: '#8b5cf6', dot: '#7c3aed', chipBg: '#7c3aed', chipText: '#fff' },
  toolPlanned: { bg: '#f8fafc', border: '#cbd5e1', dot: '#94a3b8', chipBg: '#e2e8f0', chipText: '#64748b' },
}

// ---- Primitives ----

function Band({ title, color, icon: Icon, planned, children, className = '' }) {
  return (
    <div
      style={{ background: color.bg, borderColor: color.border }}
      className={`rounded-xl border-2 p-4 space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span style={{ background: color.dot }} className="inline-block w-2 h-2 rounded-full shrink-0" />
        <span style={{ color: color.dot }} className="text-xs font-bold tracking-widest uppercase">
          {title}
        </span>
        {Icon && <Icon style={{ color: color.dot }} className="h-3.5 w-3.5 ml-auto opacity-60" />}
        {planned && (
          <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
            planned
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Chip({ label, sublabel, color, badge }) {
  return (
    <div
      style={{ background: color.chipBg, color: color.chipText, borderColor: color.border }}
      className="relative rounded-lg border px-3 py-2 leading-tight min-w-0"
    >
      {badge && (
        <span className="absolute -top-2 -left-1.5 text-xs font-bold bg-white border border-gray-200 rounded-full w-5 h-5 flex items-center justify-center text-slate-500 shadow-sm">
          {badge}
        </span>
      )}
      <div className="font-mono text-xs font-semibold truncate">{label}</div>
      {sublabel && (
        <div style={{ opacity: 0.7 }} className="text-xs mt-0.5 truncate">{sublabel}</div>
      )}
    </div>
  )
}

function ChipGrid({ children }) {
  return <div className="flex flex-wrap gap-2">{children}</div>
}

function Arrow({ label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-0.5 select-none">
      <ChevronDown className="h-4 w-4 text-slate-400" />
      {label && <span className="text-xs text-slate-400 italic">{label}</span>}
    </div>
  )
}

function SplitArrow({ leftLabel, rightLabel }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col items-center gap-0.5 py-0.5 select-none">
        <ChevronDown className="h-4 w-4 text-slate-400" />
        {leftLabel && <span className="text-xs text-slate-400 italic">{leftLabel}</span>}
      </div>
      <div className="flex flex-col items-center gap-0.5 py-0.5 select-none">
        <ChevronDown className="h-4 w-4 text-slate-400" />
        {rightLabel && <span className="text-xs text-slate-400 italic">{rightLabel}</span>}
      </div>
    </div>
  )
}

// ---- Legend ----

const LEGEND = [
  { color: C.tier1.chipBg,       label: 'Tier 1 · Cross-AI Standards' },
  { color: C.tier2claude.chipBg, label: 'Tier 2 · Claude files' },
  { color: C.tier2codex.chipBg,  label: 'Tier 2 · Codex files' },
  { color: C.tier3claude.chipBg, label: 'Tier 3 · Claude repos' },
  { color: C.tier3codex.chipBg,  label: 'Tier 3 · Codex repos' },
  { color: C.template.chipBg,    label: 'Templates' },
  { color: C.infra.chipBg,       label: 'Infrastructure' },
]

// ---- Main component ----

export default function WorkspaceDiagram() {
  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Workspace</h2>
        <p className="text-muted-foreground text-sm">
          Governance layer — file structure, tier classifications, and AI tool configuration ·{' '}
          <code className="text-xs bg-muted px-1 py-0.5 rounded">~/AI-Workspace/</code> · Validated 2026-03-21
        </p>
      </div>

      {/* Diagram */}
      <div className="border rounded-xl bg-card p-6 space-y-1">

        {/* ── TIER 1 ── */}
        <Band title="Tier 1 · Cross-AI Standards" color={C.tier1} icon={Server}>
          <ChipGrid>
            <Chip label="AI-RULES.md"          color={C.tier1} />
            <Chip label="rule-precedence.md"   color={C.tier1} />
            <Chip label="crud-rights.md"       color={C.tier1} />
            <Chip label="deployment-safety.md" color={C.tier1} />
            <Chip label="branch-strategy.md"   color={C.tier1} />
            <Chip label="validation-rules.md"  color={C.tier1} />
          </ChipGrid>
          <p className="text-xs text-amber-700 opacity-75">
            standards/ — governs both Claude Code and Codex equally
          </p>
        </Band>

        <Arrow label="governs" />

        {/* ── TIER 2 ── */}
        <div className="grid grid-cols-2 gap-4">
          <Band title="Tier 2 · Claude" color={C.tier2claude} icon={Cpu}>
            <ChipGrid>
              <Chip label="~/.claude/CLAUDE.md"      sublabel="Global rules · 1st loaded" color={C.tier2claude} badge="1" />
              <Chip label="AI-Workspace/CLAUDE.md"   sublabel="Workspace rules · 2nd loaded" color={C.tier2claude} badge="2" />
              <Chip label="agents/claude/CLAUDE.md"  sublabel="Versioned source" color={C.tier2claude} />
            </ChipGrid>
          </Band>
          <Band title="Tier 2 · Codex" color={C.tier2codex} icon={Cpu}>
            <ChipGrid>
              <Chip label="~/.codex/config.toml"    sublabel="Runtime config" color={C.tier2codex} />
              <Chip label="agents/codex/CODEX.md"   sublabel="Versioned source" color={C.tier2codex} />
            </ChipGrid>
          </Band>
        </div>

        <SplitArrow leftLabel="1st–3rd loaded into" rightLabel="configures" />

        {/* ── AI TOOLS ── */}
        <div className="grid grid-cols-2 gap-4">
          <Band title="Claude Code" color={C.tool} icon={Cpu}>
            <ChipGrid>
              <Chip label="claude-sonnet-4-6" sublabel="Active model" color={C.tool} />
              <Chip label="GitHub MCP"        sublabel=".mcp.json per project" color={C.tool} />
              <Chip label="Salesforce MCP"    sublabel=".mcp.json per project" color={C.tool} />
            </ChipGrid>
          </Band>
          <Band title="Codex" color={C.toolPlanned} planned>
            <ChipGrid>
              <Chip label="GitHub MCP"     color={C.infra} />
              <Chip label="Salesforce MCP" color={C.infra} />
            </ChipGrid>
          </Band>
        </div>

        <SplitArrow leftLabel="manages" rightLabel="manages" />

        {/* ── TIER 3 ── */}
        <div className="grid grid-cols-2 gap-4">
          <Band title="Tier 3 · Claude Repos" color={C.tier3claude} icon={GitBranch}>
            <ChipGrid>
              <Chip label="sf-ep-dev-vibe-coding"        sublabel="CLAUDE.md / .mcp.json / memory/" color={C.tier3claude} badge="3" />
              <Chip label="sf-ps-dev-vibe-config"        sublabel="CLAUDE.md / .mcp.json / memory/" color={C.tier3claude} badge="3" />
              <Chip label="sf-vercel-prd-vibe-dashboard" sublabel="CLAUDE.md / .mcp.json / memory/" color={C.tier3claude} badge="3" />
            </ChipGrid>
          </Band>
          <Band title="Tier 3 · Codex Repos" color={C.tier3codex} icon={GitBranch}>
            <ChipGrid>
              <Chip label="sf-ss-prd-vibe-config" sublabel=".mcp.json / memory/" color={C.tier3codex} />
              <Chip label="sf-ss/AGENTS.md"       sublabel="Codex project context" color={C.tier3codex} />
            </ChipGrid>
          </Band>
        </div>

        <Arrow label="git push / sf deploy" />

        {/* ── CLOUD ── */}
        <Band title="Cloud" color={C.cloud} icon={Cloud}>
          <div className="grid grid-cols-3 gap-4">
            {/* GitHub */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GitHub</span>
              <ChipGrid>
                <Chip label="sf-ep repo"           color={C.infra} />
                <Chip label="sf-ps repo"           color={C.infra} />
                <Chip label="sf-vercel repo"       color={C.infra} sublabel="auto-deploy → Vercel" />
                <Chip label="sf-ss repo (planned)" color={C.infra} />
              </ChipGrid>
            </div>
            {/* Salesforce Orgs */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Salesforce Orgs</span>
              <ChipGrid>
                <Chip label="my-dev-org"          sublabel="Partner Developer" color={C.infra} />
                <Chip label="sf-ps-dev-org"       sublabel="Pro Suite"         color={C.infra} />
                <Chip label="sf-ss-prd-org"       sublabel="planned"           color={C.infra} />
              </ChipGrid>
            </div>
            {/* Vercel */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vercel</span>
              <ChipGrid>
                <Chip label="sf-vibe-dashboard" sublabel="sf-vibe-dashboard.vercel.app" color={C.infra} />
              </ChipGrid>
            </div>
          </div>
        </Band>

        {/* ── SUPPLEMENTARY ── */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Band title="Templates" color={C.template}>
            <ChipGrid>
              <Chip label="PR.template.md"                color={C.template} />
              <Chip label="PROJECT-RULES.template.md"    color={C.template} sublabel="agents/claude/templates/" />
              <Chip label="AGENTS.template.md"           color={C.template} sublabel="agents/codex/templates/" />
            </ChipGrid>
          </Band>
          <Band title="Infrastructure" color={C.infra} icon={Link}>
            <ChipGrid>
              <Chip label="sf-ep symlink"     sublabel="projects/ → repo" color={C.infra} />
              <Chip label="sf-ps symlink"     sublabel="projects/ → repo" color={C.infra} />
              <Chip label="sf-vercel symlink" sublabel="projects/ → repo" color={C.infra} />
              <Chip label="sf-ss symlink"     sublabel="planned"          color={C.infra} />
            </ChipGrid>
          </Band>
        </div>

      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="font-medium text-foreground">Legend</span>
        {LEGEND.map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
            {label}
          </span>
        ))}
        <span className="ml-4">
          <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-bold bg-white border border-gray-200 rounded-full text-slate-500 mr-1">1</span>
          badge = CLAUDE.md load order
        </span>
      </div>
    </div>
  )
}
