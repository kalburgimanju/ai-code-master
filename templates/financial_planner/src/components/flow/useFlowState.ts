'use client';
import { useState, useCallback, useEffect } from 'react';
import { FlowNode, FlowEdge, Flow } from './types';
import { getItem, setItem, generateId } from '@/lib/storage';

const FLOWS_KEY = 'campaign_flows';

const defaultFlow: Flow = {
  id: 'default',
  name: 'My Campaign Flow',
  nodes: [],
  edges: [],
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function useFlowState(flowId?: string) {
  const [flow, setFlow] = useState<Flow>(defaultFlow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [connectingPort, setConnectingPort] = useState<string | null>(null);

  // Load saved flows
  useEffect(() => {
    const savedFlows = getItem<Flow[]>(FLOWS_KEY, []);
    if (flowId) {
      const found = savedFlows.find(f => f.id === flowId);
      if (found) setFlow(found);
    } else if (savedFlows.length > 0) {
      setFlow(savedFlows[0]);
    }
  }, [flowId]);

  // Save flow
  const saveFlow = useCallback(() => {
    const savedFlows = getItem<Flow[]>(FLOWS_KEY, []);
    const updated = { ...flow, updatedAt: new Date().toISOString() };
    const index = savedFlows.findIndex(f => f.id === flow.id);
    if (index >= 0) {
      savedFlows[index] = updated;
    } else {
      savedFlows.push(updated);
    }
    setItem(FLOWS_KEY, savedFlows);
    setFlow(updated);
  }, [flow]);

  // Node operations
  const addNode = useCallback((node: FlowNode) => {
    setFlow(prev => ({
      ...prev,
      nodes: [...prev.nodes, node],
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<FlowNode>) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === id ? { ...n, ...updates } : n),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== id),
      edges: prev.edges.filter(e => e.fromNodeId !== id && e.toNodeId !== id),
      updatedAt: new Date().toISOString(),
    }));
    setSelectedNodeId(null);
  }, []);

  const updateNodes = useCallback((nodes: FlowNode[]) => {
    setFlow(prev => ({ ...prev, nodes, updatedAt: new Date().toISOString() }));
  }, []);

  // Edge operations
  const addEdge = useCallback((edge: FlowEdge) => {
    setFlow(prev => ({
      ...prev,
      edges: [...prev.edges, edge],
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const deleteEdge = useCallback((id: string) => {
    setFlow(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== id),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const updateEdges = useCallback((edges: FlowEdge[]) => {
    setFlow(prev => ({ ...prev, edges, updatedAt: new Date().toISOString() }));
  }, []);

  // Connection handling
  const startConnect = useCallback((nodeId: string, portId: string) => {
    setIsConnecting(true);
    setConnectingFrom(nodeId);
    setConnectingPort(portId);
  }, []);

  const endConnect = useCallback((nodeId: string, portId: string) => {
    if (connectingFrom && connectingPort) {
      const newEdge: FlowEdge = {
        id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        fromNodeId: connectingFrom,
        fromPortId: connectingPort,
        toNodeId: nodeId,
        toPortId: portId,
      };
      addEdge(newEdge);
    }
    cancelConnect();
  }, [connectingFrom, connectingPort, addEdge]);

  const cancelConnect = useCallback(() => {
    setIsConnecting(false);
    setConnectingFrom(null);
    setConnectingPort(null);
  }, []);

  // Flow operations
  const clearFlow = useCallback(() => {
    setFlow(prev => ({
      ...prev,
      nodes: [],
      edges: [],
      status: 'draft',
      updatedAt: new Date().toISOString(),
    }));
    setSelectedNodeId(null);
  }, []);

  const setFlowStatus = useCallback((status: Flow['status']) => {
    setFlow(prev => ({ ...prev, status, updatedAt: new Date().toISOString() }));
  }, []);

  const updateNodeStatus = useCallback((nodeId: string, status: FlowNode['status'], error?: string) => {
    setFlow(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === nodeId ? { ...n, status, error } : n),
    }));
  }, []);

  const exportFlow = useCallback(() => {
    const blob = new Blob([JSON.stringify(flow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flow.name.replace(/\s+/g, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [flow]);

  // Simulate running the flow
  const runFlow = useCallback(async () => {
    setFlowStatus('running');

    // Find trigger nodes (entry points)
    const triggerNodes = flow.nodes.filter(n => n.type === 'trigger');

    // Simple sequential execution simulation
    const executeNode = async (node: FlowNode, visited: Set<string> = new Set()) => {
      if (visited.has(node.id)) return;
      visited.add(node.id);

      // Set to pending first
      updateNodeStatus(node.id, 'pending');

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Set to running
      updateNodeStatus(node.id, 'running');
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

      // Complete the node
      updateNodeStatus(node.id, 'done');

      // Find connected nodes and execute them
      const connectedEdges = flow.edges.filter(e => e.fromNodeId === node.id);
      for (const edge of connectedEdges) {
        const nextNode = flow.nodes.find(n => n.id === edge.toNodeId);
        if (nextNode) {
          await executeNode(nextNode, visited);
        }
      }
    };

    // Execute all trigger nodes
    for (const trigger of triggerNodes) {
      await executeNode(trigger);
    }

    setFlowStatus('completed');
  }, [flow.nodes, flow.edges, setFlowStatus, updateNodeStatus]);

  const stopFlow = useCallback(() => {
    setFlowStatus('error');
    // Reset all node statuses
    flow.nodes.forEach(n => {
      if (n.status === 'running' || n.status === 'pending') {
        updateNodeStatus(n.id, 'idle');
      }
    });
  }, [flow.nodes, setFlowStatus, updateNodeStatus]);

  return {
    flow,
    selectedNodeId,
    setSelectedNodeId,
    isConnecting,
    connectingFrom,
    // Node operations
    addNode,
    updateNode,
    deleteNode,
    updateNodes,
    // Edge operations
    addEdge,
    deleteEdge,
    updateEdges,
    // Connection
    startConnect,
    endConnect,
    cancelConnect,
    // Flow operations
    saveFlow,
    clearFlow,
    setFlowStatus,
    exportFlow,
    runFlow,
    stopFlow,
  };
}
