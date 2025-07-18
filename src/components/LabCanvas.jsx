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
import WorkflowExecutionModal from "./WorkflowExecutionModal";
import { createNode, createEdge, generateId } from "@/lib/graphSchema";
import { NODE_TYPES, CLUSTER_COLORS } from "@/lib/ontology";
import { trpc } from "@/lib/trpc";
import { Save, Download, Upload, Play, RotateCcw, FileJson, FileText, FileCode, FileX2 } from "lucide-react";
import { exportWorkflow } from "@/lib/exportUtils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Custom node types for React Flow
const nodeTypes = {
  semantic: SemanticNode,
};

const LabCanvas = ({ 
  workflow, 
  onWorkflowChange, 
  onExecuteWorkflow,
  isExecuting = false 
}) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges || []);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const { toast } = useToast();
  
  // tRPC mutations
  const createWorkflowMutation = trpc.workflow.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Workflow Created",
        description: `Workflow "${data.title}" has been saved to the database.`,
      });
    },
    onError: (error) => {
      console.error('Failed to create workflow:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save workflow to database. Saved locally instead.",
        variant: "destructive",
      });
    },
  });
  
  const updateWorkflowMutation = trpc.workflow.update.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Workflow Updated",
        description: `Workflow "${data.title}" has been updated.`,
      });
    },
    onError: (error) => {
      console.error('Failed to update workflow:', error);
      toast({
        title: "Update Failed", 
        description: "Failed to update workflow in database. Saved locally instead.",
        variant: "destructive",
      });
    },
  });
  
  // Update parent workflow when nodes/edges change
  React.useEffect(() => {
    if (onWorkflowChange) {
      onWorkflowChange({
        ...workflow,
        nodes,
        edges,
        metadata: {
          ...workflow?.metadata,
          updatedAt: new Date().toISOString()
        }
      });
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
      
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );
  
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
          // Update existing workflow
          await updateWorkflowMutation.mutateAsync({
            id: workflow.id,
            data: {
              title: workflow.metadata?.title || 'Untitled Workflow',
              description: workflow.metadata?.description,
              content: {
                nodes: flow.nodes,
                edges: flow.edges,
                viewport: flow.viewport
              }
            }
          });
        } else {
          // Create new workflow
          const newWorkflow = await createWorkflowMutation.mutateAsync({
            title: workflow?.metadata?.title || 'Untitled Workflow',
            description: workflow?.metadata?.description || 'A semantic logic workflow',
            content: {
              nodes: flow.nodes,
              edges: flow.edges,
              viewport: flow.viewport
            }
          });
          
          // Update local workflow with the new ID
          onWorkflowChange({
            ...workflowData,
            id: newWorkflow.id,
            metadata: {
              ...workflowData.metadata,
              id: newWorkflow.id
            }
          });
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
    <div className="w-full h-full overflow-hidden" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
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
          <WorkflowExecutionModal 
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
