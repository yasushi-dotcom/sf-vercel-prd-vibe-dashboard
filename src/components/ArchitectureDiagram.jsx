import { useState, useEffect, useCallback } from 'react'
import { nodes, edges, layers, NODE_W, NODE_H, STATUS_CONFIG } from '@/data/architecture'
import { X, RefreshCw } from 'lucide-react'

const SVG_W = 1160
const SVG_H = 620

function getNode(id) {
  return nodes.find(n => n.id === id)
}

// ---- Elbow connector helpers ----

// Determine orthogonal exit/entry points on the node box faces.
// edge.entryFace / edge.exitFace can override the auto-routing per-edge.
function getExitEntry(src, dst, edge = {}) {
  const hw = NODE_W / 2
  const hh = NODE_H / 2
  const dx = dst.x - src.x
  const dy = dst.y - src.y

  if (edge.entryFace) {
    // Entry point is forced to a specific face
    const faceMap = {
      top:    [dst.x,      dst.y - hh],
      bottom: [dst.x,      dst.y + hh],
      left:   [dst.x - hw, dst.y     ],
      right:  [dst.x + hw, dst.y     ],
    }
    const [enx, eny] = faceMap[edge.entryFace] ?? faceMap.top
    // Force matching exit axis: vertical entry → vertical exit
    const exitVertical = edge.entryFace === 'top' || edge.entryFace === 'bottom'
    const ex = exitVertical ? src.x : (dx >= 0 ? src.x + hw : src.x - hw)
    const ey = exitVertical ? (dy >= 0 ? src.y + hh : src.y - hh) : src.y
    return { ex, ey, enx, eny, exitVertical }
  }

  // Default: auto-route based on dominant axis
  const exitVertical = Math.abs(dy) >= Math.abs(dx)
  let ex, ey, enx, eny
  if (exitVertical) {
    ex = src.x
    ey = dy >= 0 ? src.y + hh : src.y - hh
    enx = dst.x
    eny = dy >= 0 ? dst.y - hh : dst.y + hh
  } else {
    ex = dx >= 0 ? src.x + hw : src.x - hw
    ey = src.y
    enx = dx >= 0 ? dst.x - hw : dst.x + hw
    eny = dst.y
  }
  return { ex, ey, enx, eny, exitVertical }
}

// Z-shaped orthogonal path with rounded corners at each bend
function buildElbowPath(ex, ey, enx, eny, exitVertical, r = 10) {
  if (exitVertical) {
    if (ex === enx) return `M ${ex},${ey} V ${eny}`
    const midY = (ey + eny) / 2
    const sx = enx > ex ? 1 : -1
    const sy1 = midY > ey ? 1 : -1
    const sy2 = eny > midY ? 1 : -1
    return [
      `M ${ex},${ey}`,
      `V ${midY - sy1 * r}`,
      `Q ${ex},${midY} ${ex + sx * r},${midY}`,
      `H ${enx - sx * r}`,
      `Q ${enx},${midY} ${enx},${midY + sy2 * r}`,
      `V ${eny}`,
    ].join(' ')
  } else {
    if (ey === eny) return `M ${ex},${ey} H ${enx}`
    const midX = (ex + enx) / 2
    const sy = eny > ey ? 1 : -1
    const sx1 = midX > ex ? 1 : -1
    const sx2 = enx > midX ? 1 : -1
    return [
      `M ${ex},${ey}`,
      `H ${midX - sx1 * r}`,
      `Q ${midX},${ey} ${midX},${ey + sy * r}`,
      `V ${eny - sy * r}`,
      `Q ${midX},${eny} ${midX + sx2 * r},${eny}`,
      `H ${enx}`,
    ].join(' ')
  }
}

// Label sits at the midpoint of the middle (crossing) segment
function getLabelPos(ex, ey, enx, eny, exitVertical) {
  if (exitVertical) {
    return { lx: (ex + enx) / 2, ly: (ey + eny) / 2 }
  }
  return { lx: (ex + enx) / 2, ly: (ey + eny) / 2 }
}

// Direction angle the path arrives at the entry point (last segment direction)
function getEntryAngle(ex, ey, enx, eny, exitVertical, entryFace) {
  if (entryFace) {
    return { top: Math.PI / 2, bottom: -Math.PI / 2, left: 0, right: Math.PI }[entryFace] ?? Math.PI / 2
  }
  if (exitVertical) {
    const sy2 = eny > (ey + eny) / 2 ? 1 : -1
    return sy2 * Math.PI / 2
  }
  return enx > (ex + enx) / 2 ? 0 : Math.PI
}

// Direction the path leaves the exit point — reversed for the bidirectional src arrow
function getExitAngle(ex, ey, enx, eny, exitVertical) {
  if (exitVertical) {
    const sy1 = (ey + eny) / 2 > ey ? 1 : -1
    return -sy1 * Math.PI / 2
  }
  const sx1 = (ex + enx) / 2 > ex ? 1 : -1
  return sx1 > 0 ? Math.PI : 0
}

function EdgeLine({ edge, isSelected, onClick }) {
  const src = getNode(edge.from)
  const dst = getNode(edge.to)
  const { ex, ey, enx, eny, exitVertical } = getExitEntry(src, dst, edge)
  const d = buildElbowPath(ex, ey, enx, eny, exitVertical)
  const { lx, ly } = getLabelPos(ex, ey, enx, eny, exitVertical)

  const color = isSelected ? '#3b82f6' : '#94a3b8'
  const labelColor = isSelected ? '#1d4ed8' : '#64748b'

  const entryAngle = getEntryAngle(ex, ey, enx, eny, exitVertical, edge.entryFace)
  const entryTx = enx - 8 * Math.cos(entryAngle)
  const entryTy = eny - 8 * Math.sin(entryAngle)

  const exitAngle = getExitAngle(ex, ey, enx, eny, exitVertical)
  const exitTx = ex - 8 * Math.cos(exitAngle)
  const exitTy = ey - 8 * Math.sin(exitAngle)

  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      {/* Invisible thick hit area */}
      <path d={d} fill="none" stroke="transparent" strokeWidth={14} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={isSelected ? 2 : 1.5}
        strokeDasharray={edge.bidirectional ? undefined : '6 3'}
      />
      {/* Arrow at entry end */}
      <polygon
        points="0,-4 8,0 0,4"
        fill={color}
        transform={`translate(${entryTx},${entryTy}) rotate(${entryAngle * 180 / Math.PI})`}
      />
      {/* Arrow at exit end for bidirectional */}
      {edge.bidirectional && (
        <polygon
          points="0,-4 8,0 0,4"
          fill={color}
          transform={`translate(${exitTx},${exitTy}) rotate(${exitAngle * 180 / Math.PI})`}
        />
      )}
      {/* Label at midpoint of crossing segment */}
      <text
        x={lx}
        y={ly - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={10}
        fill={labelColor}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {edge.label}
      </text>
    </g>
  )
}

function NodeBox({ node, isSelected, onClick, liveStatus, statusLoading }) {
  const x = node.x - NODE_W / 2
  const y = node.y - NODE_H / 2
  const borderColor = isSelected ? '#3b82f6' : node.planned ? '#cbd5e1' : '#e2e8f0'
  const fillColor = node.planned ? '#f8fafc' : 'white'
  const labelColor = node.planned ? '#94a3b8' : '#0f172a'

  const statusKey = liveStatus ?? node.status
  const status = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.planned

  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      <rect
        x={x} y={y}
        width={NODE_W} height={NODE_H}
        rx={8}
        fill={fillColor}
        stroke={borderColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        strokeDasharray={node.planned ? '6 3' : undefined}
        filter={isSelected ? 'drop-shadow(0 0 6px #93c5fd)' : undefined}
      />
      {/* Label */}
      <text
        x={node.x} y={node.y - 14}
        textAnchor="middle"
        fontSize={13}
        fontWeight="600"
        fill={labelColor}
        style={{ userSelect: 'none' }}
      >
        {node.label}
      </text>
      {/* Sublabel */}
      <text
        x={node.x} y={node.y + 2}
        textAnchor="middle"
        fontSize={10}
        fill="#64748b"
        style={{ userSelect: 'none' }}
      >
        {node.sublabel}
      </text>
      {/* Status indicator — Vercel style: dot + label */}
      <circle
        cx={node.x - 28}
        cy={node.y + 19}
        r={4}
        fill={statusLoading ? '#e2e8f0' : status.color}
      >
        {statusLoading && (
          <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
        )}
      </circle>
      <text
        x={node.x - 21}
        y={node.y + 19}
        dominantBaseline="middle"
        fontSize={9}
        fill={statusLoading ? '#94a3b8' : status.color}
        fontWeight="500"
        style={{ userSelect: 'none' }}
      >
        {statusLoading ? 'Checking…' : status.label}
      </text>
    </g>
  )
}

function DetailPanel({ item, type, onClose }) {
  if (!item) return null

  return (
    <div className="border rounded-lg bg-card p-4 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      {type === 'node' && (
        <div className="space-y-2 pr-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{item.label}</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{item.layer}</span>
            {item.planned && (
              <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">planned</span>
            )}
          </div>
          {item.detail.tech.length > 0 && (
            <div className="text-sm">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tech stack — </span>
              {item.detail.tech.join(' · ')}
            </div>
          )}
          {item.detail.apis.length > 0 && (
            <div className="text-sm">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">APIs — </span>
              {item.detail.apis.join(' · ')}
            </div>
          )}
          {item.detail.notes && (
            <p className="text-sm text-muted-foreground">{item.detail.notes}</p>
          )}
        </div>
      )}

      {type === 'edge' && (
        <div className="space-y-2 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{getNode(item.from).label}</span>
            <span className="text-xs text-muted-foreground">
              {item.bidirectional ? '↔' : '→'}
            </span>
            <span className="font-semibold text-sm">{getNode(item.to).label}</span>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">{item.label}</span>
          </div>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Protocol — </span>
              {item.detail.protocol}
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Auth — </span>
              {item.detail.auth}
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Direction — </span>
              {item.detail.direction}
            </div>
            {item.detail.notes && (
              <p className="text-muted-foreground">{item.detail.notes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ArchitectureDiagram() {
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [statusMap, setStatusMap] = useState({})
  const [statusLoading, setStatusLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState(null)

  const fetchStatus = useCallback(() => {
    setStatusLoading(true)
    fetch('/api/status')
      .then(r => r.json())
      .then(data => {
        setStatusMap(data)
        setLastChecked(new Date())
      })
      .catch(() => {})
      .finally(() => setStatusLoading(false))
  }, [])

  useEffect(() => { fetchStatus() }, [fetchStatus])

  const handleNodeClick = (node) => {
    setSelectedEdge(null)
    setSelectedNode(prev => prev?.id === node.id ? null : node)
  }

  const handleEdgeClick = (edge) => {
    setSelectedNode(null)
    setSelectedEdge(prev => prev?.id === edge.id ? null : edge)
  }

  const clearSelection = () => {
    setSelectedNode(null)
    setSelectedEdge(null)
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Architecture</h2>
          <p className="text-muted-foreground text-sm">Click a system box or connection line to see details</p>
        </div>
        <div className="flex items-center gap-3 pt-1 shrink-0">
          {lastChecked && (
            <span className="text-xs text-muted-foreground">
              Checked {lastChecked.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchStatus}
            disabled={statusLoading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 border rounded px-2 py-1"
          >
            <RefreshCw className={`h-3 w-3 ${statusLoading ? 'animate-spin' : ''}`} />
            {statusLoading ? 'Checking…' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="border rounded-lg bg-card overflow-auto">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full"
          style={{ minWidth: 640, minHeight: 340 }}
          onClick={(e) => { if (e.target === e.currentTarget) clearSelection() }}
        >
          {/* Layer background bands */}
          {layers.map(layer => (
            <g key={layer.id}>
              <rect
                x={0} y={layer.y1}
                width={SVG_W} height={layer.y2 - layer.y1}
                fill={layer.color}
              />
              <text
                x={12} y={(layer.y1 + layer.y2) / 2}
                dominantBaseline="middle"
                fontSize={10}
                fontWeight="600"
                fill="#94a3b8"
                letterSpacing="0.08em"
                style={{ userSelect: 'none', textTransform: 'uppercase' }}
              >
                {layer.label}
              </text>
            </g>
          ))}

          {/* Edges — rendered before nodes so nodes appear on top */}
          {edges.map(edge => (
            <EdgeLine
              key={edge.id}
              edge={edge}
              isSelected={selectedEdge?.id === edge.id}
              onClick={(e) => { e.stopPropagation(); handleEdgeClick(edge) }}
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => (
            <NodeBox
              key={node.id}
              node={node}
              isSelected={selectedNode?.id === node.id}
              onClick={(e) => { e.stopPropagation(); handleNodeClick(node) }}
              liveStatus={statusMap[node.id]}
              statusLoading={statusLoading}
            />
          ))}
        </svg>
      </div>

      {/* Detail panel */}
      {selectedNode && (
        <DetailPanel item={selectedNode} type="node" onClose={clearSelection} />
      )}
      {selectedEdge && (
        <DetailPanel item={selectedEdge} type="edge" onClose={clearSelection} />
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground flex-wrap">
        <span className="font-medium text-foreground">Legend</span>
        {Object.entries(STATUS_CONFIG).map(([key, { color, label }]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            {label}
          </span>
        ))}
        <span className="ml-4">Solid line = bidirectional · Dashed line = one-directional · Dashed border = planned</span>
      </div>
    </div>
  )
}
