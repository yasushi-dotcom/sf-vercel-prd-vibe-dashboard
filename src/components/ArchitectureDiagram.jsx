import { useState } from 'react'
import { nodes, edges, layers, NODE_W, NODE_H } from '@/data/architecture'
import { X } from 'lucide-react'

const SVG_W = 1160
const SVG_H = 620

function getNode(id) {
  return nodes.find(n => n.id === id)
}

// Returns the point where a line from (sx,sy) exits the node box at (cx,cy)
function clipToBox(cx, cy, tx, ty) {
  const hw = NODE_W / 2 + 2
  const hh = NODE_H / 2 + 2
  const dx = tx - cx
  const dy = ty - cy
  if (dx === 0 && dy === 0) return [cx, cy]
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)
  let t
  if (absDx === 0) t = hh / absDy
  else if (absDy === 0) t = hw / absDx
  else t = Math.min(hw / absDx, hh / absDy)
  return [cx + dx * t, cy + dy * t]
}

function EdgeLine({ edge, isSelected, onClick }) {
  const src = getNode(edge.from)
  const dst = getNode(edge.to)
  const [x1, y1] = clipToBox(src.x, src.y, dst.x, dst.y)
  const [x2, y2] = clipToBox(dst.x, dst.y, src.x, src.y)
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2

  // Perpendicular offset for the label so it doesn't sit on the line
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const perpX = (-dy / len) * 10
  const perpY = (dx / len) * 10

  const color = isSelected ? '#3b82f6' : '#94a3b8'
  const labelColor = isSelected ? '#1d4ed8' : '#64748b'

  // Arrow tip at clip point — translate base back 8px so tip lands on box edge
  const dstAngle = Math.atan2(y2 - y1, x2 - x1)
  const dstTx = x2 - 8 * Math.cos(dstAngle)
  const dstTy = y2 - 8 * Math.sin(dstAngle)
  const srcAngle = Math.atan2(y1 - y2, x1 - x2)
  const srcTx = x1 - 8 * Math.cos(srcAngle)
  const srcTy = y1 - 8 * Math.sin(srcAngle)

  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      {/* Invisible wide hit area */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={16} />
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={isSelected ? 2 : 1.5}
        strokeDasharray={edge.bidirectional ? undefined : '6 3'}
      />
      {/* Arrow at dst end (tip at clip point) */}
      <polygon
        points="0,-4 8,0 0,4"
        fill={color}
        transform={`translate(${dstTx},${dstTy}) rotate(${dstAngle * 180 / Math.PI})`}
      />
      {/* Arrow at src end for bidirectional */}
      {edge.bidirectional && (
        <polygon
          points="0,-4 8,0 0,4"
          fill={color}
          transform={`translate(${srcTx},${srcTy}) rotate(${srcAngle * 180 / Math.PI})`}
        />
      )}
      {/* Label */}
      <text
        x={mx + perpX}
        y={my + perpY}
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

function NodeBox({ node, isSelected, onClick }) {
  const x = node.x - NODE_W / 2
  const y = node.y - NODE_H / 2
  const borderColor = isSelected ? '#3b82f6' : node.planned ? '#cbd5e1' : '#e2e8f0'
  const fillColor = node.planned ? '#f8fafc' : 'white'
  const labelColor = node.planned ? '#94a3b8' : '#0f172a'

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
      <text
        x={node.x} y={node.y - 9}
        textAnchor="middle"
        fontSize={13}
        fontWeight="600"
        fill={labelColor}
        style={{ userSelect: 'none' }}
      >
        {node.label}
      </text>
      <text
        x={node.x} y={node.y + 10}
        textAnchor="middle"
        fontSize={10}
        fill="#64748b"
        style={{ userSelect: 'none' }}
      >
        {node.sublabel}
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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">System Architecture</h2>
        <p className="text-muted-foreground text-sm">Click a system box or connection line to see details</p>
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

      <p className="text-xs text-muted-foreground">
        Dashed border = planned · Dashed line = one-directional · Solid line = bidirectional
      </p>
    </div>
  )
}
