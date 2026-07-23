'use client';
import { useRouter } from 'next/navigation';
import { useFlowState } from '@/components/flow/useFlowState';
import FlowCanvas from '@/components/flow/FlowCanvas';
import FlowSidebar from '@/components/flow/FlowSidebar';
import FlowProperties from '@/components/flow/FlowProperties';
import FlowToolbar from '@/components/flow/FlowToolbar';
import { getNodeDefinition } from '@/components/flow/nodeDefinitions';

export default function FlowEditorPage() {
  const router = useRouter();
  const {
    flow, selectedNodeId, setSelectedNodeId,
    isConnecting, connectingFrom,
    updateNode, deleteNode, updateNodes,
    updateEdges,
    startConnect, endConnect, cancelConnect,
    saveFlow, clearFlow, exportFlow,
    runFlow, stopFlow,
  } = useFlowState();

  const selectedNode = flow.nodes.find(n => n.id === selectedNodeId) || null;

  const handleNodeUpdate = (id: string, config: Record<string, any>) => {
    updateNode(id, { config });
  };

  // Get default config for a node
  const getNodeDefaultConfig = (node: any) => {
    const def = getNodeDefinition(node.type, node.subtype);
    if (!def) return node.config;
    const config = { ...node.config };
    Object.entries(def.config).forEach(([key, cfg]) => {
      if (config[key] === undefined) config[key] = cfg.default;
    });
    return config;
  };

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      {/* Toolbar */}
      <FlowToolbar
        flowName={flow.name}
        flowStatus={flow.status}
        nodeCount={flow.nodes.length}
        edgeCount={flow.edges.length}
        onRun={runFlow}
        onStop={stopFlow}
        onSave={saveFlow}
        onClear={clearFlow}
        onBack={() => router.push('/marketing')}
        onExport={exportFlow}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <FlowSidebar />

        {/* Canvas */}
        <FlowCanvas
          nodes={flow.nodes}
          edges={flow.edges}
          selectedNodeId={selectedNodeId}
          isConnecting={isConnecting}
          connectingFrom={connectingFrom}
          onNodesChange={updateNodes}
          onEdgesChange={updateEdges}
          onSelectNode={setSelectedNodeId}
          onStartConnect={startConnect}
          onEndConnect={endConnect}
          onCancelConnect={cancelConnect}
        />

        {/* Properties Panel */}
        <FlowProperties
          node={selectedNode}
          onUpdate={handleNodeUpdate}
          onDelete={deleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>
    </div>
  );
}
