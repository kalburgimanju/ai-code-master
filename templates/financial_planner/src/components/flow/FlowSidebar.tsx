'use client';
import { useState } from 'react';
import { Play, Clock, Globe, Brain, FileText, Image, Hash, Search, Youtube, Linkedin, Facebook, Twitter, Instagram, MessageSquare, Mail, Send, Calendar, BarChart3, Split, Zap, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { NODE_CATEGORIES, NodeType, NodeDefinition } from './types';
import { getNodesByCategory } from './nodeDefinitions';

const iconMap: Record<string, React.ElementType> = {
  Play, Clock, Globe, Brain, FileText, Image, Hash, Search,
  Youtube, Linkedin, Facebook, Twitter, Instagram, MessageSquare, Mail, Send,
  Calendar, BarChart3, Split, Zap,
};

export default function FlowSidebar() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    trigger: true,
    ai_model: true,
    content: true,
    social: true,
    action: true,
  });

  const toggleCategory = (type: string) => {
    setExpandedCategories(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const handleDragStart = (e: React.DragEvent, def: NodeDefinition) => {
    e.dataTransfer.setData('application/json', JSON.stringify(def));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-64 bg-dark-900/95 backdrop-blur-sm border-r border-dark-800 flex flex-col shrink-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-800">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-finance-400" /> Node Palette
        </h2>
        <p className="text-[10px] text-dark-500 mt-1">Drag nodes to the canvas</p>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {NODE_CATEGORIES.map(cat => {
          const nodes = getNodesByCategory(cat.type);
          const isExpanded = expandedCategories[cat.type];

          return (
            <div key={cat.type}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.type)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-dark-800 transition-all"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-dark-500" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-dark-500" />
                )}
                <div className={`w-5 h-5 rounded bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                  <span className="text-[8px] text-white font-bold">{nodes.length}</span>
                </div>
                <span className="text-xs font-medium text-dark-300">{cat.label}</span>
              </button>

              {/* Nodes */}
              {isExpanded && (
                <div className="ml-4 space-y-1 mb-2">
                  {nodes.map(def => {
                    const Icon = iconMap[def.icon] || Zap;
                    return (
                      <div
                        key={def.subtype}
                        draggable
                        onDragStart={(e) => handleDragStart(e, def)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-dark-800 cursor-grab active:cursor-grabbing transition-all group"
                      >
                        <GripVertical className="w-3 h-3 text-dark-700 group-hover:text-dark-500 shrink-0" />
                        <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${def.gradient} flex items-center justify-center shrink-0`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-medium text-dark-200 truncate">{def.label}</p>
                          <p className="text-[9px] text-dark-500 truncate">{def.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-dark-800">
        <p className="text-[10px] text-dark-500 text-center">{Object.values(expandedCategories).filter(Boolean).length} categories • Click + drag to add</p>
      </div>
    </div>
  );
}
