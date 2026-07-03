import React from 'react';
import {
  Zap, Brain, Globe, GitBranch, Clock, FileOutput,
  GripVertical,
} from 'lucide-react';
import { NODE_PALETTE, PaletteItem, NodeType } from '../types';

const iconMap: Record<string, React.ElementType> = {
  Zap, Brain, Globe, GitBranch, Clock, Output: FileOutput,
};

interface NodePaletteProps {
  onDragStart: (item: PaletteItem) => void;
}

export default function NodePalette({ onDragStart }: NodePaletteProps) {
  const handleDragStart = (
    e: React.DragEvent,
    item: PaletteItem
  ) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(item);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider px-3">
        Nodes
      </h3>
      <div className="space-y-1">
        {NODE_PALETTE.map((item) => {
          const Icon = iconMap[item.icon] || Zap;
          return (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-surface-800 border border-transparent hover:border-surface-700 transition-all group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${item.color}20`, color: item.color }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-surface-200">
                  {item.label}
                </div>
                <div className="text-xs text-surface-500 truncate">
                  {item.description}
                </div>
              </div>
              <GripVertical className="w-3.5 h-3.5 text-surface-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
