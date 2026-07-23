'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { FlowNode, FlowEdge } from './types';
import FlowNodeComponent from './FlowNode';
import FlowEdgeComponent, { EdgeDefs } from './FlowEdge';
import { createDefaultNode } from './nodeDefinitions';
import { NodeDefinition } from './types';

interface FlowCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  selectedNodeId: string | null;
  isConnecting: boolean;
  connectingFrom: string | null;
  onNodesChange: (nodes: FlowNode[]) => void;
  onEdgesChange: (edges: FlowEdge[]) => void;
  onSelectNode: (id: string | null) => void;
  onStartConnect: (nodeId: string, portId: string) => void;
  onEndConnect: (nodeId: string, portId: string) => void;
  onCancelConnect: () => void;
}

export default function FlowCanvas({
  nodes, edges, selectedNodeId, isConnecting, connectingFrom,
  onNodesChange, onEdgesChange, onSelectNode,
  onStartConnect, onEndConnect, onCancelConnect,
}: FlowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Track canvas position for drop accuracy
  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setCanvasOffset({ x: rect.left, y: rect.top });
    }
  });

  const handleNodeDragStart = useCallback((nodeId: string, e: React.MouseEvent) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    setDragging(nodeId);
    setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
  }, [nodes]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onNodesChange(nodes.map(n => n.id === dragging ? { ...n, x: newX, y: newY } : n));
    }
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      if (canvasRef.current) {
        canvasRef.current.scrollLeft -= dx;
        canvasRef.current.scrollTop -= dy;
      }
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [dragging, dragOffset, isPanning, panStart, nodes, onNodesChange]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      onSelectNode(null);
      if (isConnecting) onCancelConnect();
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [onSelectNode, isConnecting, onCancelConnect]);

  const handlePortClick = useCallback((nodeId: string, portId: string, direction: 'input' | 'output') => {
    if (direction === 'output') {
      onStartConnect(nodeId, portId);
    } else if (isConnecting && connectingFrom) {
      // Don't connect to same node
      if (nodeId === connectingFrom) return;
      // Check if connection already exists
      const exists = edges.some(e => e.fromNodeId === connectingFrom && e.toNodeId === nodeId);
      if (!exists) {
        onEndConnect(nodeId, portId);
      }
    }
  }, [isConnecting, connectingFrom, edges, onStartConnect, onEndConnect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    const def: NodeDefinition = JSON.parse(data);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left + (canvasRef.current?.scrollLeft || 0);
    const y = e.clientY - rect.top + (canvasRef.current?.scrollTop || 0);

    const newNode = createDefaultNode(def, x, y);
    onNodesChange([...nodes, newNode]);
  }, [nodes, onNodesChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          onNodesChange(nodes.filter(n => n.id !== selectedNodeId));
          onEdgesChange(edges.filter(e => e.fromNodeId !== selectedNodeId && e.toNodeId !== selectedNodeId));
          onSelectNode(null);
        }
      }
      if (e.key === 'Escape') {
        onCancelConnect();
        onSelectNode(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, nodes, edges, onNodesChange, onEdgesChange, onSelectNode, onCancelConnect]);

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-auto relative bg-dark-950 cursor-grab active:cursor-grabbing"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Grid Background */}
      <div className="canvas-bg absolute inset-0" style={{
        backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.08) 1px, transparent 1px)',
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
      }} />

      {/* Canvas Content */}
      <div className="relative min-w-[3000px] min-h-[2000px]" style={{ transform: `scale(${zoom})`, transformOrigin: '0 0' }}>
        {/* SVG Layer for Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <EdgeDefs />
          {edges.map(edge => (
            <FlowEdgeComponent key={edge.id} edge={edge} nodes={nodes} />
          ))}
        </svg>

        {/* Nodes Layer */}
        {nodes.map(node => (
          <FlowNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isConnecting={isConnecting}
            connectingFrom={connectingFrom}
            onSelect={() => onSelectNode(node.id)}
            onDragStart={(e) => handleNodeDragStart(node.id, e)}
            onPortClick={handlePortClick}
          />
        ))}
      </div>

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold text-dark-400">Build Your Campaign Flow</h3>
            <p className="text-sm text-dark-500 mt-2 max-w-sm">
              Drag nodes from the sidebar to get started.<br />
              Connect nodes by clicking output → input ports.
            </p>
          </div>
        </div>
      )}

      {/* Zoom Controls */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-dark-900/90 backdrop-blur-sm border border-dark-700 rounded-xl px-3 py-2 z-30">
        <button
          onClick={() => setZoom(z => Math.max(0.3, z - 0.1))}
          className="w-7 h-7 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 flex items-center justify-center text-sm font-bold"
        >−</button>
        <span className="text-xs text-dark-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(z => Math.min(2, z + 0.1))}
          className="w-7 h-7 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 flex items-center justify-center text-sm font-bold"
        >+</button>
        <button
          onClick={() => setZoom(1)}
          className="w-7 h-7 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-300 flex items-center justify-center text-[10px]"
        >1:1</button>
      </div>
    </div>
  );
}
