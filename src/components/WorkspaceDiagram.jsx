import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  flowchart: { curve: 'basis', padding: 20 },
  themeVariables: {
    fontFamily: 'Geist, ui-sans-serif, system-ui, sans-serif',
    fontSize: '13px',
  },
})

const DIAGRAM = `graph TB
    classDef tier1 fill:#f4a261,stroke:#e76f51,color:#000
    classDef tier2claude fill:#457b9d,stroke:#1d3557,color:#fff
    classDef tier2codex fill:#2a9d8f,stroke:#264653,color:#fff
    classDef tier3claude fill:#a8dadc,stroke:#457b9d,color:#000
    classDef tier3codex fill:#95d5b2,stroke:#2a9d8f,color:#000
    classDef template fill:#e9c46a,stroke:#f4a261,color:#000
    classDef infra fill:#adb5bd,stroke:#6c757d,color:#000

    subgraph LocalPC["Local PC"]
        subgraph DotClaude["~/.claude/"]
            GCL["~/.claude/CLAUDE.md\nTier 2 · Claude Global"]
        end
        subgraph DotCodex["~/.codex/"]
            CCT["~/.codex/config.toml\nTier 2 · Codex Runtime Config"]
        end
        subgraph AIWorkspace["~/AI-Workspace/"]
            WCL["AI-Workspace/CLAUDE.md\nTier 2 · Claude Workspace"]
            subgraph Standards["standards/"]
                AR["AI-RULES.md"]
                RP["rule-precedence.md"]
                CR["crud-rights.md"]
                DS["deployment-safety.md"]
                BS["branch-strategy.md"]
                VR["validation-rules.md"]
            end
            subgraph Agents["agents/"]
                subgraph AgentClaude["agents/claude/"]
                    ACL["agents/claude/CLAUDE.md"]
                    ACT["agents/claude/templates/\nPROJECT-RULES.template.md"]
                end
                subgraph AgentCodex["agents/codex/"]
                    ACD["agents/codex/CODEX.md"]
                    ACDT["agents/codex/templates/\nAGENTS.template.md"]
                end
            end
            subgraph SharedTemplates["templates/"]
                PRT["templates/PR.template.md"]
            end
            subgraph Projects["projects/ (symlinks)"]
                SL1["sf-ep symlink"]
                SL2["sf-ps symlink"]
                SL3["sf-vercel symlink"]
                SL4["sf-ss symlink (planned)"]
            end
        end
        subgraph ClaudeRepos["Claude Repos"]
            R1["sf-ep-dev-vibe-coding\nCLAUDE.md / .mcp.json / memory/"]
            R2["sf-ps-dev-vibe-config\nCLAUDE.md / .mcp.json / memory/"]
            R3["sf-vercel-prd-vibe-dashboard\nCLAUDE.md / .mcp.json / memory/"]
        end
        subgraph CodexRepos["Codex Repos"]
            R4["sf-ss-prd-vibe-config\n.mcp.json / memory/"]
            AGM["sf-ss/AGENTS.md\nCodex Project Context"]
        end
        subgraph MCPServers["MCP Servers"]
            SFMCP["Salesforce MCP"]
            GHMCP["GitHub MCP"]
        end
        CC["Claude Code"]
        CX["Codex (planned)"]
    end

    subgraph Cloud["Cloud"]
        subgraph GitHub["GitHub · yasushi-dotcom"]
            GH1["sf-ep repo"]
            GH2["sf-ps repo"]
            GH3["sf-vercel repo"]
            GH4["sf-ss repo (planned)"]
        end
        subgraph SFOrgs["Salesforce Orgs"]
            ORG1["my-dev-org\nPartner Developer"]
            ORG2["sf-ps-dev-org\nPro Suite"]
            ORG3["sf-ss-prd-org (planned)"]
        end
        VCL["Vercel Production"]
    end

    Dev([Developer])

    Dev -->|instructions| CC
    Dev -->|instructions| CX

    GCL -->|1st loaded| CC
    WCL -->|2nd loaded| CC
    R1 -->|3rd loaded| CC

    CCT -->|configures| CX
    AGM -->|project context| CX

    CC -->|manages| R1
    CC -->|manages| R2
    CC -->|manages| R3
    CC -->|calls| MCPServers

    CX -->|manages| R4
    CX -->|calls| MCPServers

    SL1 -.->|symlink| R1
    SL2 -.->|symlink| R2
    SL3 -.->|symlink| R3
    SL4 -.->|symlink| R4

    AGM --o R4

    SFMCP -->|REST API| SFOrgs
    GHMCP -->|GitHub API| GitHub

    R1 -->|git push| GH1
    R2 -->|git push| GH2
    R3 -->|git push| GH3
    R4 -.->|git push| GH4

    R1 -->|sf deploy| ORG1
    R2 -->|sf deploy| ORG2
    R4 -.->|sf deploy| ORG3
    R3 -->|deploy| VCL
    GH3 -->|auto-deploy| VCL

    Standards -.->|governs| CC
    Standards -.->|governs| CX
    ACL -.->|sync| GCL
    ACD -.->|guides| CCT

    class AR,RP,CR,DS,BS,VR tier1
    class GCL,WCL,ACL tier2claude
    class CCT,ACD tier2codex
    class R1,R2,R3 tier3claude
    class R4,AGM tier3codex
    class ACT,ACDT,PRT template
    class SL1,SL2,SL3,SL4,SFMCP,GHMCP infra`

const LEGEND = [
  { color: '#f4a261', label: 'Tier 1 · Cross-AI Standards' },
  { color: '#457b9d', label: 'Tier 2 · Claude files' },
  { color: '#2a9d8f', label: 'Tier 2 · Codex files' },
  { color: '#a8dadc', label: 'Tier 3 · Claude project files' },
  { color: '#95d5b2', label: 'Tier 3 · Codex project files' },
  { color: '#e9c46a', label: 'Templates' },
  { color: '#adb5bd', label: 'Infrastructure' },
]

export default function WorkspaceDiagram() {
  const containerRef = useRef(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const id = 'workspace-diagram-' + Date.now()
    mermaid.render(id, DIAGRAM)
      .then(({ svg }) => {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
          const svgEl = containerRef.current.querySelector('svg')
          if (svgEl) {
            svgEl.style.width = '100%'
            svgEl.style.height = 'auto'
          }
        }
      })
      .catch(err => {
        if (!cancelled) setError(String(err))
      })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Workspace</h2>
        <p className="text-muted-foreground text-sm">
          3-tier governance model · <code className="text-xs bg-muted px-1 py-0.5 rounded">~/AI-Workspace/</code> · Validated 2026-03-21
        </p>
      </div>

      <div className="border rounded-lg bg-card overflow-auto p-4">
        {error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : (
          <div ref={containerRef} className="min-h-[200px]" />
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
        <span className="font-medium text-foreground">Legend</span>
        {LEGEND.map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
