import React, { useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import SemanticNode from "./SemanticNode";
import WorkflowExecutionModal95 from "./WorkflowExecutionModal95";
import { createNode, createEdge, generateId } from "@/lib/graphSchema";
import { NODE_TYPES, CLUSTER_COLORS } from "@/lib/ontology";
import { Save, Download, Upload, Play, RotateCcw, FileJson, FileText, FileCode, FileX2 } from "lucide-react";
import { exportWorkflow } from "@/lib/exportUtils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Default custom node types for React Flow (can be overridden via props)
const defaultNodeTypes = { semantic: SemanticNode };

const LabCanvas = ({ 
  workflow, 
  onWorkflowChange, 
  onExecuteWorkflow,
  isExecuting = false,
  nodeTypes: overrideNodeTypes
}) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges || []);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { toast } = useToast();

  // central updater injected into each node data so custom nodes can commit edits
  const updateNodeData = useCallback((id, patch) => {
    setNodes((nds) => nds.map((n) => (
      n.id === id
        ? { ...n, data: { ...n.data, ...patch } }
        : n
    )));
  }, [setNodes]);
  
  const createWorkflowMutation = {
    mutate: (data) => {
      localStorage.setItem(`workflow-${data.id}`, JSON.stringify(data));
      toast({ title: 'Workflow Saved', description: `Workflow "${data.title}" saved locally.` });
    },
    isLoading: false,
  };
  const updateWorkflowMutation = createWorkflowMutation;
  
  // Update parent workflow when nodes/edges change
  React.useEffect(() => {
    if (onWorkflowChange) {
      const updated = {
        ...workflow,
        nodes,
        edges,
        metadata: {
          ...workflow?.metadata,
          updatedAt: new Date().toISOString()
        }
      };
      onWorkflowChange(updated);
      try {
        localStorage.setItem('current-workflow', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('workflow:updated', { detail: { source: 'Builder', workflow: updated } }));
      } catch {}
    }
  }, [nodes, edges]);
  
  const onConnect = useCallback(
    (params) => {
      const newEdge = createEdge(params.source, params.target);
      setEdges((eds) => addEdge({ ...params, ...newEdge }, eds));
    },
    [setEdges]
  );
  
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeType = event.dataTransfer.getData('application/reactflow');
      
      if (!nodeType || !reactFlowInstance) {
        return;
      }
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const newNode = createNode(nodeType, position);
      newNode.type = 'semantic'; // React Flow node type
      newNode.data.type = nodeType; // Our semantic type
      newNode.data._onUpdate = (nodeId, patch) => updateNodeData(nodeId, patch);
      
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  // ensure nodes always carry the update callback (e.g., after load)
  React.useEffect(() => {
    setNodes((nds) => nds.map((n) => {
      const withCb = n.data && typeof n.data._onUpdate === 'function' ? n : { ...n, data: { ...n.data, _onUpdate: (nodeId, patch) => updateNodeData(nodeId, patch) } };
      if (!withCb.width || !withCb.height) {
        return { ...withCb, width: withCb.width || 320, height: withCb.height || 220 };
      }
      return withCb;
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const onSaveWorkflow = useCallback(async () => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const workflowData = {
        ...workflow,
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport
      };
      
      try {
        if (workflow?.id) {
          updateWorkflowMutation.mutate({
            id: workflow.id,
            title: workflow.metadata?.title || 'Untitled Workflow',
            description: workflow.metadata?.description,
            content: {
              nodes: flow.nodes,
              edges: flow.edges,
              viewport: flow.viewport,
            },
          });
        } else {
          // Create new workflow
          createWorkflowMutation.mutate({
            title: workflow?.metadata?.title || 'Untitled Workflow',
            description: workflow?.metadata?.description || 'A semantic logic workflow',
            content: {
              nodes: flow.nodes,
              edges: flow.edges,
              viewport: flow.viewport
            }
          });
          onWorkflowChange(workflowData);
        }
      } catch (error) {
        // Fallback to localStorage if API fails
        localStorage.setItem('current-workflow', JSON.stringify(workflowData));
        console.log('Workflow saved to localStorage as fallback:', workflowData);
      }
    }
  }, [reactFlowInstance, workflow, createWorkflowMutation, updateWorkflowMutation, onWorkflowChange]);
  
  const onExportWorkflow = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      const workflowData = {
        ...workflow,
        nodes: flow.nodes,
        edges: flow.edges,
        viewport: flow.viewport
      };
      
      const dataStr = JSON.stringify(workflowData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `workflow-${workflow?.metadata?.title || 'untitled'}-${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  }, [reactFlowInstance, workflow]);
  
  const onResetCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, [setNodes, setEdges]);

  const onAddBlankNode = useCallback(() => {
    if (!reactFlowInstance || !reactFlowWrapper.current) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const center = reactFlowInstance.project({ x: bounds.width / 2, y: bounds.height / 2 });
    const node = createNode('UTIL-BLANK', center);
    node.type = 'semantic';
    node.data.type = 'UTIL-BLANK';
    node.data.isNew = true;
    node.data._onUpdate = (nodeId, patch) => updateNodeData(nodeId, patch);
    setNodes((nds) => nds.concat(node));
  }, [reactFlowInstance, updateNodeData, setNodes]);

  const handleExport = useCallback((format) => {
    if (!workflow) return;
    
    try {
      const exportData = exportWorkflow(workflow, format);
      const blob = new Blob([exportData.content], { type: exportData.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = exportData.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `Workflow exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [workflow, toast]);
  
  // Stats for the panel
  const stats = useMemo(() => {
    const nodesByCluster = nodes.reduce((acc, node) => {
      const cluster = node.data?.metadata?.cluster || 'unknown';
      acc[cluster] = (acc[cluster] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      clusters: nodesByCluster
    };
  }, [nodes, edges]);
  
  return (
    <div className="w-full h-full overflow-hidden" ref={reactFlowWrapper} data-testid="lab-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={overrideNodeTypes || defaultNodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-background dark:bg-gray-900 w-full h-full"
      >
        <Background 
          color="hsl(var(--border))" 
          gap={20} 
          className="dark:opacity-30" 
        />
        <Controls className="bg-card border-border" />
        <MiniMap 
          nodeColor={(node) => {
            const cluster = node.data?.metadata?.cluster;
            return cluster ? CLUSTER_COLORS[cluster] : '#6B7280';
          }}
          className="bg-card border border-border"
        />
        
        {/* Top Panel - Controls */}
        <Panel position="top-right" className="flex gap-2">
          <Button onClick={onAddBlankNode} variant="outline" className="bg-card border-border">
            + New
          </Button>
          <WorkflowExecutionModal95 
            workflow={workflow} 
            trigger={
              <Button
                disabled={isExecuting || nodes.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="h-4 w-4 mr-1" />
                {isExecuting ? 'Executing...' : 'Execute'}
              </Button>
            }
          />
          
          <Button onClick={onSaveWorkflow} variant="outline" className="bg-card border-border">
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-card border-border">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileJson className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('markdown')}>
                <FileText className="h-4 w-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('yaml')}>
                <FileCode className="h-4 w-4 mr-2" />
                Export as YAML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('xml')}>
                <FileX2 className="h-4 w-4 mr-2" />
                Export as XML
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={onResetCanvas} variant="outline" className="bg-card border-border">
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const LabCanvasWrapper = (props) => {
  return (
    <ReactFlowProvider>
      <LabCanvas {...props} />
    </ReactFlowProvider>
  );
};

export default LabCanvasWrapper;
