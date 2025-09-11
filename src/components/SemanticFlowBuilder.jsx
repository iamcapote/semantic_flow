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
import NodeModal95 from './NodeModal95';
import EdgeModal95 from './EdgeModal95';
import { edgeTypes95 } from './Edges95';
import { DEFAULT_EDGE_OPERATOR } from '@/lib/edges';
import WorkflowExecutionModal95 from './WorkflowExecutionModal95';
import { createWorkflowSchema, createNode, createEdge, generateId } from '@/lib/graphSchema';
import { emitNodeSelected } from '@/lib/workflowBus';
import { upsertField } from '@/lib/nodeModel';
import { NODE_TYPES, CLUSTER_COLORS, ONTOLOGY_CLUSTERS, getClusterSummary } from '@/lib/ontology';
// (exportWorkflow helper not used after simplification)

// Import styling
import './win95-plus.css';
import '../nav-fixes.css';
import PromptingEngine from '@/lib/promptingEngine';
import aiRouter from '@/lib/aiRouter';
import { SecureKeyManager } from '@/lib/security';

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
  // (removed unused showAIGenerator state)
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiRunning, setAiRunning] = useState(false);
  const [aiError, setAiError] = useState('');
  const [openCluster, setOpenCluster] = useState({});
  const fileInputRef = useRef(null);
  const [locked, setLocked] = useState(false);
  const [toolbarOpen, setToolbarOpen] = useState(false);
  // Node modal state
  const [modalNodeId, setModalNodeId] = useState(null);
  const [modalEdgeId, setModalEdgeId] = useState(null);
  // Sidebar visibility
  const [showPalette, setShowPalette] = useState(() => {
    try {
      const v = localStorage.getItem('builder-showPalette');
      return v === null ? true : v === 'true';
    } catch { return true; }
  });
  // Inspector removed; modal now canonical editor

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
  // (inspector preference removed)

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
      const newEdge = createEdge(params.source, params.target, undefined, DEFAULT_EDGE_OPERATOR);
      setEdges((eds) => addEdge({ ...params, ...newEdge, type: 'semantic95', data: { ...(newEdge.data||{}), operator: DEFAULT_EDGE_OPERATOR } }, eds));
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
        const importedEdges = (parsed.edges || []).map((e) => ({
          ...e,
          type: 'semantic95',
          data: { ...(e.data || {}), operator: e?.data?.operator || DEFAULT_EDGE_OPERATOR },
        }));

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

  // (removed unused handleExport function; export handled by onExportWorkflow)

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

  const onGenerateAINode = useCallback(async () => {
    if (!aiPrompt.trim() || !reactFlowInstance || !reactFlowWrapper.current || aiRunning) return;
    setAiError('');
    setAiRunning(true);
    try {
      // Determine provider/model from Router global settings
      const providerId = (aiRouter.getActiveProvider && aiRouter.getActiveProvider()) || (typeof window !== 'undefined' ? sessionStorage.getItem('active_provider') : null) || 'openai';
      const model = (typeof window !== 'undefined' ? sessionStorage.getItem(`default_model_${providerId}`) : null) || 'gpt-4o';
      const key = providerId === 'internal' ? 'internal-managed' : (SecureKeyManager.getApiKey(providerId) || '');
      if (providerId !== 'internal' && !key) {
        throw new Error(`Missing API key for provider "${providerId}". Configure in Router/Providers.`);
      }

      // Run Text→Workflow via PromptingEngine
      const engine = new PromptingEngine('builder');
      const result = await engine.convertTextToWorkflow(aiPrompt, key, providerId, model, {
        includeOntology: true,
        ontologyMode: 'force_framework',
        selectedOntologies: [],
      });

      if (!result?.success) {
        throw new Error(result?.error || 'AI conversion failed');
      }

      const gen = result.workflow || {};
      const genNodes = Array.isArray(gen.nodes) ? gen.nodes : [];
      const genEdges = Array.isArray(gen.edges) ? gen.edges : [];

      if (genNodes.length === 0 && genEdges.length === 0) {
        throw new Error('AI returned no nodes or edges.');
      }

      // Compute canvas center in flow coords
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const centerClient = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      const centerFlow = reactFlowInstance.screenToFlowPosition(centerClient);

      // Map incoming nodes to our semantic node shape
      const idMap = new Map();
      const mappedNodes = genNodes.map((n, idx) => {
        const id = n.id || generateId();
        idMap.set(n.id || id, id);
        const pos = n.position && typeof n.position.x === 'number' && typeof n.position.y === 'number'
          ? n.position
          : { x: centerFlow.x + (idx % 3) * 60 - 60, y: centerFlow.y + Math.floor(idx / 3) * 60 - 60 };
        const semanticType = n.data?.type || n.type || 'UTIL-BLANK';
        return {
          ...n,
          id,
          position: pos,
          type: 'semantic',
          data: {
            ...(n.data || {}),
            type: semanticType,
            _onUpdate: (nodeId, patch) => updateNodeData(nodeId, patch),
          },
        };
      });

      const mappedEdges = genEdges
        .filter(e => e && (e.source || e.from) && (e.target || e.to))
        .map((e) => {
          const src = idMap.get(e.source || e.from) || e.source || e.from;
          const tgt = idMap.get(e.target || e.to) || e.target || e.to;
          const newEdge = createEdge(src, tgt);
          return { ...newEdge, id: e.id || `${src}→${tgt}` , type: 'semantic95'};
        });

      setNodes((nds) => nds.concat(mappedNodes));
      if (mappedEdges.length) setEdges((eds) => eds.concat(mappedEdges));

      // Select first of inserted nodes and clear input
      if (mappedNodes[0]) setSelectedNode(mappedNodes[0]);
      setAiPrompt('');
    } catch (err) {
      console.error('AI Generate failed:', err);
      setAiError(err?.message || String(err));
    } finally {
      setAiRunning(false);
    }
  }, [aiPrompt, aiRunning, reactFlowInstance, updateNodeData, setNodes, setEdges]);

  const onDragStart = useCallback((e, code) => {
    e.dataTransfer.setData('application/reactflow', code);
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
    console.log(`Started dragging node type: ${code}`);
  }, []);

  const memoNodeTypes = useMemo(() => ({ semantic: SemanticNode95 }), []);
  const clusters = useMemo(() => getClusterSummary().sort((a,b)=>a.name.localeCompare(b.name)), []);
  const contentColumns = useMemo(() => {
    if (showPalette) return '300px 1fr';
    return '1fr';
  }, [showPalette]);

  // Re-fit view when layout changes so nodes stay in view
  useEffect(() => {
    if (!reactFlowInstance) return;
    const id = setTimeout(() => {
      try { reactFlowInstance.fitView({ padding: 0.2 }); } catch {}
    }, 60);
    return () => clearTimeout(id);
  }, [showPalette, reactFlowInstance]);

  // Listen for node modal open events
  useEffect(() => {
    const handler = (e) => {
      const nid = e.detail?.id;
      if (nid) {
        setModalNodeId(nid);
      }
    };
    window.addEventListener('node:openModal', handler);
    return () => window.removeEventListener('node:openModal', handler);
  }, []);

  // Listen for edge modal open events (from NodeModal or elsewhere)
  useEffect(() => {
    const handler = (e) => {
      const eid = e.detail?.id;
      if (eid) {
        setModalEdgeId(eid);
      }
    };
    window.addEventListener('edge:openModal', handler);
    return () => window.removeEventListener('edge:openModal', handler);
  }, []);

  const modalNode = useMemo(() => nodes.find(n => n.id === modalNodeId) || null, [modalNodeId, nodes]);

  // Derive edge styling in focus mode instead of mutating base state
  const renderedEdges = useMemo(() => {
    if (!modalNode) return edges;
    return edges.map(e => ({
      ...e,
      style: { ...(e.style||{}), opacity: (e.source === modalNode.id || e.target === modalNode.id) ? 1 : 0.15 }
    }));
  }, [edges, modalNode]);

  return (
  <div className={`w95-window ${modalNode ? 'focus-mode' : ''}`} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Palette restore tab (appears only when palette hidden) */}
      {!showPalette && (
        <div
          role="button"
          tabIndex={0}
          className="w95-palette-tab"
          title="Show Palette"
          onClick={() => setShowPalette(true)}
          onKeyDown={(e)=>{ if(e.key==='Enter' || e.key===' ') { e.preventDefault(); setShowPalette(true);} }}
        >Palette</div>
      )}

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
            
            {/* Functional Tool Grid (replaces placeholder tools) */}
            <div className="w95-tools-section">
              <div className="w95-tools-grid">
                <WorkflowExecutionModal95
                  workflow={workflow}
                  trigger={
                    <button
                      className="w95-tool-button"
                      disabled={isExecuting}
                      title="Execute Workflow"
                    >{isExecuting ? 'Exec…' : 'Execute'}</button>
                  }
                />
                <button
                  className="w95-tool-button"
                  onClick={onSaveWorkflow}
                  title="Save Workflow"
                >Save</button>
                <button
                  className="w95-tool-button"
                  onClick={onImportClick}
                  title="Import Workflow JSON"
                >Import</button>
                <button
                  className="w95-tool-button"
                  onClick={onExportWorkflow}
                  title="Export Workflow JSON"
                >Export</button>
                <button
                  className="w95-tool-button"
                  onClick={onResetView}
                  title="Reset / Fit View"
                >Reset</button>
                {/* Fit View (replaces previous Hide toggle; use the X on panel title to hide) */}
                <button
                  className="w95-tool-button"
                  onClick={onResetView}
                  title="Fit View"
                >Fit</button>
                <button
                  className="w95-tool-button"
                  onClick={onZoomOut}
                  title="Zoom Out"
                >−</button>
                <button
                  className="w95-tool-button"
                  onClick={onZoomIn}
                  title="Zoom In"
                >+</button>
              </div>
              {/* Hidden file input for Import */}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                style={{ display: 'none' }}
                onChange={onImportFile}
              />
              <div className="w95-zoom-display" style={{ marginTop: '8px' }}>Zoom {zoomLevel}%</div>
            </div>

            {/* Create / Import Section (grouped for clarity) */}
            <div className="w95-group w95-create-group">
              <div className="w95-group-title">Create / Import Nodes</div>
              <div className="w95-group-body">
                {/* Blank Node Button */}
                <button className="w95-button w95-block" onClick={onAddBlankNode} title="Insert a blank node at canvas center">
                  + Blank Node
                </button>

                {/* AI Text→Workflow */}
                <div className="w95-ai-section" aria-live="polite">
                  <div className="w95-section-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span>AI Generate (Text→Workflow)</span>
                    {aiRunning && <span className="w95-spinner" title="Generating…" />}
                  </div>
                  <textarea 
                    className="w95-textarea"
                    placeholder="Describe nodes or a process…"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    disabled={aiRunning}
                  />
                  <button 
                    className="w95-button w95-generate"
                    onClick={onGenerateAINode}
                    disabled={!aiPrompt.trim() || aiRunning}
                    title="Convert text into one or more workflow nodes"
                  >
                    {aiRunning ? 'Generating…' : 'Generate'}
                  </button>
                  <div className="w95-inline-hint">Uses active Router provider/model & global ontology settings.</div>
                  {aiError && <div className="w95-error-hint" role="alert">{aiError}</div>}
                </div>
              </div>
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
            edges={renderedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={memoNodeTypes}
            edgeTypes={edgeTypes95}
            onNodeClick={onNodeClick}
            onEdgeClick={(e, ed) => { e.stopPropagation(); setModalEdgeId(ed?.id); }}
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

  {/* Inspector removed; right side now free for future features (timeline, logs, etc.) */}
  </div>

  {/* Bottom Status Bar */}
      <div className="w95-status-bar">
        <span>Zoom: {zoomLevel}%</span>
        <span>Grid: 8px</span>
        <span>Selected: {selectedNode ? '1 node' : '0 nodes'}</span>
        <span>Errors: 0</span>
        <span>Engine: React-Flow OK</span>
      </div>
      {modalNode && (
        <NodeModal95
          node={modalNode}
          edges={edges}
          onUpdate={(id, patch) => updateNodeData(id, patch)}
          onDuplicate={(n)=>{ setModalNodeId(null); setSelectedNode(n); onDuplicateNode(); }}
          onDelete={(n)=>{ onDeleteNode(); setModalNodeId(null); }}
          onClose={()=>setModalNodeId(null)}
        />
      )}
      {modalEdgeId && (
        <EdgeModal95
          edge={edges.find(e=>e.id===modalEdgeId)}
          nodes={nodes}
          onUpdate={(edgeId, patch) => {
            setEdges((eds) => eds.map(e => e.id === edgeId ? { ...e, ...patch } : e));
            setModalEdgeId(null);
          }}
          onClose={() => setModalEdgeId(null)}
        />
      )}
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
