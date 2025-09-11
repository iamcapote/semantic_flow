import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { subscribeWorkflowUpdates, emitWorkflowUpdate, subscribeNodeSelection, emitNodeSelected } from '@/lib/workflowBus';
import { stringifyDSL, parseDSL } from '@/lib/dsl';
import { CLUSTER_COLORS, ONTOLOGY_CLUSTERS, NODE_TYPES } from '@/lib/ontology';
import { exportWorkflow } from '@/lib/exportUtils';
import WorkflowExecutionModal from './WorkflowExecutionModal95';
import NodeEnhancementModal from './NodeEnhancementModal95';
import FieldEditor95 from './FieldEditor95';
import yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';
import { validateWorkflow } from '@/lib/graphSchema';
import { DEFAULT_EDGE_OPERATOR, EDGE_OPERATORS, getOperatorMeta } from '@/lib/edges';
import { EDGE_CONDITIONS } from '@/lib/graphSchema';
// Win95++ tokens
const colors = {
  desk: '#008080',
  face: '#C0C0C0',
  title: '#000080',
  sunken: '#FFFFFF',
  text: '#000000',
  shadow: '#404040',
  mid: '#808080',
};

// 95-style bevel helpers (raised vs sunken)
const bevel = {
  // Raised frame: light on top/left, dark on bottom/right
  frame: {
    border: '2px solid',
    borderColor: '#fff #404040 #404040 #fff',
  },
  // Sunken groove: opposite highlight
  inset: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #404040',
  outset: 'inset -1px -1px 0 #FFFFFF, inset 1px 1px 0 #404040',
};

const ui = {
  // Fit the IDE to its parent container; allow nested panels to manage their own scroll.
  desktop: { background: colors.desk, height: '100%', minHeight: 0, width: '100%', padding: 12, boxSizing: 'border-box', fontFamily: 'MS Sans Serif, Tahoma, Arial, sans-serif' },
  window: { background: colors.face, color: colors.text, height: '100%', width: '100%', minHeight: 0, display: 'grid', gridTemplateRows: '28px 28px 1fr 28px', position: 'relative', ...bevel.frame, boxShadow: '2px 2px 0 #000' },
  titleBar: { background: colors.title, color: '#fff', display: 'flex', alignItems: 'center', padding: '4px 8px', fontWeight: 700, borderBottom: '1px solid #000' },
  // Make menu bar horizontally scrollable when cramped
  menuBar: { background: colors.face, display: 'flex', flexWrap: 'nowrap', gap: 12, padding: '4px 8px', borderBottom: '1px solid #808080', boxShadow: bevel.outset, overflowX: 'auto' },
  menui: { cursor: 'default', fontSize: 12 },
  client: { display: 'block', height: '100%', minHeight: 0, padding: 8, boxSizing: 'border-box', width: '100%' },
  // Let side panes shrink; keep editor flexible. We'll use flex + resizable panels inside.
  topRow: { display: 'flex', gap: 8, minHeight: 0, height: '100%', width: '100%' },
  // panels
  activity: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4 },
  sidePanel: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'grid', gridTemplateRows: '22px 1fr', minHeight: 0 },
  panelTitle: { background: colors.title, color: '#fff', fontSize: 12, padding: '2px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  panelBody: { background: colors.sunken, borderTop: '1px solid #000', boxShadow: bevel.inset, padding: 6, overflow: 'auto' },
  editor: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'grid', gridTemplateRows: '28px 1fr', minHeight: 0, minWidth: 0 },
  // Improve tab readability and allow overflow scroll
  tabs: { background: colors.face, display: 'flex', gap: 6, alignItems: 'center', padding: '2px 6px', borderBottom: '1px solid #808080', boxShadow: bevel.outset, overflowX: 'auto' },
  tab: (active) => ({ background: active ? '#FFFFFF' : '#D6D6D6', color: '#000', border: '1px solid #000', boxShadow: active ? bevel.inset : bevel.outset, padding: '4px 12px', fontSize: 13, lineHeight: '18px', fontWeight: active ? 700 : 600, cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'end' }),
  // editor body: line numbers | colorbar | code | minimap
  editorBody: { display: 'grid', gridTemplateColumns: '44px 8px 1fr 8px', minHeight: 0, minWidth: 0, width: '100%' },
  gutter: { width: 44, background: '#E6E6E6', borderRight: '1px solid #000', boxShadow: bevel.inset, paddingTop: 8, paddingBottom: 8, overflow: 'hidden' },
  colorbar: { width: 8, background: '#f3f4f6', borderRight: '1px solid #000', boxShadow: bevel.inset, position: 'relative', minWidth: 8, flex: '0 0 8px' },
  // Position relative so floating error toast anchors correctly
  code: { position: 'relative', background: '#012456', color: '#E6E6E6', minHeight: 0, overflow: 'auto', border: '1px solid #000', minWidth: 0 },
  minimap: { width: 8, background: colors.face, borderLeft: '1px solid #000', boxShadow: bevel.outset, minWidth: 8, flex: '0 0 8px' },
  outline: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'grid', gridTemplateRows: '22px 1fr' },
  bottom: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'grid', gridTemplateRows: '22px 1fr' },
  bottomTabs: { display: 'flex', gap: 8, alignItems: 'center', padding: '2px 6px', borderBottom: '1px solid #808080', boxShadow: bevel.outset, overflowX: 'auto' },
  bottomTab: (active) => ({ background: active ? '#FFFFFF' : '#D6D6D6', color: '#000', border: '1px solid #000', boxShadow: active ? bevel.inset : bevel.outset, padding: '3px 10px', fontSize: 13, fontWeight: active ? 700 : 600, cursor: 'pointer', whiteSpace: 'nowrap' }),
  terminal: { background: '#011B3A', color: '#E6E6E6', padding: 8, fontFamily: 'Consolas, "Lucida Console", monospace', fontSize: 12, overflow: 'auto' },
  statusBar: { background: colors.face, display: 'flex', alignItems: 'center', gap: 16, padding: '4px 8px', borderTop: '1px solid #808080', boxShadow: bevel.outset },
  button: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, padding: '2px 10px', cursor: 'pointer', fontSize: 12 },
  input: { background: colors.sunken, border: '1px solid #000', boxShadow: bevel.inset, padding: '4px 6px', fontSize: 12 },
  titleBtn: { width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, fontSize: 12, lineHeight: '12px', cursor: 'pointer' },
  // floating Command Palette
  palette: { position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', width: 520, background: colors.face, border: '1px solid #000', boxShadow: '4px 4px 0 #000', display: 'grid', gridTemplateRows: '22px 28px 1fr' },
};

// DSL handled via lib/dsl

export default function IDE95() {
  // workflow state + editors
  const [wf, setWf] = useState({ nodes: [], edges: [], metadata: { title: 'Untitled Workflow', createdAt: '', updatedAt: '' } });
  const [dsl, setDsl] = useState('');
  const [json, setJson] = useState('');
  const [jsonError, setJsonError] = useState('');

  // ui state
  const [activeTab, setActiveTab] = useState('workflow.json'); // workflow.json | workflow.dsl | preview
  const [bottomTab, setBottomTab] = useState('terminal'); // terminal | problems | output
  const [showPalette, setShowPalette] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const dslRef = useRef(null);
  const jsonRef = useRef(null);
  const [dslScrollTop, setDslScrollTop] = useState(0);
  const [jsonScrollTop, setJsonScrollTop] = useState(0);
  const fileInputRef = useRef(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null); // 'file' | 'edit' | 'view' | 'run' | null
  const [showExplorer, setShowExplorer] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [history, setHistory] = useState([]);
  const [flashTerminal, setFlashTerminal] = useState(false);

  // Normalize a workflow object to ensure required defaults exist (e.g., edge operator)
  const normalizeWorkflow = useCallback((obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    const next = JSON.parse(JSON.stringify(obj));
    if (Array.isArray(next.edges)) {
      next.edges = next.edges.map((e) => {
        const data = { ...(e.data || {}) };
        if (!data.condition) data.condition = 'follows';
        if (!data.operator) data.operator = DEFAULT_EDGE_OPERATOR;
        return { ...e, data };
      });
    }
    return next;
  }, []);

  // derived: problems list
  const problems = useMemo(() => {
    const out = [];
    const ids = new Set();
    const dupes = new Set();
    (wf?.nodes || []).forEach((n) => {
      if (ids.has(n.id)) dupes.add(n.id); else ids.add(n.id);
      const title = n?.data?.label || n?.data?.title;
      if (!title) out.push({ severity: 'error', where: 'node', id: n.id, message: 'Missing title/label' });
    });
    dupes.forEach((id) => out.push({ severity: 'error', where: 'node', id, message: 'Duplicate node id' }));
    (wf?.edges || []).forEach((e) => {
      if (!ids.has(e.source)) out.push({ severity: 'error', where: 'edge', id: e.id, message: `Dangling source → ${e.source}` });
      if (!ids.has(e.target)) out.push({ severity: 'error', where: 'edge', id: e.id, message: `Dangling target → ${e.target}` });
      if (e.source === e.target) out.push({ severity: 'warn', where: 'edge', id: e.id, message: 'Self-loop edge' });
    });
    try {
      const schema = validateWorkflow({ id: wf.id || 'wf', metadata: wf.metadata || {}, nodes: wf.nodes || [], edges: wf.edges || [] });
      if (!schema.isValid) {
        schema.errors.forEach((msg, i) => out.push({ severity: 'error', where: 'schema', id: `S${i+1}`, message: msg }));
      }
    } catch {}
    return out;
  }, [wf]);

  const focusNodeInDsl = useCallback((nodeId) => {
    if (!dslRef.current) return;
    const ta = dslRef.current;
    const lines = dsl.split(/\r?\n/);
    const node = (wf?.nodes || []).find(n => n.id === nodeId);
    const token = node ? (node.data?.key || node.key || node.id) : nodeId;
    const idx = lines.findIndex((ln) => {
      const t = ln.trim();
      return t === token || t.startsWith(token + ' ');
    });
    if (idx >= 0) {
      let pos = 0;
      for (let i = 0; i < idx; i++) pos += lines[i].length + 1;
      ta.focus();
      try { ta.setSelectionRange(pos, pos + Math.max(0, lines[idx].length)); } catch {}
    }
    setActiveTab('workflow.dsl');
  }, [dsl, wf]);

  const selectedNode = useMemo(() => (wf?.nodes || []).find(n => n.id === selectedNodeId) || null, [wf, selectedNodeId]);
  const selectedCluster = selectedNode?.data?.metadata?.cluster || null;
  const selectedColor = selectedNode?.data?.color || (selectedCluster ? (CLUSTER_COLORS[selectedCluster] || null) : null);

  // Text <-> Node line mapping for coloring and selection highlights
  const LINE_H = 18; // px approximation of line height
  const dslInfo = useMemo(() => {
    const lines = (dsl || '').split(/\r?\n/);
    const map = new Map(); // lineIdx -> nodeId
    const edgeLines = new Set();
    lines.forEach((ln, i) => { if (/\-\>/.test(ln)) edgeLines.add(i); });
    // Build mapping from the displayed token (data.key || key || id) to node id
    const tokenToId = new Map((wf?.nodes || []).map(n => [n?.data?.key || n?.key || n?.id, n.id]));
    lines.forEach((ln, i) => {
      const token = (ln.trim().split(/\s+/)[0]) || '';
      const nid = tokenToId.get(token);
      if (nid) map.set(i, nid);
    });
    return { lineCount: lines.length, lineToNode: map, edgeLines };
  }, [dsl, wf]);

  const jsonInfo = useMemo(() => {
    const lines = (json || '').split(/\r?\n/);
    const lineToNode = new Map(); // lineIdx -> nodeId (id line)
    const idToRange = new Map(); // nodeId -> { start, end }
    const byId = new Set((wf?.nodes || []).map(n => n.id));

    // helper: count braces/brackets outside quotes on a line
    const countTokens = (s) => {
      let inStr = false, esc = false;
      let oc = 0, cc = 0, os = 0, cs = 0;
      for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (inStr) {
          if (esc) { esc = false; continue; }
          if (ch === '\\') { esc = true; continue; }
          if (ch === '"') { inStr = false; continue; }
          continue;
        } else {
          if (ch === '"') { inStr = true; continue; }
          if (ch === '{') oc++;
          else if (ch === '}') cc++;
          else if (ch === '[') os++;
          else if (ch === ']') cs++;
        }
      }
      return { oc, cc, os, cs };
    };

    // locate nodes array region
    let nodesStart = -1; // line index of '[' starting nodes array
    let nodesEnd = -1;   // line index of matching closing ']'
    let foundNodes = false, bracketDepth = 0;
    for (let i = 0; i < lines.length; i++) {
      if (!foundNodes && /"nodes"\s*:\s*\[/.test(lines[i])) {
        // '[' on same line
        foundNodes = true;
        const t = countTokens(lines[i]);
        bracketDepth += t.os - t.cs;
        nodesStart = i; // start at this line
        if (bracketDepth === 0) { nodesEnd = i; break; }
        continue;
      }
      if (!foundNodes && /"nodes"\s*:/.test(lines[i])) {
        // look for '[' on following line(s)
        foundNodes = true;
        continue;
      }
      if (foundNodes && nodesStart === -1) {
        // find the '[' line after the 'nodes:' line
        const t = countTokens(lines[i]);
        if (t.os > 0) {
          nodesStart = i;
          bracketDepth += t.os - t.cs;
          if (bracketDepth === 0) { nodesEnd = i; break; }
          continue;
        }
      } else if (foundNodes && nodesStart !== -1) {
        const t = countTokens(lines[i]);
        bracketDepth += t.os - t.cs;
        if (bracketDepth === 0) { nodesEnd = i; break; }
      }
    }

    if (nodesStart !== -1 && nodesEnd !== -1 && nodesEnd >= nodesStart) {
      let curlyDepth = 0;
      let objStart = -1;
      for (let i = nodesStart + 1; i <= nodesEnd; i++) {
        const t = countTokens(lines[i]);
        const hasOpen = t.oc > 0;
        const hasClose = t.cc > 0;
        if (curlyDepth === 0 && hasOpen) {
          objStart = i;
        }
        curlyDepth += t.oc - t.cc;
        if (curlyDepth === 0 && objStart !== -1) {
          // object range: objStart..i
          // find id within this range
          let foundId = null, idLine = -1;
          for (let k = objStart; k <= i; k++) {
            const m = lines[k].match(/"id"\s*:\s*"([^"]+)"/);
            if (m) { foundId = m[1]; idLine = k; break; }
          }
          if (foundId && byId.has(foundId)) {
            idToRange.set(foundId, { start: objStart, end: i });
            if (idLine >= 0) lineToNode.set(idLine, foundId);
          }
          objStart = -1;
        }
      }
    } else {
      // fallback: at least map id lines so colorbar works
      lines.forEach((ln, i) => {
        const m = ln.match(/"id"\s*:\s*"([^"]+)"/);
        if (m && byId.has(m[1])) lineToNode.set(i, m[1]);
      });
    }

    return { lineCount: lines.length, lineToNode, idToRange };
  }, [json, wf]);

  const getNodeColor = useCallback((nodeId) => {
    const n = (wf?.nodes || []).find(x => x.id === nodeId);
    const cluster = n?.data?.metadata?.cluster;
    return n?.data?.color || (cluster ? CLUSTER_COLORS[cluster] : undefined) || '#6B7280';
  }, [wf]);

  const selectedDslLine = useMemo(() => {
    if (!selectedNodeId) return -1;
    for (const [idx, nid] of dslInfo.lineToNode.entries()) { if (nid === selectedNodeId) return idx; }
    return -1;
  }, [dslInfo, selectedNodeId]);

  const selectedJsonLine = useMemo(() => {
    if (!selectedNodeId) return -1;
    const range = jsonInfo.idToRange?.get?.(selectedNodeId);
    if (range) return range.start;
    for (const [idx, nid] of jsonInfo.lineToNode.entries()) { if (nid === selectedNodeId) return idx; }
    return -1;
  }, [jsonInfo, selectedNodeId]);

  const selectedJsonRange = useMemo(() => {
    if (!selectedNodeId) return null;
    return jsonInfo.idToRange?.get?.(selectedNodeId) || null;
  }, [jsonInfo, selectedNodeId]);

  const updateNode = useCallback((id, patch) => {
    setWf((prev) => {
      const nodes = (prev.nodes || []).map((n) => n.id === id ? { ...n, data: { ...(n.data || {}), ...patch } } : n);
      const next = { ...prev, nodes };
      try { localStorage.setItem('current-workflow', JSON.stringify(next)); } catch {}
      emitWorkflowUpdate('IDE', next);
      return next;
    });
  }, []);

  const duplicateNode = useCallback((id) => {
    setWf((prev) => {
      const original = (prev.nodes || []).find(n => n.id === id);
      if (!original) return prev;
      const copy = { ...original, id: `${original.id}-copy`, position: { x: (original.position?.x || 0) + 24, y: (original.position?.y || 0) + 24 } };
      const next = { ...prev, nodes: [...(prev.nodes || []), copy] };
      try { localStorage.setItem('current-workflow', JSON.stringify(next)); } catch {}
      emitWorkflowUpdate('IDE', next);
      return next;
    });
  }, []);

  const deleteNode = useCallback((id) => {
    setWf((prev) => {
      const nodes = (prev.nodes || []).filter(n => n.id !== id);
      const edges = (prev.edges || []).filter(e => e.source !== id && e.target !== id);
      const next = { ...prev, nodes, edges };
      try { localStorage.setItem('current-workflow', JSON.stringify(next)); } catch {}
      emitWorkflowUpdate('IDE', next);
      return next;
    });
    if (selectedNodeId === id) setSelectedNodeId(null);
  }, [selectedNodeId]);

  const onImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const focusNodeInJson = useCallback((nodeId) => {
    if (!jsonRef.current) return;
    const ta = jsonRef.current;
    const lines = json.split(/\r?\n/);
    const range = jsonInfo.idToRange?.get?.(nodeId);
    if (range) {
      let startPos = 0; for (let i = 0; i < range.start; i++) startPos += lines[i].length + 1;
      let endPos = startPos; for (let i = range.start; i <= range.end; i++) endPos += lines[i].length + 1;
      ta.focus();
      try { ta.setSelectionRange(startPos, Math.max(startPos, endPos - 1)); } catch {}
    } else {
      // fallback: select id line
      const idx = lines.findIndex((ln) => new RegExp(`"id"\\s*:\\s*"${nodeId}"`).test(ln));
      if (idx >= 0) {
        let pos = 0; for (let i = 0; i < idx; i++) pos += lines[i].length + 1;
        ta.focus();
        try { ta.setSelectionRange(pos, pos + Math.max(0, lines[idx].length)); } catch {}
      }
    }
    setActiveTab('workflow.json');
  }, [json, jsonInfo]);

  // Terminal helpers for AI events
  const logToTerminal = useCallback((message, opts = {}) => {
    try {
      const el = document.getElementById('ide95-terminal');
      if (el) {
        const ts = new Date().toLocaleTimeString();
        el.textContent = (el.textContent || '') + (el.textContent ? '\n' : '') + `[${ts}] ${message}`;
        el.scrollTop = el.scrollHeight;
      }
    } catch {}
  }, []);

  const notifyAiActivity = useCallback((message) => {
    setBottomTab('terminal');
    setFlashTerminal(true);
    logToTerminal(message);
    setTimeout(() => setFlashTerminal(false), 1200);
  }, [logToTerminal]);

  const commitWorkflow = useCallback((next0) => {
    const next = normalizeWorkflow(next0);
    const withMeta = {
      ...next,
      metadata: {
        ...(next?.metadata || {}),
        updatedAt: new Date().toISOString(),
      },
    };
    try {
      setHistory((h) => [{ ts: Date.now(), title: withMeta?.metadata?.title || 'Untitled', wf: JSON.parse(JSON.stringify(wf)) }, ...h].slice(0, 10));
    } catch {}
    setWf(withMeta);
    try { localStorage.setItem('current-workflow', JSON.stringify(withMeta)); } catch {}
    emitWorkflowUpdate('IDE', withMeta);
  }, [wf, normalizeWorkflow]);

  const onImportFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const name = (file.name || '').toLowerCase();
        let parsed;
        if (name.endsWith('.json')) {
          parsed = JSON.parse(text);
        } else if (name.endsWith('.yml') || name.endsWith('.yaml')) {
          parsed = yaml.load(text);
          if (parsed?.workflow) {
            parsed = {
              nodes: parsed.workflow.nodes?.map(n => ({ id: n.id, type: n.type, position: n.position || { x: 0, y: 0 }, data: { label: n.label, title: n.label, type: n.type, content: n.content, metadata: { cluster: n.cluster } } })) || [],
              edges: parsed.workflow.edges?.map(e => ({ id: `${e.from}-${e.to}-${Math.random().toString(36).slice(2,8)}`, source: e.from, target: e.to, data: { condition: e.relation || 'follows', operator: e.operator || DEFAULT_EDGE_OPERATOR } })) || [],
              metadata: parsed.workflow.metadata || {}
            };
          }
        } else if (name.endsWith('.xml')) {
          const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
          const xml = parser.parse(text);
          const root = xml?.semanticWorkflow || xml;
          const nodes = Array.isArray(root?.nodes?.node) ? root.nodes.node : (root?.nodes?.node ? [root.nodes.node] : []);
          const edges = Array.isArray(root?.edges?.edge) ? root.edges.edge : (root?.edges?.edge ? [root.edges.edge] : []);
          parsed = {
            nodes: nodes.map(n => ({ id: n.id, type: n.type || n.data?.type, position: n.position ? { x: Number(n.position.x) || 0, y: Number(n.position.y) || 0 } : { x: 0, y: 0 }, data: { label: n.label, title: n.label, type: n.type, content: n.content, metadata: { cluster: n.cluster || n.data?.metadata?.cluster } } })),
            edges: edges.map(e => ({ id: e.id || `${e.source}-${e.target}-${Math.random().toString(36).slice(2,8)}`, source: e.source, target: e.target, data: { condition: e.relation || 'follows', operator: e.operator || DEFAULT_EDGE_OPERATOR } })),
            metadata: root?.metadata || {}
          };
        } else if (name.endsWith('.dsl') || name.endsWith('.txt')) {
          const { nodes, edges } = parseDSL(text);
          parsed = { nodes, edges, metadata: { title: wf?.metadata?.title || 'Imported DSL' } };
        } else {
          parsed = JSON.parse(text);
        }
        if (!parsed) throw new Error('Unsupported file format');
        const next = normalizeWorkflow({
          ...(wf || {}),
          nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
          edges: Array.isArray(parsed.edges) ? parsed.edges : [],
          metadata: parsed.metadata || wf?.metadata || { title: 'Imported' },
          viewport: parsed.viewport || wf?.viewport || { x: 0, y: 0, zoom: 1 },
        });
        commitWorkflow(next);
      } catch (err) {
        setJsonError('Import failed: ' + (err.message || String(err)));
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  }, [wf, commitWorkflow, normalizeWorkflow]);

  const handleExport = useCallback((format) => {
    try {
      const ex = exportWorkflow(wf, format);
      const blob = new Blob([ex.content], { type: ex.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ex.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setJsonError('Export failed: ' + (e.message || String(e)));
    }
  }, [wf]);

  const refresh = useCallback(() => {
    try {
      const saved = localStorage.getItem('current-workflow');
      const obj = saved ? JSON.parse(saved) : { nodes: [], edges: [], metadata: { title: 'Untitled Workflow' } };
      const normalized = normalizeWorkflow(obj);
      setWf(normalized);
      setJson(JSON.stringify(normalized, null, 2));
      setDsl(stringifyDSL(normalized.nodes || [], normalized.edges || []));
      setJsonError('');
    } catch (e) {
      setWf({ nodes: [], edges: [] });
      setJson('{}');
      setDsl('');
      setJsonError(String(e.message || e));
    }
  }, [normalizeWorkflow]);


  const applyJson = useCallback(() => {
    try {
      const obj = JSON.parse(json);
      setJsonError('');
      commitWorkflow(obj);
      setDsl(stringifyDSL(obj.nodes || [], obj.edges || []));
    } catch (e) {
      setJsonError('Invalid JSON: ' + (e.message || String(e)));
    }
  }, [json, commitWorkflow]);

  const applyDsl = useCallback(() => {
    try {
      const { nodes, edges } = parseDSL(dsl);
      const next = { ...(wf || {}), nodes, edges };
      setJsonError('');
      commitWorkflow(next);
      setJson(JSON.stringify(next, null, 2));
    } catch (e) {
      setJsonError('Invalid DSL: ' + (e.message || String(e)));
    }
  }, [dsl, wf, commitWorkflow]);

  const copy = async (text) => { try { await navigator.clipboard.writeText(text); } catch {} };

  // Update a single edge by id and re-commit workflow
  const updateEdge = useCallback((edgeId, patch) => {
    try {
      const edges = (wf?.edges || []).map((e) => {
        if (e.id !== edgeId) return e;
        const nextData = { ...(e.data || {}), ...(patch.data || {}) };
        return { ...e, ...patch, data: nextData };
      });
      const next = { ...(wf || {}), edges };
      commitWorkflow(next);
    } catch {}
  }, [wf, commitWorkflow]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const unsubscribe = subscribeWorkflowUpdates((source, next) => {
      if (source === 'IDE') return; // avoid loopback
      try {
        setWf(next);
        setJson(JSON.stringify(next, null, 2));
        setDsl(stringifyDSL(next.nodes || [], next.edges || []));
      } catch {}
    });
  const unsubSel = subscribeNodeSelection((source, nodeId) => {
      // When Builder selects a node, mirror selection in IDE and focus/scroll
      if (source === 'IDE') return; // ignore our own
      setSelectedNodeId(nodeId || null);
      if (nodeId) {
    // If user is previewing, swap to a text tab; otherwise keep current
    setActiveTab((t) => (t === 'preview' ? 'workflow.dsl' : t));
    // Auto-scroll handled by effect based on selectedNodeId + activeTab
      }
    });
    return () => { try { unsubscribe(); } catch {}; try { unsubSel(); } catch {}; };
  }, []);

  // keyboard: Ctrl+Shift+P -> toggle palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setShowPalette((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const runAction = () => {
    // fake run: just log a line in terminal
    setBottomTab('terminal');
    const ts = new Date().toLocaleTimeString();
    const line = `build ${ts} ok — nodes=${wf?.nodes?.length || 0} edges=${wf?.edges?.length || 0}`;
    const el = document.getElementById('ide95-terminal');
    if (el) {
      el.textContent = (el.textContent || '') + (el.textContent ? '\n' : '') + line;
      el.scrollTop = el.scrollHeight;
    }
  };

  const formatJson = () => {
    try { setJson(JSON.stringify(JSON.parse(json), null, 2)); setJsonError(''); } catch (e) { setJsonError('Format failed: ' + (e.message || String(e))); }
  };

  const closeMenus = () => setOpenMenu(null);
  useEffect(() => {
    const onClick = (e) => {
      // close on outside click if any menu open
      if (openMenu) setOpenMenu(null);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [openMenu]);

  // Auto-scroll editor to selected node line
  useEffect(() => {
    if (!selectedNodeId) return;
    if (activeTab === 'workflow.dsl' && dslRef.current && selectedDslLine >= 0) {
      const desired = Math.max(0, selectedDslLine * LINE_H - 6 * LINE_H);
      dslRef.current.scrollTop = desired;
      setDslScrollTop(desired);
    }
    if (activeTab === 'workflow.json' && jsonRef.current && selectedJsonLine >= 0) {
      const desired = Math.max(0, selectedJsonLine * LINE_H - 6 * LINE_H);
      jsonRef.current.scrollTop = desired;
      setJsonScrollTop(desired);
    }
  }, [selectedNodeId, activeTab, selectedDslLine, selectedJsonLine]);

  return (
    <div style={ui.desktop}>
      <div style={ui.window}>
  {/* Title Bar */}
  <div style={ui.titleBar}>
    <span>BITCORE IDE — Win95++</span>
    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
            <div style={ui.titleBtn}>_</div>
            <div style={ui.titleBtn}>□</div>
            <div style={{ ...ui.titleBtn, background: '#b91c1c', color: '#fff' }}>×</div>
          </div>
        </div>

        {/* Menu Bar */}
  <div style={ui.menuBar}>
          {/* Menu categories */}
          {['File','Edit','View','Run'].map((m) => (
            <span key={m} style={{ ...ui.menui, padding: '2px 6px', boxShadow: openMenu===m.toLowerCase()? bevel.inset : 'none', border: '1px solid #000', background: openMenu===m.toLowerCase()? '#E6E6E6' : 'transparent' }} onClick={(e)=>{ e.stopPropagation(); setOpenMenu(v => v===m.toLowerCase()? null : m.toLowerCase()); }}>
              {m}
            </span>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <WorkflowExecutionModal workflow={wf} trigger={<button style={{ ...ui.button, background: colors.title, color: '#fff' }}>Execute</button>} />
            <button style={ui.button} onClick={refresh}>Sync</button>
            <input ref={fileInputRef} type="file" accept=".json,.yml,.yaml,.xml,.dsl,.txt" style={{ display: 'none' }} onChange={onImportFile} />
          </div>
        </div>
        {/* Simple dropdowns */}
        {openMenu === 'file' && (
          <div style={{ position: 'absolute', top: 56, left: 8, background: colors.face, border: '1px solid #000', boxShadow: '3px 3px 0 #000', padding: 6, display: 'grid', gap: 4, zIndex: 1000, width: 180 }} onClick={(e)=>e.stopPropagation()}>
            <button style={ui.button} onClick={()=>{ closeMenus(); commitWorkflow({ nodes: [], edges: [], metadata: { title: 'Untitled Workflow', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } }); }}>New</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); onImportClick(); }}>Open…</button>
            <div style={{ height: 1, background: '#808080', margin: '2px 0' }} />
            <div style={{ fontSize: 11, opacity: 0.8 }}>Export</div>
            <button style={ui.button} onClick={()=>{ closeMenus(); handleExport('json'); }}>JSON</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); handleExport('yaml'); }}>YAML</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); handleExport('markdown'); }}>Markdown</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); handleExport('xml'); }}>XML</button>
            <div style={{ height: 1, background: '#808080', margin: '2px 0' }} />
            <button style={ui.button} onClick={()=>{ closeMenus(); setHistory((h) => [{ ts: Date.now(), title: wf?.metadata?.title || 'Untitled', wf: JSON.parse(JSON.stringify(wf)) }, ...h].slice(0, 10)); }}>Snapshot</button>
            {history[0] && (
              <button style={ui.button} onClick={()=>{ closeMenus(); try { commitWorkflow(JSON.parse(JSON.stringify(history[0].wf))); } catch {} }}>Restore Last</button>
            )}
          </div>
        )}
        {openMenu === 'edit' && (
          <div style={{ position: 'absolute', top: 56, left: 64, background: colors.face, border: '1px solid #000', boxShadow: '3px 3px 0 #000', padding: 6, display: 'grid', gap: 4, zIndex: 1000, width: 160 }} onClick={(e)=>e.stopPropagation()}>
            <button style={ui.button} onClick={()=>{ closeMenus(); applyJson(); }}>Apply JSON</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); applyDsl(); }}>Apply DSL</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); formatJson(); }}>Format JSON</button>
            <div style={{ height: 1, background: '#808080', margin: '2px 0' }} />
            <button style={ui.button} onClick={()=>{ closeMenus(); copy(json); }}>Copy JSON</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); copy(dsl); }}>Copy DSL</button>
          </div>
        )}
        {openMenu === 'view' && (
          <div style={{ position: 'absolute', top: 56, left: 118, background: colors.face, border: '1px solid #000', boxShadow: '3px 3px 0 #000', padding: 6, display: 'grid', gap: 4, zIndex: 1000, width: 180 }} onClick={(e)=>e.stopPropagation()}>
            <button style={ui.button} onClick={()=>{ closeMenus(); setShowExplorer(v=>!v); }}>{showExplorer? 'Hide' : 'Show'} Explorer</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); setShowSearch(v=>!v); }}>{showSearch? 'Hide' : 'Show'} Search</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); setShowInspector(v=>!v); }}>{showInspector? 'Hide' : 'Show'} Inspector</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); setBottomTab('problems'); }}>Show Problems</button>
          </div>
        )}
        {openMenu === 'run' && (
          <div style={{ position: 'absolute', top: 56, left: 166, background: colors.face, border: '1px solid #000', boxShadow: '3px 3px 0 #000', padding: 6, display: 'grid', gap: 4, zIndex: 1000, width: 180 }} onClick={(e)=>e.stopPropagation()}>
            <WorkflowExecutionModal workflow={wf} trigger={<button style={{ ...ui.button, background: colors.title, color: '#fff' }} onClick={closeMenus}>Execute…</button>} />
            <button style={ui.button} onClick={()=>{ closeMenus(); runAction(); }}>Build (Dry Run)</button>
            <button style={ui.button} onClick={()=>{ closeMenus(); refresh(); }}>Sync from Builder</button>
          </div>
        )}

        {/* Client area with resizable panels */}
        <div style={ui.client}>
          <PanelGroup direction="vertical" style={{ height: '100%', width: '100%' }}>
            {/* Top area: Activity + horizontal split */}
            <Panel defaultSize={72} minSize={40} style={{ display: 'flex', minHeight: 0 }}>
              <div style={ui.topRow}>
                {/* Activity */}
                <div style={{ ...ui.activity, flex: '0 0 48px' }}>
                  <button title={showExplorer? 'Hide Explorer':'Show Explorer'} onClick={()=>setShowExplorer(v=>!v)} style={{ width: 34, height: 34, margin: 4, background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, fontWeight: 700 }}>E</button>
                  <button title={showSearch? 'Hide Search':'Show Search'} onClick={()=>setShowSearch(v=>!v)} style={{ width: 34, height: 34, margin: 4, background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, fontWeight: 700 }}>S</button>
                  <button title="Show Problems" onClick={()=>setBottomTab('problems')} style={{ width: 34, height: 34, margin: 4, background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, fontWeight: 700 }}>G</button>
                  <button title="Quick Export (JSON)" onClick={()=>handleExport('json')} style={{ width: 34, height: 34, margin: 4, background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, fontWeight: 700 }}>D</button>
                  <WorkflowExecutionModal workflow={wf} trigger={<button title="Execute" style={{ width: 34, height: 34, margin: 4, background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, fontWeight: 700 }}>X</button>} />
                </div>
                {/* Right of activity: Horizontal resizable group */}
                <div style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
                  <PanelGroup direction="horizontal" style={{ height: '100%', width: '100%' }}>
                    {/* Left: Explorer + Search stacked */}
                    <Panel defaultSize={22} minSize={16}>
                      <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8, minHeight: 0, minWidth: 0, height: '100%' }}>
                        <div style={ui.sidePanel}>
                          <div style={ui.panelTitle}>Explorer</div>
                          <div style={{ ...ui.panelBody, display: showExplorer? 'block': 'none' }}>
                            <div style={{ fontSize: 12, display: 'grid', gap: 6 }}>
                              {Object.entries(
                                (wf?.nodes || []).reduce((acc, n) => {
                                  const cluster = n?.data?.metadata?.cluster || 'unknown';
                                  (acc[cluster] ||= []).push(n);
                                  return acc;
                                }, {})
                              ).sort(([a], [b]) => a.localeCompare(b)).map(([cluster, list]) => (
                                <div key={cluster}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ width: 10, height: 10, background: CLUSTER_COLORS[cluster] || '#6B7280', display: 'inline-block', border: '1px solid #000' }} />
                                    <strong>{ONTOLOGY_CLUSTERS[cluster]?.name || cluster}</strong>
                                    <span style={{ opacity: 0.7 }}>({list.length})</span>
                                  </div>
                                  <div style={{ paddingLeft: 18, display: 'grid', gap: 2 }}>
                                    {list.map((n) => (
                                      <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: selectedNodeId === n.id ? '#eef2ff' : 'transparent', border: selectedNodeId === n.id ? '1px solid #3b82f6' : '1px solid transparent', padding: '1px 2px', borderLeft: `3px solid ${CLUSTER_COLORS[n?.data?.metadata?.cluster] || '#6B7280'}` }}>
                                        <button
                                          style={{ ...ui.button, padding: '1px 6px' }}
                                          title="Focus in DSL"
                                          onClick={() => focusNodeInDsl(n.id)}
                                        >↗</button>
                                        <button
                                          style={{ ...ui.button, padding: '1px 6px' }}
                                          title="Focus in JSON"
                                          onClick={() => focusNodeInJson(n.id)}
                                        >{`{}`}</button>
                                        <NodeEnhancementModal
                                          node={n}
                                          onNodeUpdate={(updated) => {
                                            const c = updated?.data?.content;
                                            if (typeof c === 'string') {
                                              updateNode(updated.id, { content: c });
                                              notifyAiActivity(`AI updated content for node ${updated.id}`);
                                            }
                                          }}
                                          trigger={<button style={{ ...ui.button, padding: '1px 6px' }} title="Enhance this node (AI)" onClick={() => setSelectedNodeId(n.id)}>✨</button>}
                                        />
                                        <span style={{ opacity: 0.8, cursor: 'pointer' }} onClick={() => { setSelectedNodeId(n.id); try { emitNodeSelected('IDE', n.id); } catch {} }}>{n.data?.type || n.type}</span>
                                        <span>·</span>
                                        <span title={n.id} style={{ cursor: 'pointer' }} onClick={() => { setSelectedNodeId(n.id); try { emitNodeSelected('IDE', n.id); } catch {} }}>{n.data?.label || n.data?.title || n.id}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                              {(!wf?.nodes?.length) && <div style={{ opacity: 0.7 }}>No nodes yet</div>}
                            </div>
                          </div>
                        </div>
                        <div style={ui.sidePanel}>
                          <div style={ui.panelTitle}>Search</div>
                          <div style={{ ...ui.panelBody, display: showSearch? 'block': 'none' }}>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                              <input value={searchQ} onChange={(e)=>setSearchQ(e.target.value)} placeholder="depth > 2" style={{ ...ui.input, flex: 1 }} />
                              <button style={ui.button} onClick={()=>{ /* no-op */ }}>Find</button>
                            </div>
                            <div style={{ fontSize: 12 }}>
                              <div style={{ marginBottom: 4, opacity: 0.8 }}>Results</div>
                              <div style={{ maxHeight: '100%', overflowY: 'auto' }}>
                                {(wf?.nodes || []).filter(n => {
                                  if (!searchQ) return true;
                                  const q = searchQ.toLowerCase();
                                  const label = String(n?.data?.label || n?.id || '').toLowerCase();
                                  return label.includes(q);
                                }).slice(0, 20).map((n) => (
                                  <div key={n.id} title={n.id}>
                                    {n.id}: {String(n?.data?.label || n?.id)}
                                  </div>
                                ))}
                                {(!wf?.nodes?.length) && <div style={{ opacity: 0.7 }}>No nodes yet</div>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Panel>

                    {/* Vertical resize handle */}
                    <PanelResizeHandle style={{ width: 6, cursor: 'col-resize', background: '#D6D6D6', borderLeft: '1px solid #000', borderRight: '1px solid #fff' }} />

                    {/* Editor */}
                    <Panel defaultSize={56} minSize={30}>
                      <div style={{ ...ui.editor, width: '100%', minWidth: 0 }}>
                        {/* Tabs */}
                        <div style={ui.tabs} role="tablist" aria-label="Editor Tabs">
                          {['workflow.json','workflow.dsl','preview'].map((t) => {
                            const isActive = activeTab === t;
                            return (
                              <div
                                key={t}
                                role="tab"
                                aria-selected={isActive}
                                style={{
                                  ...ui.tab(isActive),
                                  ...(isActive && selectedColor ? { boxShadow: `${bevel.inset}, inset 0 -3px 0 ${selectedColor}` } : {}),
                                }}
                                onClick={() => setActiveTab(t)}
                              >{t}</div>
                            );
                          })}
                        </div>

                        {/* Code area */}
                        <div style={ui.editorBody}>
                          <div style={ui.gutter}>
                            {[...Array(200)].map((_, i) => (
                              <div key={i} style={{ textAlign: 'right', paddingRight: 6, fontSize: 11 }}>{i + 1}</div>
                            ))}
                          </div>
                          {/* Color bar reflects active tab's mapping */}
                          <div style={ui.colorbar} aria-hidden>
                            {activeTab === 'workflow.dsl' && (
                              <div style={{ position: 'absolute', inset: 0 }}>
                                {[...dslInfo.lineToNode.entries()].map(([lineIdx, nid]) => {
                                  const top = lineIdx * LINE_H - dslScrollTop;
                                  if (top < -LINE_H || top > 10000) return null; // skip far-off
                                  const c = getNodeColor(nid);
                                  return (
                                    <div key={`dsl-${lineIdx}`}
                                      title={nid}
                                      style={{ position: 'absolute', left: 0, right: 0, top, height: LINE_H, background: c, opacity: 0.4 }}
                                    />
                                  );
                                })}
                                {selectedDslLine >= 0 && (
                                  <div style={{ position: 'absolute', left: 0, right: 0, top: selectedDslLine * LINE_H - dslScrollTop, height: LINE_H, border: `1px solid ${selectedColor || '#fff'}` }} />
                                )}
                              </div>
                            )}
                            {activeTab === 'workflow.json' && (
                              <div style={{ position: 'absolute', inset: 0 }}>
                                {[...jsonInfo.lineToNode.entries()].map(([lineIdx, nid]) => {
                                  const top = lineIdx * LINE_H - jsonScrollTop;
                                  if (top < -LINE_H || top > 10000) return null;
                                  const c = getNodeColor(nid);
                                  return (
                                    <div key={`json-${lineIdx}`}
                                      title={nid}
                                      style={{ position: 'absolute', left: 0, right: 0, top, height: LINE_H, background: c, opacity: 0.4 }}
                                    />
                                  );
                                })}
                                {selectedJsonRange && (
                                  <div style={{ position: 'absolute', left: 0, right: 0, top: selectedJsonRange.start * LINE_H - jsonScrollTop, height: (selectedJsonRange.end - selectedJsonRange.start + 1) * LINE_H, border: `1px solid ${selectedColor || '#fff'}` }} />
                                )}
                              </div>
                            )}
                          </div>
                          <div style={ui.code}>
                            {activeTab === 'workflow.json' && (
                              <textarea
                                ref={jsonRef}
                                value={json}
                                onChange={(e)=>setJson(e.target.value)}
                                onScroll={(e)=>setJsonScrollTop(e.target.scrollTop)}
                                spellCheck={false}
                                style={{ width: '100%', height: '100%', minWidth: 0, boxSizing: 'border-box', border: 'none', outline: 'none', padding: 8, background: 'transparent', color: '#E6E6E6', fontFamily: 'Consolas, "Lucida Console", monospace', fontSize: 12, lineHeight: `${LINE_H}px`, overflow: 'auto' }}
                              />
                            )}
                            {activeTab === 'workflow.dsl' && (
                              <textarea
                                ref={dslRef}
                                value={dsl}
                                onChange={(e)=>setDsl(e.target.value)}
                                onScroll={(e)=>setDslScrollTop(e.target.scrollTop)}
                                spellCheck={false}
                                style={{ width: '100%', height: '100%', minWidth: 0, boxSizing: 'border-box', border: 'none', outline: 'none', padding: 8, background: 'transparent', color: '#E6E6E6', fontFamily: 'Consolas, "Lucida Console", monospace', fontSize: 12, lineHeight: `${LINE_H}px`, overflow: 'auto' }}
                              />
                            )}
                            {activeTab === 'preview' && (
                              <div style={{ height: '100%', overflow: 'auto' }}>
                                <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent' }}>
                                  {json}
                                </SyntaxHighlighter>
                              </div>
                            )}
                            {/* Selection highlight overlay */}
                            {selectedColor && activeTab !== 'preview' && (
                              <div style={{ pointerEvents: 'none', position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}>
                                {activeTab === 'workflow.dsl' && selectedDslLine >= 0 && (
                                  <div style={{ position: 'absolute', left: 0, right: 0, top: selectedDslLine * LINE_H - dslScrollTop, height: LINE_H, background: selectedColor, opacity: 0.18, outline: `1px solid ${selectedColor}` }} />
                                )}
                                {activeTab === 'workflow.json' && selectedJsonRange && (
                                  <div style={{ position: 'absolute', left: 0, right: 0, top: selectedJsonRange.start * LINE_H - jsonScrollTop, height: (selectedJsonRange.end - selectedJsonRange.start + 1) * LINE_H, background: selectedColor, opacity: 0.18, outline: `1px solid ${selectedColor}` }} />
                                )}
                              </div>
                            )}
                            {jsonError && (
                              <div style={{ position: 'absolute', right: 12, bottom: 12, color: '#FF8080', background: '#400', padding: '4px 6px', border: '1px solid #800', boxShadow: '2px 2px 0 #000', fontSize: 12 }}>Error: {jsonError}</div>
                            )}
                          </div>
                          <div style={ui.minimap} />
                        </div>
                      </div>
                    </Panel>

                    {/* Vertical resize handle */}
                    <PanelResizeHandle style={{ width: 6, cursor: 'col-resize', background: '#D6D6D6', borderLeft: '1px solid #000', borderRight: '1px solid #fff' }} />

                    {/* Inspector */}
                    <Panel defaultSize={22} minSize={16}>
                      <div style={{ ...ui.outline, display: showInspector? 'grid' : 'none', height: '100%', width: '100%', minWidth: 0 }}>
                        <div style={{ ...ui.panelTitle, ...(selectedColor ? { background: selectedColor, color: '#000' } : {}) }}>Inspector</div>
                        <div style={{ ...ui.panelBody, fontSize: 12, display: 'grid', gap: 8 }}>
                          {selectedNode ? (
                            <>
                              <div style={{ display: 'grid', gap: 4 }}>
                                <label>Label</label>
                                <input
                                  value={selectedNode.data?.label || ''}
                                  onChange={(e) => updateNode(selectedNode.id, { label: e.target.value, title: e.target.value })}
                                  style={{ ...ui.input }}
                                />
                              </div>
                              <div style={{ display: 'grid', gap: 4 }}>
                                <label>Type</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span title="Cluster color" style={{ width: 12, height: 12, border: '1px solid #000', background: CLUSTER_COLORS[selectedNode.data?.metadata?.cluster] || '#6B7280' }} />
                                  <select
                                    value={selectedNode.data?.type || selectedNode.type || ''}
                                    onChange={(e) => {
                                      const nextType = e.target.value;
                                      const cluster = NODE_TYPES[nextType]?.cluster || selectedNode.data?.metadata?.cluster;
                                      const metadata = { ...(selectedNode.data?.metadata || {}), ...(cluster ? { cluster } : {}) };
                                      updateNode(selectedNode.id, { type: nextType, metadata });
                                    }}
                                    style={{ ...ui.input }}
                                  >
                                    {Object.keys(NODE_TYPES).sort().map((t) => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                </div>
                                <div style={{ fontSize: 11, opacity: 0.8 }}>
                                  Cluster: {ONTOLOGY_CLUSTERS[selectedNode.data?.metadata?.cluster]?.name || selectedNode.data?.metadata?.cluster || 'unknown'}
                                </div>
                              </div>
                              <div style={{ display: 'grid', gap: 4 }}>
                                <label>Tags (comma-separated)</label>
                                <input
                                  value={(selectedNode.data?.tags || []).join(', ')}
                                  onChange={(e) => updateNode(selectedNode.id, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                  style={{ ...ui.input }}
                                />
                              </div>
                              <div style={{ display: 'grid', gap: 4 }}>
                                <label>Language</label>
                                <input
                                  value={selectedNode.data?.lang || selectedNode.data?.language || 'markdown'}
                                  onChange={(e) => updateNode(selectedNode.id, { lang: e.target.value, language: e.target.value })}
                                  style={{ ...ui.input }}
                                />
                              </div>
                              <div style={{ display: 'grid', gap: 4 }}>
                                <label>Color (hex or name)</label>
                                <input
                                  value={selectedNode.data?.color || ''}
                                  onChange={(e) => updateNode(selectedNode.id, { color: e.target.value })}
                                  style={{ ...ui.input }}
                                />
                              </div>
                              {/* Content editor & AI enhancement */}
                              <div style={{ display: 'grid', gap: 4 }}>
                                <label>Content</label>
                                <textarea
                                  value={selectedNode.data?.content || ''}
                                  onChange={(e) => updateNode(selectedNode.id, { content: e.target.value })}
                                  style={{ ...ui.input, minHeight: 100, resize: 'vertical', fontFamily: 'Consolas, "Lucida Console", monospace' }}
                                />
                                <div>
                                  <NodeEnhancementModal
                                    node={selectedNode}
                                    onNodeUpdate={(updated) => {
                                      const c = updated?.data?.content;
                                      if (typeof c === 'string') {
                                        updateNode(updated.id, { content: c });
                                        notifyAiActivity(`AI updated content for node ${updated.id}`);
                                      }
                                    }}
                                    trigger={<button style={{ ...ui.button, padding: '4px 8px' }}>Enhance Content (AI)</button>}
                                  />
                                </div>
                              </div>
                              {/* Fields editor mirrors Builder fields, with AI per-field via embedded modal */}
                              <div style={{ display: 'grid', gap: 4 }}>
                                <label>Fields</label>
                                <FieldEditor95
                                  value={selectedNode.data?.fields || []}
                                  onChange={(fields) => updateNode(selectedNode.id, { fields })}
                                />
                              </div>
                              {/* Connections editor (parity with Builder EdgeModal) */}
                              <div style={{ display: 'grid', gap: 6 }}>
                                <div style={{ fontWeight: 700 }}>Connections</div>
                                {(() => {
                                  const connected = (wf?.edges || []).filter(e => e.source === selectedNode.id || e.target === selectedNode.id);
                                  if (connected.length === 0) return <div style={{ fontSize: 12, opacity: 0.8 }}>No connected edges.</div>;
                                  return (
                                    <div style={{ display: 'grid', gap: 6 }}>
                                      {connected.map((e) => {
                                        const outgoing = e.source === selectedNode.id;
                                        const otherId = outgoing ? e.target : e.source;
                                        const other = (wf?.nodes || []).find(n => n.id === otherId);
                                        const op = e?.data?.operator || DEFAULT_EDGE_OPERATOR;
                                        const cond = e?.data?.condition || 'follows';
                                        const label = e?.data?.metadata?.label || '';
                                        const weight = typeof e?.data?.weight === 'number' ? e.data.weight : 1.0;
                                        const meta = getOperatorMeta(op);
                                        return (
                                          <div key={e.id} style={{ display: 'grid', gap: 4, padding: 6, background: '#F3F4F6', border: '1px solid #000', boxShadow: 'inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #404040' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                              <span title="Edge direction" style={{ width: 8, height: 8, border: '1px solid #000', background: meta.color }} />
                                              <strong>{outgoing ? 'Out' : 'In'}</strong>
                                              <span style={{ opacity: 0.8 }}>↔</span>
                                              <span title={other?.id || otherId} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{other?.data?.label || other?.data?.title || otherId}</span>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                                              <div style={{ display: 'grid', gap: 2 }}>
                                                <label style={{ fontSize: 11 }}>Operator</label>
                                                <select
                                                  value={op}
                                                  onChange={(ev) => {
                                                    const nextOp = ev.target.value;
                                                    const color = getOperatorMeta(nextOp)?.color;
                                                    updateEdge(e.id, { data: { ...e.data, operator: nextOp }, style: { ...(e.style || {}), stroke: color } });
                                                  }}
                                                  style={{ ...ui.input }}
                                                >
                                                  {Object.keys(EDGE_OPERATORS).map((k) => (
                                                    <option key={k} value={k}>{EDGE_OPERATORS[k].icon} {EDGE_OPERATORS[k].label}</option>
                                                  ))}
                                                </select>
                                              </div>
                                              <div style={{ display: 'grid', gap: 2 }}>
                                                <label style={{ fontSize: 11 }}>Condition</label>
                                                <select
                                                  value={cond}
                                                  onChange={(ev) => updateEdge(e.id, { data: { ...e.data, condition: ev.target.value } })}
                                                  style={{ ...ui.input }}
                                                >
                                                  {Object.values(EDGE_CONDITIONS).map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                  ))}
                                                </select>
                                              </div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 6 }}>
                                              <div style={{ display: 'grid', gap: 2 }}>
                                                <label style={{ fontSize: 11 }}>Label (optional)</label>
                                                <input
                                                  value={label}
                                                  onChange={(ev) => updateEdge(e.id, { data: { ...e.data, metadata: { ...(e.data?.metadata || {}), label: ev.target.value } } })}
                                                  placeholder="Edge label"
                                                  style={{ ...ui.input }}
                                                />
                                              </div>
                                              <div style={{ display: 'grid', gap: 2 }}>
                                                <label style={{ fontSize: 11 }}>Weight</label>
                                                <input
                                                  type="number"
                                                  step="0.1"
                                                  min="0"
                                                  max="1"
                                                  value={weight}
                                                  onChange={(ev) => {
                                                    const val = Math.max(0, Math.min(1, parseFloat(ev.target.value) || 0));
                                                    updateEdge(e.id, { data: { ...e.data, weight: val } });
                                                  }}
                                                  style={{ ...ui.input }}
                                                />
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </div>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button style={ui.button} onClick={() => duplicateNode(selectedNode.id)}>Duplicate</button>
                                <button style={{ ...ui.button, background: '#7f1d1d', color: '#fff' }} onClick={() => deleteNode(selectedNode.id)}>Delete</button>
                              </div>
                            </>
                          ) : (
                            <div style={{ opacity: 0.8 }}>Select a node from Explorer to edit its properties.</div>
                          )}
                        </div>
                      </div>
                    </Panel>
                  </PanelGroup>
                </div>
              </div>
            </Panel>

            {/* Horizontal resize handle */}
            <PanelResizeHandle style={{ height: 6, cursor: 'row-resize', background: '#D6D6D6', borderTop: '1px solid #000', borderBottom: '1px solid #fff' }} />

            {/* Bottom panel */}
            <Panel defaultSize={28} minSize={15}>
              <div style={{ ...ui.bottom, ...bevel.frame }}>
                <div style={ui.bottomTabs}>
                  {['terminal','problems','output'].map((t) => {
                    const isActive = bottomTab === t;
                    const label = t[0].toUpperCase()+t.slice(1);
                    const style = {
                      ...ui.bottomTab(isActive),
                      ...(t === 'terminal' && flashTerminal ? { boxShadow: '0 0 0 2px #111, 0 0 0 4px #fbbf24 inset', background: '#fffbe6' } : {}),
                    };
                    return (
                      <div key={t} style={style} onClick={() => setBottomTab(t)}>{label}</div>
                    );
                  })}
                </div>
                <div style={{ background: colors.sunken, borderTop: '1px solid #000', boxShadow: bevel.inset, minHeight: 0, overflow: 'auto' }}>
                  {bottomTab === 'terminal' && (
                    <pre id="ide95-terminal" style={{ ...ui.terminal, transition: 'background 0.2s', background: flashTerminal ? '#0b2a4a' : ui.terminal.background }}>
PS C:\\semantic_flow&gt; npm run build
Build succeeded.
0 Warning(s)   0 Error(s)
                    </pre>
                  )}
                  {bottomTab === 'problems' && (
                    <div style={{ padding: 8, fontSize: 12 }}>
                      {problems.length === 0 ? (
                        <div>No problems detected.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: 4 }}>
                          {problems.map((p, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 10, height: 10, background: p.severity === 'error' ? '#DC2626' : '#F59E0B', border: '1px solid #000', display: 'inline-block' }} />
                              <span style={{ width: 60, opacity: 0.8 }}>{p.where}</span>
                              <code style={{ background: '#eee', padding: '0 4px' }}>{p.id}</code>
                              <span>— {p.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {bottomTab === 'output' && (
                    <div style={{ padding: 8, fontSize: 12, display: 'grid', gap: 8 }}>
                      <div>
                        <div style={{ marginBottom: 6, fontWeight: 600 }}>History (last {history.length})</div>
                        {history.length === 0 ? (
                          <div>No snapshots yet. Click Snapshot to save the current workflow.</div>
                        ) : (
                          <div style={{ display: 'grid', gap: 4 }}>
                            {history.map((h, i) => (
                              <div key={h.ts + '-' + i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, border: '1px solid #000', background: '#93C5FD' }} />
                                <span style={{ opacity: 0.8 }}>{new Date(h.ts).toLocaleTimeString()}</span>
                                <span>— {h.title}</span>
                                <button style={{ ...ui.button, padding: '1px 6px' }} onClick={() => { try { commitWorkflow(JSON.parse(JSON.stringify(h.wf))); } catch {} }}>Restore</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </div>

        {/* Status Bar */}
        <div style={ui.statusBar}>
          <span>Line 1, Col 1</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span>JS</span>
          <span>Nodes: {wf?.nodes?.length || 0}</span>
          <span>Edges: {wf?.edges?.length || 0}</span>
          <div style={{ marginLeft: 'auto' }}>
            <button style={{ ...ui.button, background: colors.title, color: '#fff' }} onClick={runAction}>Run</button>
          </div>
        </div>
      </div>

      {/* Command Palette */}
      {showPalette && (
        <div style={ui.palette}>
          <div style={ui.panelTitle}>Command Palette</div>
          <div style={{ padding: 4, background: colors.sunken, borderTop: '1px solid #000', boxShadow: bevel.inset }}>
            <input autoFocus placeholder="> Rebalance Recursion" style={{ ...ui.input, width: '100%' }} onKeyDown={(e)=>{ if(e.key==='Escape'){ setShowPalette(false); } }} />
          </div>
          <div style={{ ...ui.panelBody, fontSize: 12 }}>
            <div>Rebind Context</div>
            <div>Stabilize Kernel</div>
            <div>Toggle Depth Meter</div>
            <div>Open Quine Pad</div>
          </div>
        </div>
      )}
    </div>
  );
}
