import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  NodeTypes,
  ReactFlowInstance,
  SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import TriggerNode from './nodes/TriggerNode';
import AgentNode from './nodes/AgentNode';
import ActionNode from './nodes/ActionNode';
import ConditionNode from './nodes/ConditionNode';
import DelayNode from './nodes/DelayNode';
import OutputNode from './nodes/OutputNode';
import ConfigPanel from './panels/ConfigPanel';
import ExecutionLogPanel from './panels/ExecutionLogPanel';
import { Workflow, WorkflowNode, Execution, PaletteItem, NodeType } from '../types';

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  output: OutputNode,
};

interface CanvasProps {
  workflow: Workflow;
  onChange: (nodes: WorkflowNode[], edges: any[]) => void;
  execution: Execution | null;
}

export default function Canvas({ workflow, onChange, execution }: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: any } | null>(null);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);

  // Convert workflow nodes to React Flow format
  const initialNodes: Node[] = workflow.nodes.map((n) => ({
    id: n.id,
    type: n.data.type,
    position: n.position,
    data: n.data,
    draggable: true,
  }));

  const initialEdges: Edge[] = workflow.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    animated: false,
    style: { stroke: '#475569', strokeWidth: 2 },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync external changes
  useEffect(() => {
    setNodes(
      workflow.nodes.map((n) => ({
        id: n.id,
        type: n.data.type,
        position: n.position,
        data: n.data,
        draggable: true,
      }))
    );
    setEdges(
      workflow.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        animated: false,
        style: { stroke: '#475569', strokeWidth: 2 },
      }))
    );
  }, [workflow.id]);

  // Report changes back
  useEffect(() => {
    const wfNodes: WorkflowNode[] = nodes.map((n) => ({
      id: n.id,
      type: n.data.type as NodeType,
      position: n.position,
      data: n.data,
    }));
    const wfEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
    }));
    onChange(wfNodes, wfEdges);
  }, [nodes, edges]);

  // Show execution panel when execution is running/completed
  useEffect(() => {
    if (execution) {
      setShowExecutionPanel(true);
    }
  }, [execution?.id]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: false,
            style: { stroke: '#6366f1', strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData('application/json');
      if (!rawData || !reactFlowInstance) return;

      const paletteItem: PaletteItem = JSON.parse(rawData);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newId = `node-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newNode: Node = {
        id: newId,
        type: paletteItem.type,
        position,
        data: {
          label: paletteItem.label,
          type: paletteItem.type,
          config: JSON.parse(JSON.stringify(paletteItem.defaultConfig)),
        },
        draggable: true,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode({ id: node.id, data: node.data });
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, newData: Partial<any>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return { ...n, data: { ...n.data, ...newData } };
          }
          return n;
        })
      );
      setSelectedNode((prev) =>
        prev?.id === nodeId
          ? { id: nodeId, data: { ...prev.data, ...newData } }
          : prev
      );
    },
    [setNodes]
  );

  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
        )
      );
      setSelectedNode(null);
    }
  }, [selectedNode, setNodes, setEdges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          deleteSelected();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);

  return (
    <div className="flex h-full">
      <div ref={reactFlowWrapper} className="flex-1 h-full">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            fitView
            selectionMode={SelectionMode.Partial}
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Shift"
            snapToGrid
            snapGrid={[20, 20]}
            defaultEdgeOptions={{
              style: { stroke: '#475569', strokeWidth: 2 },
              animated: false,
            }}
          >
            <Background color="#1e293b" gap={20} size={1} />
            <Controls
              showInteractive={false}
              className="!bg-surface-900 !border-surface-800"
            />
            <MiniMap
              nodeColor={(n) => {
                const colors: Record<string, string> = {
                  trigger: '#f59e0b',
                  agent: '#818cf8',
                  action: '#22c55e',
                  condition: '#f97316',
                  delay: '#06b6d4',
                  output: '#ec4899',
                };
                return colors[n.type || 'default'] || '#64748b';
              }}
              maskColor="rgba(2, 6, 23, 0.7)"
              className="!bg-surface-900 !border-surface-800"
              style={{ height: 120 }}
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Right Panel */}
      {selectedNode && !showExecutionPanel && (
        <ConfigPanel
          nodeId={selectedNode.id}
          data={selectedNode.data}
          onUpdate={updateNodeData}
          onClose={() => setSelectedNode(null)}
        />
      )}
      {showExecutionPanel && (
        <ExecutionLogPanel
          execution={execution}
          onClose={() => setShowExecutionPanel(false)}
        />
      )}
    </div>
  );
}
