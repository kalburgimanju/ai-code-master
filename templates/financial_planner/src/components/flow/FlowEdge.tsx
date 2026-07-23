'use client';
import { FlowEdge as FlowEdgeType, FlowNode } from './types';
import { getNodeDefinition } from './nodeDefinitions';

interface FlowEdgeProps {
  edge: FlowEdgeType;
  nodes: FlowNode[];
}

function getPortPosition(node: FlowNode, portId: string, direction: 'input' | 'output') {
  const def = getNodeDefinition(node.type, node.subtype);
  if (!def) return { x: node.x, y: node.y + 50 };

  const ports = direction === 'input' ? def.inputs : def.outputs;
  const portIndex = ports.findIndex(p => p.id === portId);
  if (portIndex === -1) return { x: node.x, y: node.y + 50 };

  const nodeWidth = 200;
  const totalPorts = ports.length;
  const spacing = 40 / Math.max(totalPorts, 1);
  const portY = 30 + (portIndex * spacing);

  return {
    x: direction === 'output' ? node.x + nodeWidth : node.x,
    y: node.y + portY,
  };
}

export default function FlowEdgeComponent({ edge, nodes }: FlowEdgeProps) {
  const fromNode = nodes.find(n => n.id === edge.fromNodeId);
  const toNode = nodes.find(n => n.id === edge.toNodeId);

  if (!fromNode || !toNode) return null;

  const from = getPortPosition(fromNode, edge.fromPortId, 'output');
  const to = getPortPosition(toNode, edge.toPortId, 'input');

  const dx = Math.abs(to.x - from.x);
  const controlOffset = Math.max(dx * 0.5, 60);

  const path = `M ${from.x} ${from.y} C ${from.x + controlOffset} ${from.y}, ${to.x - controlOffset} ${to.y}, ${to.x} ${to.y}`;

  return (
    <g>
      {/* Shadow/glow */}
      <path
        d={path}
        fill="none"
        stroke="rgba(99, 102, 241, 0.15)"
        strokeWidth={8}
        strokeLinecap="round"
      />
      {/* Main path */}
      <path
        d={path}
        fill="none"
        stroke="url(#edgeGradient)"
        strokeWidth={2.5}
        strokeLinecap="round"
        className="transition-all duration-200"
      />
      {/* Arrow head */}
      <circle
        cx={to.x}
        cy={to.y}
        r={3}
        fill="#6366f1"
        className="transition-all duration-200"
      />
    </g>
  );
}

export function EdgeDefs() {
  return (
    <defs>
      <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
        <stop offset="50%" stopColor="#818cf8" stopOpacity={1} />
        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.8} />
      </linearGradient>
    </defs>
  );
}
