'use client';
import { Play, Clock, Globe, Brain, FileText, Image, Hash, Search, Youtube, Linkedin, Facebook, Twitter, Instagram, MessageSquare, Mail, Send, Calendar, BarChart3, Split, Zap, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { FlowNode as FlowNodeType } from './types';
import { getNodeDefinition } from './nodeDefinitions';

const iconMap: Record<string, React.ElementType> = {
  Play, Clock, Globe, Brain, FileText, Image, Hash, Search,
  Youtube, Linkedin, Facebook, Twitter, Instagram, MessageSquare, Mail, Send,
  Calendar, BarChart3, Split, Zap,
};

interface FlowNodeProps {
  node: FlowNodeType;
  isSelected: boolean;
  isConnecting: boolean;
  connectingFrom: string | null;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onPortClick: (nodeId: string, portId: string, direction: 'input' | 'output') => void;
}

const statusIcons: Record<string, React.ElementType | null> = {
  idle: null,
  pending: Clock,
  running: Loader2,
  done: CheckCircle,
  error: XCircle,
};

const statusColors: Record<string, string> = {
  idle: '',
  pending: 'border-yellow-500/60 shadow-yellow-500/20',
  running: 'border-finance-500/60 shadow-finance-500/20 animate-pulse',
  done: 'border-prop-500/60 shadow-prop-500/20',
  error: 'border-red-500/60 shadow-red-500/20',
};

export default function FlowNodeComponent({ node, isSelected, isConnecting, connectingFrom, onSelect, onDragStart, onPortClick }: FlowNodeProps) {
  const def = getNodeDefinition(node.type, node.subtype);
  if (!def) return null;

  const Icon = iconMap[def.icon] || Zap;
  const StatusIcon = statusIcons[node.status];

  return (
    <div
      className={`absolute select-none group ${isSelected ? 'z-20' : 'z-10'}`}
      style={{ left: node.x, top: node.y }}
      onMouseDown={(e) => { e.stopPropagation(); onDragStart(e); }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {/* Node Card */}
      <div
        className={`
          w-[200px] rounded-xl border-2 bg-dark-900/95 backdrop-blur-sm shadow-xl transition-all duration-200 cursor-pointer
          ${isSelected ? `border-finance-500 shadow-finance-500/30 ${statusColors[node.status]}` : `border-dark-700 hover:border-dark-600 ${statusColors[node.status]}`}
        `}
      >
        {/* Header */}
        <div className={`px-3 py-2 rounded-t-[10px] bg-gradient-to-r ${def.gradient} flex items-center gap-2`}>
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-semibold text-white truncate flex-1">{node.label}</span>
          {StatusIcon && (
            <StatusIcon className={`w-3.5 h-3.5 text-white ${node.status === 'running' ? 'animate-spin' : ''}`} />
          )}
        </div>

        {/* Body */}
        <div className="px-3 py-2">
          <p className="text-[10px] text-dark-400 leading-tight">{def.description}</p>
          {node.status === 'error' && node.error && (
            <p className="text-[10px] text-red-400 mt-1 truncate">{node.error}</p>
          )}
        </div>

        {/* Ports */}
        <div className="relative px-0 pb-2">
          {/* Input Ports */}
          {def.inputs.map((port, i) => {
            const totalInputs = def.inputs.length;
            const topOffset = 30 + (i * (40 / Math.max(totalInputs, 1)));
            return (
              <div
                key={port.id}
                className={`absolute left-[-8px] w-4 h-4 rounded-full border-2 bg-dark-900 cursor-pointer transition-all hover:scale-125 hover:bg-finance-500 hover:border-finance-400 ${
                  isConnecting && connectingFrom !== node.id
                    ? 'border-prop-500 bg-prop-500/30 animate-pulse'
                    : 'border-dark-600'
                }`}
                style={{ top: topOffset }}
                onClick={(e) => { e.stopPropagation(); onPortClick(node.id, port.id, 'input'); }}
                title={`Input: ${port.label}`}
              />
            );
          })}

          {/* Output Ports */}
          {def.outputs.map((port, i) => {
            const totalOutputs = def.outputs.length;
            const topOffset = 30 + (i * (40 / Math.max(totalOutputs, 1)));
            return (
              <div
                key={port.id}
                className={`absolute right-[-8px] w-4 h-4 rounded-full border-2 bg-dark-900 cursor-pointer transition-all hover:scale-125 hover:bg-prop-500 hover:border-prop-400 ${
                  isConnecting && connectingFrom === node.id
                    ? 'border-finance-500 bg-finance-500/30 animate-pulse'
                    : 'border-dark-600'
                }`}
                style={{ top: topOffset }}
                onClick={(e) => { e.stopPropagation(); onPortClick(node.id, port.id, 'output'); }}
                title={`Output: ${port.label}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
