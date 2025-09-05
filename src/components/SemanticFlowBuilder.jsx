import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  Panel,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import components
import SemanticNode95 from './SemanticNode95';
import NodeEnhancementModal from './NodeEnhancementModal95';
import WorkflowExecutionModal95 from './WorkflowExecutionModal95';
import { createWorkflowSchema, createNode, createEdge, generateId } from '@/lib/graphSchema';
import { emitNodeSelected } from '@/lib/workflowBus';
import { upsertField } from '@/lib/nodeModel';
import { NODE_TYPES, CLUSTER_COLORS, ONTOLOGY_CLUSTERS, getClusterSummary } from '@/lib/ontology';
import { exportWorkflow } from '@/lib/exportUtils';

// Import styling
import './win95-plus.css';
import '../nav-fixes.css';

const SemanticFlowBuilder = () => {
  // Initialize workflow from localStorage or create new one
  const [workflow, setWorkflow] = useState(() => {
    const saved = localStorage.getItem('current-workflow');
    if (saved) { try { return JSON.parse(saved); } catch {} }
    const wf = createWorkflowSchema();
    wf.id = generateId();
    wf.metadata.title = 'Untitled Workflow';
    wf.metadata.createdAt = new Date().toISOString();
    wf.metadata.updatedAt = new Date().toISOString();
    return wf;
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(workflow?.nodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflow?.edges || []);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeToolId, setActiveToolId] = useState('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [openCluster, setOpenCluster] = useState({});
  const fileInputRef = useRef(null);
  const [locked, setLocked] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  // Sidebar visibility
  const [showPalette, setShowPalette] = useState(() => {
    try {
      const v = localStorage.getItem('builder-showPalette');
      return v === null ? true : v === 'true';
    } catch { return true; }
  });
  const [showInspector, setShowInspector] = useState(() => {
    try {
      const v = localStorage.getItem('builder-showInspector');
      return v === null ? true : v === 'true';
    } catch { return true; }
  });

  // Save workflow to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('current-workflow', JSON.stringify(workflow));
  }, [workflow]);

  // Listen for external workflow updates and sync
  useEffect(() => {
    const onExternalUpdate = (e) => {
      try {
        const { source, workflow: next } = e.detail || {};
        if (!next || source === 'Builder') return; // avoid loopback
        setWorkflow((prev) => ({ ...prev, ...next }));
      } catch {}
    };
    window.addEventListener('workflow:updated', onExternalUpdate);
    return () => window.removeEventListener('workflow:updated', onExternalUpdate);
  }, []);

  // Persist sidebar preferences
  useEffect(() => {
    try { localStorage.setItem('builder-showPalette', String(showPalette)); } catch {}
  }, [showPalette]);
  useEffect(() => {
    try { localStorage.setItem('builder-showInspector', String(showInspector)); } catch {}
  }, [showInspector]);

  // Update parent workflow when nodes/edges change
  useEffect(() => {
    const updated = {
      ...workflow,
      nodes,
      edges,
      metadata: {
        ...workflow?.metadata,
        updatedAt: new Date().toISOString()
      }
    };
    setWorkflow(updated);
    try {
      window.dispatchEvent(new CustomEvent('workflow:updated', { 
        detail: { source: 'Builder', workflow: updated } 
      }));
    } catch {}
  }, [nodes, edges]);

  // central updater injected into each node data so custom nodes can commit edits
  const updateNodeData = useCallback((id, patch) => {
    setNodes((nds) => nds.map((n) => (
      n.id === id
        ? { ...n, data: { ...n.data, ...patch } }
        : n
    )));
  }, [setNodes]);

  // ensure nodes always carry the update callback (e.g., after load)
  useEffect(() => {
    setNodes((nds) => nds.map((n) => {
      // Normalize any legacy/loaded nodes to use our custom 'semantic' type
      const isCustomRenderer = n.type === 'semantic';
      const semanticType = n.data?.type || (!isCustomRenderer ? n.type : undefined);
      // Build/merge canonical fields for non-blank nodes
      const existingFields = Array.isArray(n.data?.fields) ? [...n.data.fields] : [];
      let mergedFields = existingFields;
      if (semanticType && semanticType !== 'UTIL-BLANK') {
        const nt = NODE_TYPES[semanticType] || {};
        const getField = (name) => existingFields.find(f => f?.name === name)?.value;
        mergedFields = upsertField(mergedFields, 'title', 'text', n.data?.title || n.data?.label || nt.label || 'Node');
        mergedFields = upsertField(mergedFields, 'tags', 'tags', Array.isArray(n.data?.tags) ? n.data.tags : (Array.isArray(n.data?.metadata?.tags) ? n.data.metadata.tags : (nt.tags || [])));
        mergedFields = upsertField(mergedFields, 'ontology-type', 'text', semanticType);
        mergedFields = upsertField(mergedFields, 'description', 'longText', n.data?.description || n.data?.metadata?.description || nt.description || '');
        mergedFields = upsertField(mergedFields, 'content', 'longText', n.data?.content || '');
        // Preserve icon from existing field if present, else from top-level or ontology
        const existingIcon = getField('icon');
        mergedFields = upsertField(mergedFields, 'icon', 'text', existingIcon ?? n.data?.icon ?? nt.icon ?? '📦');
      } else if (semanticType === 'UTIL-BLANK') {
        mergedFields = [];
      }

      const normalized = {
        ...n,
        type: 'semantic',
        width: n.width || 320,
        height: n.height || 220,
        data: {
          ...(n.data || {}),
          ...(semanticType ? { type: semanticType } : {}),
          ...(semanticType ? { fields: mergedFields } : {}),
          _onUpdate: (nodeId, patch) => updateNodeData(nodeId, patch)
        },
        position: n.position || { x: 0, y: 0 }
      };
      return normalized;
    }));
  }, []);

  const onConnect = useCallback(
    (params) => {
      const newEdge = createEdge(params.source, params.target);
      setEdges((eds) => addEdge({ ...params, ...newEdge }, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event, node) => {
    // Prevent double click editing from immediately triggering
    event.stopPropagation();
    setSelectedNode(node);
    try { emitNodeSelected('Builder', node?.id); } catch {}
  }, []);

  const reactFlowWrapper = useRef(null);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance) {
        console.error("ReactFlow instance or bounds not found");
        return;
      }
      
      const nodeType = event.dataTransfer.getData('application/reactflow');
      
      if (!nodeType) {
        console.log("No node type in drop data");
        return;
      }
      
      // Use client coordinates directly with screenToFlowPosition (API expects screen/client coords)
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const newNode = createNode(nodeType, position);
      newNode.type = 'semantic'; // React Flow node type
      newNode.data.type = nodeType; // Our semantic type
      newNode.data._onUpdate = (nodeId, patch) => updateNodeData(nodeId, patch);
      
      setNodes((nds) => nds.concat(newNode));
      setSelectedNode(newNode);
      
      console.log(`Added new node of type ${nodeType} at position`, position);
    },
    [reactFlowInstance, setNodes, updateNodeData]
  );

  const onExecuteWorkflow = useCallback(async () => {
    setIsExecuting(true);
    setTimeout(() => { setIsExecuting(false); }, 600);
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
      
      localStorage.setItem('current-workflow', JSON.stringify(workflowData));
      console.log('Workflow saved:', workflowData);
      
      // You would normally save to backend here as well
    }
  }, [reactFlowInstance, workflow]);

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

  // Import workflow from JSON file
  const onImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onImportFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        // Accept either full workflow or React Flow toObject shape
        const importedNodes = (parsed.nodes || []).map((n) => ({
          ...n,
          // Use our custom renderer and carry semantic type in data.type
          type: 'semantic',
          data: {
            ...(n.data || {}),
            type: n.data?.type || n.type,
            _onUpdate: (nodeId, patch) => updateNodeData(nodeId, patch),
          },
          position: n.position || { x: 0, y: 0 },
        }));
        const importedEdges = (parsed.edges || []).map((e) => ({ ...e }));

        setNodes(importedNodes);
        setEdges(importedEdges);

        // Update workflow metadata if present
        setWorkflow((prev) => ({
          ...(prev || {}),
          ...(parsed.id ? parsed : {}),
          nodes: importedNodes,
          edges: importedEdges,
          viewport: parsed.viewport || prev?.viewport || { x: 0, y: 0, zoom: 1 },
        }));

        // Fit view after next paint
        setTimeout(() => {
          if (reactFlowInstance) {
            if (parsed.viewport) {
              reactFlowInstance.setViewport(parsed.viewport, { duration: 200 });
            } else {
              reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true });
            }
          }
        }, 0);
      } catch (err) {
        console.error('Failed to import workflow:', err);
      } finally {
        // reset the input so same file can be re-imported
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }, [reactFlowInstance, setNodes, setEdges, setWorkflow, updateNodeData]);

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
    } catch (error) {
      console.error("Export Failed", error.message);
    }
  }, [workflow]);

  const onResetView = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
      setZoomLevel(100);
    }
  }, [reactFlowInstance]);

  const onAddBlankNode = useCallback(() => {
    if (!reactFlowInstance || !reactFlowWrapper.current) return;
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    
    // Use the viewport center coordinates in client space
    const viewportCenterClient = {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2
    };
    
    // Convert to flow coordinates using screenToFlowPosition
    const position = reactFlowInstance.screenToFlowPosition(viewportCenterClient);
    
    const node = createNode('UTIL-BLANK', position);
    node.type = 'semantic';
    node.data.type = 'UTIL-BLANK';
    node.data.isNew = true;
    node.data._onUpdate = (nodeId, patch) => updateNodeData(nodeId, patch);
    
    setNodes((nds) => nds.concat(node));
    setSelectedNode(node);
    
    console.log("Added blank node at position", position);
  }, [reactFlowInstance, updateNodeData, setNodes]);
  
  const onDuplicateNode = useCallback(() => {
    if (!selectedNode) return;
    
    const newNode = {
      ...selectedNode,
      id: generateId(),
      position: {
        x: selectedNode.position.x + 20,
        y: selectedNode.position.y + 20
      }
    };
    
    // Make sure the new node has the update callback
    newNode.data = {
      ...newNode.data,
      _onUpdate: (nodeId, patch) => updateNodeData(nodeId, patch)
    };
    
    setNodes((nds) => nds.concat(newNode));
    setSelectedNode(newNode);
  }, [selectedNode, updateNodeData, setNodes]);
  
  const onDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    
    setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  const onZoomIn = useCallback(() => {
    if (reactFlowInstance) {
      const nextZoom = Math.min(reactFlowInstance.getZoom() + 0.1, 2.0);
      reactFlowInstance.zoomTo(nextZoom);
      setZoomLevel(Math.round(nextZoom * 100));
    }
  }, [reactFlowInstance]);

  const onZoomOut = useCallback(() => {
    if (reactFlowInstance) {
      const nextZoom = Math.max(reactFlowInstance.getZoom() - 0.1, 0.1);
      reactFlowInstance.zoomTo(nextZoom);
      setZoomLevel(Math.round(nextZoom * 100));
    }
  }, [reactFlowInstance]);
  
  const onSelectTool = useCallback((toolId) => {
    setActiveToolId(toolId);
  }, []);

  const onGenerateAINode = useCallback(() => {
    if (!aiPrompt.trim() || !reactFlowInstance || !reactFlowWrapper.current) return;
    
    console.log('Generating node from AI prompt:', aiPrompt);
    
    try {
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      
      // Use the viewport center coordinates (client space)
      const viewportCenterClient = {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2
      };
      
      // Convert to flow coordinates
      const position = reactFlowInstance.screenToFlowPosition(viewportCenterClient);
      
      const node = createNode('UTIL-BLANK', position);
      node.type = 'semantic';
      node.data.type = 'UTIL-BLANK';
      node.data.label = 'AI Generated';
      node.data.content = aiPrompt;
      node.data._onUpdate = (nodeId, patch) => updateNodeData(nodeId, patch);
      
      setNodes((nds) => nds.concat(node));
      setSelectedNode(node);
      setAiPrompt('');
      
      console.log("Added AI node at position", position);
    } catch (error) {
      console.error("Failed to create AI node:", error);
    }
  }, [aiPrompt, reactFlowInstance, updateNodeData, setNodes]);

  const onDragStart = useCallback((e, code) => {
    e.dataTransfer.setData('application/reactflow', code);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
    console.log(`Started dragging node type: ${code}`);
  }, []);

  const memoNodeTypes = useMemo(() => ({ semantic: SemanticNode95 }), []);
  const clusters = useMemo(() => getClusterSummary().sort((a,b)=>a.name.localeCompare(b.name)), []);
  const contentColumns = useMemo(() => {
    if (showPalette && showInspector) return '300px 1fr 220px';
    if (showPalette && !showInspector) return '300px 1fr';
    if (!showPalette && showInspector) return '1fr 220px';
    return '1fr';
  }, [showPalette, showInspector]);

  // Re-fit view when layout changes so nodes stay in view
  useEffect(() => {
    if (!reactFlowInstance) return;
    const id = setTimeout(() => {
      try { reactFlowInstance.fitView({ padding: 0.2 }); } catch {}
    }, 60);
    return () => clearTimeout(id);
  }, [showPalette, showInspector, reactFlowInstance]);

  return (
    <div className="w95-window" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Top Menu Bar */}
      <div className="w95-menu-bar">
        <WorkflowExecutionModal95
          workflow={workflow}
          trigger={
            <button className="w95-button" disabled={isExecuting}>
              {isExecuting ? 'Executing...' : 'Execute…'}
            </button>
          }
        />
        <button className="w95-button" onClick={onSaveWorkflow}>
          Save
        </button>
        <button className="w95-button" onClick={onImportClick}>
          Import
        </button>
        <button className="w95-button" onClick={onExportWorkflow}>
          Export
        </button>
        {/* Hidden file input for Import */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={onImportFile}
        />
        <button className="w95-button" onClick={onResetView}>
          Reset View
        </button>
        <button className="w95-button" onClick={() => setShowPalette(v => !v)}>
          {showPalette ? 'Hide Palette' : 'Show Palette'}
        </button>
        <button className="w95-button" onClick={() => setShowInspector(v => !v)}>
          {showInspector ? 'Hide Inspector' : 'Show Inspector'}
        </button>
        <div className="w95-spacer"></div>
        <button className="w95-button" onClick={onZoomOut}>-</button>
        <button className="w95-button" onClick={onZoomIn}>+</button>
        <div className="w95-zoom-display">{`Zoom ${zoomLevel}%`}</div>
      </div>

      {/* Main Content Area */}
      <div className="w95-content-area" style={{ gridTemplateColumns: contentColumns }}>
        {/* Left Panel - Palette */}
        <div className="w95-panel w95-palette" style={{ display: showPalette ? 'flex' : 'none' }}>
          <div className="w95-panel-title">
            Palette
            <button
              className="w95-minimize"
              title="Hide Palette"
              onClick={() => setShowPalette(false)}
              style={{ float: 'right' }}
            >×</button>
          </div>
          <div className="w95-panel-content">
            <input 
              type="text" 
              className="w95-search" 
              placeholder="Search nodes…" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            {/* Tool Selection */}
            <div className="w95-tools-section">
              <div className="w95-tools-grid">
                <button 
                  className={`w95-tool-button ${activeToolId === 'select' ? 'w95-active' : ''}`}
                  onClick={() => onSelectTool('select')}
                >Select</button>
                <button 
                  className={`w95-tool-button ${activeToolId === 'connect' ? 'w95-active' : ''}`}
                  onClick={() => onSelectTool('connect')}
                >Connect</button>
                <button 
                  className={`w95-tool-button ${activeToolId === 'group' ? 'w95-active' : ''}`}
                  onClick={() => onSelectTool('group')}
                >Group</button>
                <button 
                  className={`w95-tool-button ${activeToolId === 'frame' ? 'w95-active' : ''}`}
                  onClick={() => onSelectTool('frame')}
                >Frame</button>
                <button 
                  className={`w95-tool-button ${activeToolId === 'text' ? 'w95-active' : ''}`}
                  onClick={() => onSelectTool('text')}
                >Text</button>
                <button 
                  className={`w95-tool-button ${activeToolId === 'comment' ? 'w95-active' : ''}`}
                  onClick={() => onSelectTool('comment')}
                >Comment</button>
                <button 
                  className={`w95-tool-button ${activeToolId === 'probe' ? 'w95-active' : ''}`}
                  onClick={() => onSelectTool('probe')}
                >Probe</button>
                <button 
                  className={`w95-tool-button ${activeToolId === 'measure' ? 'w95-active' : ''}`}
                  onClick={() => onSelectTool('measure')}
                >Measure</button>
              </div>
            </div>

            {/* Blank Node Button */}
            <button className="w95-button w95-block" onClick={onAddBlankNode}>
              + Blank Node
            </button>

            {/* AI Text-to-Node */}
            <div className="w95-ai-section">
              <div className="w95-section-header">AI Generate Node</div>
              <textarea 
                className="w95-textarea"
                placeholder="Describe the node you want to create..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
              ></textarea>
              <button 
                className="w95-button w95-generate"
                onClick={onGenerateAINode}
                disabled={!aiPrompt.trim()}
              >
                Generate
              </button>
            </div>

            {/* Semantic Ontology Swatches */}
            <div className="w95-swatches-section">
              {clusters.map((c) => {
                const isOpen = !!openCluster[c.code];
                const nodeList = Object.entries(NODE_TYPES)
                  .filter(([code, n]) => n.cluster === c.code && 
                    (!searchQuery || 
                      code.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (n.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (n.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                    )
                  )
                  .map(([code, n]) => ({ code, ...n }));
                
                if (searchQuery && nodeList.length === 0) return null;
                
                return (
                  <div key={c.code} className="w95-cluster">
                    <button 
                      className={`w95-cluster-button ${isOpen ? 'w95-active' : ''}`}
                      onClick={() => setOpenCluster(prev => ({ ...prev, [c.code]: !prev[c.code] }))}
                    >
                      {ONTOLOGY_CLUSTERS[c.code]?.icon || '■'} {c.name}
                      <span className="w95-cluster-count">({nodeList.length})</span>
                    </button>
                    
                    {isOpen && nodeList.length > 0 && (
                      <div className="w95-node-list">
                        {nodeList.map((node) => (
                          <div
                            key={node.code}
                            className="w95-node-item"
                            draggable
                            onDragStart={(e) => onDragStart(e, node.code)}
                            title={node.description}
                            style={{ borderColor: CLUSTER_COLORS[c.code] || '#808080' }}
                          >
                            <div className="w95-node-item-content">
                              <span>{node.icon || '□'}</span>
                              <span>{node.label}</span>
                            </div>
                            <div className="w95-node-item-tags">
                              {(node.tags || []).slice(0, 2).map((tag, i) => (
                                <span key={i} className="w95-tag">{tag}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="w95-brush-info">
                <div className="w95-brush-title">Brush</div>
                <div className="w95-brush-text">Current: Intent</div>
                <div className="w95-brush-text">Edges: Directed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle - Flow Canvas */}
        <div className="w95-panel w95-canvas" ref={reactFlowWrapper}>
          <div className="w95-panel-title">Canvas</div>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={memoNodeTypes}
            onNodeClick={onNodeClick}
            nodesDraggable={true}
            elementsSelectable={true}
            selectNodesOnDrag={false}
            fitView
            proOptions={{ hideAttribution: true }}
            panOnDrag={!locked}
            zoomOnScroll={!locked}
            zoomOnPinch={!locked}
            onMove={() => {
              if (reactFlowInstance) setZoomLevel(Math.round(reactFlowInstance.getZoom() * 100));
            }}
            onMoveEnd={() => {
              if (reactFlowInstance) setZoomLevel(Math.round(reactFlowInstance.getZoom() * 100));
            }}
            className="w95-flow-canvas"
            onSelectionChange={(sel) => {
              try {
                const ids = (sel?.nodes || []).map(n => n.id);
                const id = ids[0] || null;
                setSelectedNode(id ? nodes.find(n => n.id === id) || null : null);
                emitNodeSelected('Builder', id);
              } catch {}
            }}
          >
            <Background 
              variant="cross" 
              gap={20} 
              size={1} 
              color="var(--w95-grid-primary)" 
              className="w95-grid-background"
            />
            <MiniMap 
              nodeColor={(node) => {
                const cluster = node.data?.metadata?.cluster;
                return cluster ? CLUSTER_COLORS[cluster] : '#6B7280';
              }}
              className="w95-flow-minimap"
              pannable
              zoomable
            />
            <Panel position="top-right" className="w95-compact-toolbar">
              <div className={`w95-toolbar ${toolbarOpen ? 'open' : 'collapsed'}`}>
                {toolbarOpen ? (
                  <div className="w95-toolbar-row">
                    <button className="w95-toolbar-button" title="Zoom In" onClick={onZoomIn}>+</button>
                    <button className="w95-toolbar-button" title="Zoom Out" onClick={onZoomOut}>−</button>
                    <div className="w95-toolbar-indicator" title="Zoom Level">{zoomLevel}%</div>
                    <button className="w95-toolbar-button" title="Fit View" onClick={onResetView}>Fit</button>
                    <button
                      className={`w95-toolbar-button ${locked ? 'locked' : ''}`}
                      title={locked ? 'Unlock viewport' : 'Lock viewport'}
                      onClick={() => setLocked((v) => !v)}
                    >{locked ? '🔒' : '🔓'}</button>
                    <button className="w95-toolbar-button" title="Collapse" onClick={() => setToolbarOpen(false)}>×</button>
                  </div>
                ) : (
                  <button className="w95-toolbar-pill" title="Canvas tools" onClick={() => setToolbarOpen(true)}>
                    {locked ? '🔒' : '🔓'} {zoomLevel}%
                  </button>
                )}
              </div>
            </Panel>
            
            {/* Canvas Status Bar */}
            <div className="w95-flow-status-bar">
              <span>ReactFlow: ready</span>
              <span>Snap: on</span>
              <span>Selection: {selectedNode ? '1 node' : 'none'}</span>
              <span>Errors: 0</span>
              <span>Depth: {edges.length > 0 ? Math.max(1, Math.min(5, Math.ceil(edges.length / nodes.length))) : 0}</span>
              <span>Zoom: {zoomLevel}%</span>
            </div>
          </ReactFlow>
        </div>

        {/* Right Panel - Inspector */}
        <div className="w95-panel w95-inspector" style={{ display: showInspector ? 'flex' : 'none' }}>
          <div className="w95-panel-title">
            Inspector
            <button
              className="w95-minimize"
              title="Hide Inspector"
              onClick={() => setShowInspector(false)}
              style={{ float: 'right' }}
            >×</button>
          </div>
          <div className="w95-panel-content">
            {selectedNode ? (
              <div className="w95-inspector-content">
                <div className="w95-inspector-header">
                  Selected: <span className="w95-highlight">{selectedNode.data?.label || 'Node'}</span>
                </div>
                
                <div className="w95-form-group">
                  <label>Rename</label>
                  <input 
                    type="text" 
                    className="w95-input" 
                    value={selectedNode.data?.label || ''}
                    onChange={(e) => {
                      updateNodeData(selectedNode.id, { label: e.target.value });
                    }}
                  />
                </div>
                
                <div className="w95-form-group">
                  <label>Add Field</label>
                  <button 
                    className="w95-button w95-block"
                    onClick={() => {
                      const fields = Array.isArray(selectedNode.data?.fields) ? [...selectedNode.data.fields] : [];
                      fields.push({ name: 'New Field', type: 'text', value: '' });
                      updateNodeData(selectedNode.id, { fields });
                    }}
                  >
                    Short Text
                  </button>
                  <button 
                    className="w95-button w95-block"
                    onClick={() => {
                      const fields = Array.isArray(selectedNode.data?.fields) ? [...selectedNode.data.fields] : [];
                      fields.push({ name: 'Long Text', type: 'longText', value: '' });
                      updateNodeData(selectedNode.id, { fields });
                    }}
                  >
                    Long Text
                  </button>
                  <button 
                    className="w95-button w95-block"
                    onClick={() => {
                      const fields = Array.isArray(selectedNode.data?.fields) ? [...selectedNode.data.fields] : [];
                      fields.push({ name: 'Number', type: 'number', value: 0 });
                      updateNodeData(selectedNode.id, { fields });
                    }}
                  >
                    Number
                  </button>
                  <button 
                    className="w95-button w95-block"
                    onClick={() => {
                      const fields = Array.isArray(selectedNode.data?.fields) ? [...selectedNode.data.fields] : [];
                      fields.push({ name: 'Object', type: 'object', value: '{ "key": "value" }' });
                      updateNodeData(selectedNode.id, { fields });
                    }}
                  >
                    Object
                  </button>
                </div>
                
                <div className="w95-form-section">
                  <div className="w95-section-header">Constraints</div>
                  <div className="w95-checkbox-group">
                    <label>Required</label>
                    <div className={`w95-checkbox ${selectedNode.data?.required ? 'w95-checked' : ''}`}
                      onClick={() => updateNodeData(selectedNode.id, { required: !selectedNode.data?.required })}
                    ></div>
                  </div>
                  <div className="w95-checkbox-group">
                    <label>Unique</label>
                    <div className={`w95-checkbox ${selectedNode.data?.unique ? 'w95-checked' : ''}`}
                      onClick={() => updateNodeData(selectedNode.id, { unique: !selectedNode.data?.unique })}
                    ></div>
                  </div>
                </div>
                
                <div className="w95-history-section">
                  <div className="w95-section-header">History</div>
                  <div className="w95-history-entry">[ok] node resized</div>
                  <div className="w95-history-entry">[ok] edge added</div>
                  <div className="w95-history-entry">[save] workflow</div>
                </div>
                
                <div className="w95-action-buttons">
                  <button className="w95-button" onClick={onDuplicateNode}>Duplicate</button>
                  <button className="w95-button w95-danger" onClick={onDeleteNode}>Delete</button>
                </div>
              </div>
            ) : (
              <div className="w95-inspector-empty">
                No node selected. Click on a node to inspect its properties.
              </div>
            )}
          </div>
        </div>
  </div>

  {/* Bottom Status Bar */}
      <div className="w95-status-bar">
        <span>Zoom: {zoomLevel}%</span>
        <span>Grid: 8px</span>
        <span>Selected: {selectedNode ? '1 node' : '0 nodes'}</span>
        <span>Errors: 0</span>
        <span>Engine: React-Flow OK</span>
      </div>
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const SemanticFlowBuilderWrapper = () => {
  return (
    <ReactFlowProvider>
      <SemanticFlowBuilder />
    </ReactFlowProvider>
  );
};

export default SemanticFlowBuilderWrapper;
