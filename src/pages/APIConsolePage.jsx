import React, { useState, useEffect, useMemo, useRef } from 'react';
import DiscourseViewer from '@/components/DiscourseViewer';
import { SecureKeyManager } from '@/lib/security';
import aiRouter, { publishSettings as publishAIRouterSettings, getPromptDefaults, publishPromptDefaults } from '@/lib/aiRouter';
import PromptingEngine from '@/lib/promptingEngine';
import { ONTOLOGY_CLUSTERS } from '@/lib/ontology';

// Win95 UI tokens
const win95 = {
  outset: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]',
  inset: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white',
  title: 'bg-[#000080] text-white font-semibold px-2 py-1',
  panel: 'bg-[#c0c0c0] border-2',
  button: 'bg-[#c0c0c0] border-2 px-2 py-1 cursor-pointer',
  miniButton: 'bg-[#c0c0c0] border-2 px-2 py-0.5 text-sm cursor-pointer',
  inputField: 'bg-white text-black border-2 px-2 py-1 focus:outline-none',
  checkbox: 'bg-white border-2 w-3 h-3',
  radio: 'bg-white border-2 w-3 h-3 rounded',
};

const providers = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'venice', name: 'Venice AI' },
  { id: 'nous', name: 'Nous Research' },
  { id: 'morpheus', name: 'Morpheus' },
  { id: 'discourse', name: 'Discourse AI' },
];

const endpoints = [
  { id: 'chatcompletions', name: 'chatcompletions' },
  { id: 'streaming', name: 'streaming' },
  { id: 'personas', name: 'personas' },
  { id: 'characters', name: 'characters' },
  { id: 'cores', name: 'cores' },
  { id: 'workspaces', name: 'workspaces' },
];

// Prompt configuration dialog and preview
function PromptConfigDialog({ feature, open, onClose, templates, setTemplates, activeVariant, setActiveVariant }) {
  const metaMap = {
    text2wf: { label: 'Text → Workflow', tokens: ['{{input}}'], core: ['standard','concise','verbose','experimental'] },
    execute: { label: 'Execute Workflow', tokens: ['{{workflow}}','{{format}}'], core: ['standard','trace','concise','diagnostics'] },
    enhance: { label: 'Enhance Content', tokens: ['{{content}}'], core: ['improve','optimize','refactor','enhance','simplify','elaborate'] },
  };
  if(!open) return null;
  const meta = metaMap[feature];
  const t = templates[feature] || {};
  const variants = t.variants || {};
  const ordered = [...new Set([...meta.core, ...Object.keys(variants)])];
  const [editing, setEditing] = useState(null);
  const [newKey, setNewKey] = useState('');
  const [newText, setNewText] = useState('');
  const dialogRef = useRef(null);
  const previouslyFocused = useRef(null);
  const updateVariant = (k, v) => {
    const next = { ...templates, [feature]: { ...t, variants: { ...variants, [k]: v } } };
    setTemplates(next);
  };
  const removeVariant = (k) => {
    if (meta.core.includes(k)) { alert('Core variant cannot be removed'); return; }
    const copy = { ...variants }; delete copy[k];
    const next = { ...templates, [feature]: { ...t, variants: copy } };
    setTemplates(next);
    if (activeVariant === k) setActiveVariant(meta.core[0]);
  };
  const addVariant = () => {
    const key = (newKey||'').trim().toLowerCase();
    if(!key.match(/^[a-z0-9_-]{3,32}$/)){ alert('Key 3-32 chars a-z0-9_-'); return; }
    if(!newText.trim()){ alert('Enter text'); return; }
    if(variants[key]) { alert('Variant exists'); return; }
    const next = { ...templates, [feature]: { ...t, variants: { ...variants, [key]: newText } } };
    setTemplates(next); setActiveVariant(key); setNewKey(''); setNewText('');
  };
  const saveAll = () => { publishPromptDefaults(templates); alert('Saved'); };
  const reload = () => { const fresh = getPromptDefaults(); setTemplates(fresh); alert('Reloaded'); };
  // Focus management & trap
  useEffect(() => {
    if(open){
      previouslyFocused.current = document.activeElement;
      // Defer to next tick for rendering
      setTimeout(() => {
        const first = dialogRef.current?.querySelector('textarea, input, select, button');
        first && first.focus();
      }, 0);
    }
  }, [open]);
  useEffect(() => {
    if(!open) return; // attach only when open
    const handleKey = (e) => {
      if(e.key === 'Escape') { e.preventDefault(); onClose(); }
      if(e.key === 'Tab') {
        const focusables = Array.from(dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
          .filter(el => !el.hasAttribute('disabled'));
        if(!focusables.length) return;
        const idx = focusables.indexOf(document.activeElement);
        let nextIdx = idx;
        if(e.shiftKey) {
          nextIdx = idx <= 0 ? focusables.length - 1 : idx - 1;
        } else {
          nextIdx = idx === focusables.length - 1 ? 0 : idx + 1;
        }
        e.preventDefault();
        (focusables[nextIdx] || focusables[0]).focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);
  // Restore focus when closed
  useEffect(() => {
    if(!open && previouslyFocused.current) {
      try { previouslyFocused.current.focus(); } catch {}
    }
  }, [open]);
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/45"
      onMouseDown={(e)=>{ if(e.target === e.currentTarget) onClose(); }}
      role="dialog" aria-modal="true" aria-label={`Configure ${meta.label}`}
    >
      <div ref={dialogRef} className={`${win95.panel} ${win95.outset} w-full max-w-3xl bg-[#c0c0c0] shadow-[4px_4px_0_#000]`} style={{imageRendering:'pixelated'}}>
        <div className={win95.title + ' flex justify-between items-center select-none'}>
          <span>Configure · {meta.label}</span>
          <div className="flex gap-2">
            <button onClick={saveAll} className={`${win95.miniButton} ${win95.outset} text-xs`}>Save</button>
            <button onClick={reload} className={`${win95.miniButton} ${win95.outset} text-xs`}>Reload</button>
            <button onClick={onClose} className={`${win95.miniButton} ${win95.outset} text-xs`}>Close</button>
          </div>
        </div>
        <div className={`${win95.inset} p-3 grid gap-4 text-xs max-h-[70vh] overflow-auto`}> 
          <div>
            <div className="font-semibold mb-1">System Prompt</div>
            <textarea value={t.system||''} onChange={(e)=>setTemplates(p=>({...p,[feature]:{...t, system:e.target.value}}))} className={`${win95.inset} w-full h-24 p-2 font-mono resize-none bg-white text-black`} />
          </div>
            <div>
              <div className="font-semibold mb-1">User Prompt Template</div>
              <textarea value={t.user||''} onChange={(e)=>setTemplates(p=>({...p,[feature]:{...t, user:e.target.value}}))} className={`${win95.inset} w-full h-20 p-2 font-mono resize-none bg-white text-black`} />
              <div className="mt-1 text-[10px] opacity-70 flex flex-wrap gap-2">Tokens: {meta.tokens.map(tok => <code key={tok} className="px-1 border bg-white">{tok}</code>)} <span className="opacity-50">auto-replaced</span></div>
            </div>
            <div>
              <div className="font-semibold mb-2">Variants</div>
              <div className="grid gap-2">
                {ordered.map(k => (
                  <div key={k} className="bg-white border p-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <input type="radio" name={`active-${feature}`} checked={activeVariant===k} onChange={()=>setActiveVariant(k)} />
                        <span className="font-semibold text-[11px]">{k}</span>
                        {meta.core.includes(k) && <span className="text-[9px] px-1 border bg-[#c0c0c0]">core</span>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={()=>setEditing(editing===k?null:k)} className={`${win95.miniButton} ${win95.outset} text-[10px]`}>{editing===k?'Done':'Edit'}</button>
                        {!meta.core.includes(k) && <button onClick={()=>{ if(window.confirm('Delete variant?')) removeVariant(k); }} className={`${win95.miniButton} ${win95.outset} text-[10px]`}>Del</button>}
                      </div>
                    </div>
                    {editing===k ? (
                      <textarea value={variants[k]||''} onChange={(e)=>updateVariant(k,e.target.value)} className={`${win95.inset} w-full h-16 p-1 font-mono text-[11px] resize-none bg-white text-black`} />
                    ) : (
                      <div className="text-[11px] whitespace-pre-wrap max-h-24 overflow-auto opacity-80">{(variants[k]||'').slice(0,300) || '(empty)'}</div>
                    )}
                  </div>
                ))}
                <div className="bg-white border p-2 grid gap-1">
                  <div className="font-semibold text-[11px]">Add Variant</div>
                  <input value={newKey} onChange={(e)=>setNewKey(e.target.value)} placeholder="key (e.g. precise2)" className={`${win95.inset} ${win95.inputField} text-xs`} />
                  <textarea value={newText} onChange={(e)=>setNewText(e.target.value)} placeholder="Instruction text" className={`${win95.inset} w-full h-16 p-1 font-mono text-[11px] resize-none bg-white text-black`} />
                  <div className="flex gap-2">
                    <button onClick={addVariant} className={`${win95.button} ${win95.outset} text-xs bg-[#000080] text-white`}>Add</button>
                    <button onClick={()=>{ setNewKey(''); setNewText(''); }} className={`${win95.button} ${win95.outset} text-xs`}>Clear</button>
                  </div>
                </div>
              </div>
              <PromptPreview feature={feature} variant={activeVariant} t={t} variants={variants} />
            </div>
        </div>
        <div className="px-3 py-2 border-t border-[#6d6d6d] flex justify-end gap-2 bg-[#b0b0b0]">
          <button onClick={onClose} className={`${win95.button} ${win95.outset} text-xs`}>Close</button>
          <button onClick={saveAll} className={`${win95.button} ${win95.outset} text-xs bg-[#000080] text-white`}>Save</button>
        </div>
      </div>
    </div>
  );
}

function PromptPreview({ feature, variant, t, variants }) {
  const examples = {
    text2wf: 'Build a task manager with CRUD and tagging.',
    execute: '{"nodes":[],"edges":[]}',
    enhance: 'Clarify impact of temperature rise on crop yield.',
  };
  const rawUser = (t.user||'')
    .replace('{{input}}', examples.text2wf)
    .replace('{{workflow}}', examples.execute)
    .replace('{{content}}', examples.enhance);
  const sys = (t.system||'').replace('{{format}}','JSON');
  const variantLine = variants[variant] ? `\nVariant Instruction: ${variants[variant]}` : '';
  const final = [sys?`SYSTEM>\n${sys}`:'', `USER>\n${rawUser}${variantLine}`].filter(Boolean).join('\n\n');
  return (
    <div className="mt-3">
      <div className="font-semibold mb-1">Preview</div>
      <div className={`${win95.inset} bg-white p-2 font-mono text-[11px] max-h-48 overflow-auto whitespace-pre-wrap`}>{final}</div>
    </div>
  );
}

export default function APIConsolePage() {
  // Provider state
  const [activeProvider, setActiveProvider] = useState('openai');
  const [apiBase, setApiBase] = useState('https://api.openai.com/v1');
  const [model, setModel] = useState('gpt-4o-mini');
  const [streaming, setStreaming] = useState(true);

  // Endpoints
  const [activeEndpoints, setActiveEndpoints] = useState(['chatcompletions']);

  // Request
  const [method, setMethod] = useState('POST');
  const [path, setPath] = useState('/responses');
  const [bodyContent, setBodyContent] = useState(
    JSON.stringify(
      {
        model: 'gpt-4o-mini',
        temperature: 0.2,
        input: 'Hello',
        stream: false,
      },
      null,
      2,
    ),
  );

  // Response
  const [responseStatus, setResponseStatus] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [tokens, setTokens] = useState({ in: 0, out: 0 });
  const [cost, setCost] = useState('$0.0000');
  const [responseContent, setResponseContent] = useState('');
  const [responseView, setResponseView] = useState('json'); // 'json' | 'text'

  // History and limits
  const [history, setHistory] = useState(() => {
    try {
      const raw = sessionStorage.getItem('api_history_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [selectedLogIndex, setSelectedLogIndex] = useState(0);
  const [showCallDetails, setShowCallDetails] = useState(true); // sidebar for selected call details
  const [presets, setPresets] = useState(() => {
    try {
      const raw = localStorage.getItem('api_presets_v1');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const totalTokens = useMemo(() => history.reduce((acc, h) => ({ in: acc.in + (h.tokens?.in || 0), out: acc.out + (h.tokens?.out || 0) }), { in: 0, out: 0 }), [history]);
  const recent = useMemo(() => history.slice(0, 10), [history]);
  const gauge = useMemo(() => {
    const now = Date.now();
    const lastMin = history.filter(h => now - h.ts < 60000);
    const tps = lastMin.length / 60; // per second
    const avgLatency = recent.length ? Math.round(recent.reduce((a, h) => a + (h.ms || 0), 0) / recent.length) : 0;
    const errorRate = recent.length ? Math.round((recent.filter(h => (h.status || 200) >= 400).length / recent.length) * 100) : 0;
    return {
      tps: Math.min(1, tps / 2), // scale: 0..2 tps → 0..1
      latency: Math.min(1, avgLatency / 2000), // 0..2000ms → 0..1
      errors: Math.min(1, errorRate / 100), // 0..100%
      avgLatency,
      errorRate,
  rawTPS: tps,
    };
  }, [history, recent]);

  // Keys
  const [keys, setKeys] = useState([
    { label: 'svc-openai', lastUsed: '' },
    { label: 'svc-openrouter', lastUsed: '' },
    { label: 'svc-venice', lastUsed: '' },
  { label: 'svc-nous', lastUsed: '' },
  { label: 'svc-morph', lastUsed: '' },
  ]);
  const [activeKey, setActiveKey] = useState('');
  const [keyManagerOpen, setKeyManagerOpen] = useState(false);
  const [keyInputs, setKeyInputs] = useState({ openai: '', openrouter: '', venice: '', nous: '', morpheus: '' });
  const [showKeyFields, setShowKeyFields] = useState({ openai: false, openrouter: false, venice: false, nous: false, morpheus: false });

  // Pipeline
  const [pipelineLog, setPipelineLog] = useState('');

  // Features (Advanced toggle)
  const [features, setFeatures] = useState({ advanced: false, discourseTab: true });
  const [showDiscourseViewer, setShowDiscourseViewer] = useState(false);

  // AI Functions (PromptingEngine) state
  const [aiTab, setAiTab] = useState('text2wf'); // 'text2wf' | 'execute' | 'enhance'
  const [aiInput, setAiInput] = useState('Outline a semantic workflow for building a todo app.');
  const [aiTemp, setAiTemp] = useState(0.7);
  const [aiMax, setAiMax] = useState(800);
  const [aiExecFormat, setAiExecFormat] = useState('json');
  const [aiRunning, setAiRunning] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [aiWorkflowInfo, setAiWorkflowInfo] = useState({ nodes: 0, edges: 0, title: '' });
  const [engine] = useState(() => new PromptingEngine('router-user'));
  // Prompt templates (system/user) editable by user
  const [promptTemplates, setPromptTemplates] = useState(() => getPromptDefaults());
  // Enhancement variant selection
  const [aiEnhancementType, setAiEnhancementType] = useState('improve');
  // Enhancement mode: 'node' (chosen node+field) or 'adhoc' (free text)
  const [aiEnhanceMode, setAiEnhanceMode] = useState('node');
  // Variants for text2wf & execute
  const [aiText2WfVariant, setAiText2WfVariant] = useState('standard');
  const [aiExecuteVariant, setAiExecuteVariant] = useState('standard');
  // (Legacy removed) per-variant inline creation state replaced by centralized customization panels
  const enhancementVariants = useMemo(() => {
    const base = promptTemplates?.enhance?.variants || {};
    // Ensure core defaults exist even if user removed
    const core = ['improve','optimize','refactor','enhance','simplify','elaborate'];
    const merged = { ...core.reduce((acc,k)=>({ ...acc, [k]: base[k] || '' }), {}), ...base };
    return merged;
  }, [promptTemplates]);
  const text2wfVariants = useMemo(()=> ({ ...(promptTemplates.text2wf?.variants||{}) }), [promptTemplates]);
  const executeVariants = useMemo(()=> ({ ...(promptTemplates.execute?.variants||{}) }), [promptTemplates]);
  // Per-tab customization toggles
  // Unified prompt configuration dialog state
  const [promptDialogFeature, setPromptDialogFeature] = useState(null); // 'text2wf' | 'execute' | 'enhance' | null
  const promptDialogOpen = !!promptDialogFeature;
  const [availableProviders, setAvailableProviders] = useState([]);
  const [aiIncludeOntology, setAiIncludeOntology] = useState(true);
  const [aiOntologyMode, setAiOntologyMode] = useState('force_framework');
  const [aiSelectedClusters, setAiSelectedClusters] = useState(() => Object.keys(ONTOLOGY_CLUSTERS));

  const aiToggleCluster = (code) => {
    setAiSelectedClusters(prev => {
      if (prev.includes(code)) return prev.filter(c => c !== code);
      return [...prev, code];
    });
  };
  const aiSelectAllClusters = (checked) => setAiSelectedClusters(checked ? Object.keys(ONTOLOGY_CLUSTERS) : []);
  const providerModels = useMemo(() => (availableProviders.find(p => p.providerId === activeProvider)?.models) || [], [availableProviders, activeProvider]);
  const [customModel, setCustomModel] = useState('');
  const effectiveModel = useMemo(() => (customModel && customModel.trim()) ? customModel.trim() : model, [customModel, model]);
  // Enhance: choose node+field from saved workflow
  const [aiWf, setAiWf] = useState(null);
  const [selNodeId, setSelNodeId] = useState('');
  const selNode = useMemo(() => (aiWf?.nodes || []).find(n => n.id === selNodeId) || null, [aiWf, selNodeId]);
  const nodeFields = useMemo(() => {
    const fs = Array.isArray(selNode?.data?.fields) ? selNode.data.fields : [];
    // Also expose top-level content/description if not in fields array
    const extras = [];
    if (typeof selNode?.data?.content === 'string' && !fs.some(f=>f.name==='content')) extras.push({ name: 'content', type: 'longText', value: selNode.data.content });
    if (typeof selNode?.data?.description === 'string' && !fs.some(f=>f.name==='description')) extras.push({ name: 'description', type: 'longText', value: selNode.data.description });
    return [...fs, ...extras];
  }, [selNode]);
  const [selField, setSelField] = useState('');
  const selFieldValue = useMemo(() => (nodeFields.find(f => f.name === selField)?.value) ?? '', [nodeFields, selField]);

  // Known provider routes (exposed in UI)
  const providerRoutes = useMemo(() => ({
    openai: [
      { label: 'Responses', method: 'POST', base: 'https://api.openai.com/v1', path: '/responses', streaming: false },
      { label: 'Chat Completions', method: 'POST', base: 'https://api.openai.com/v1', path: '/chat/completions', streaming: true },
      { label: 'Models', method: 'GET', base: 'https://api.openai.com/v1', path: '/models' },
    ],
    openrouter: [
      { label: 'Chat Completions', method: 'POST', base: 'https://openrouter.ai/api/v1', path: '/chat/completions', streaming: true },
      { label: 'Completions', method: 'POST', base: 'https://openrouter.ai/api/v1', path: '/completions', streaming: false },
    ],
    venice: [
      { label: 'Chat Completions', method: 'POST', base: 'https://api.venice.ai/api/v1', path: '/chat/completions', streaming: true },
    ],
    nous: [
      { label: 'Chat Completions', method: 'POST', base: 'https://inference-api.nousresearch.com/v1', path: '/chat/completions', streaming: true },
      { label: 'Completions', method: 'POST', base: 'https://inference-api.nousresearch.com/v1', path: '/completions', streaming: false },
    ],
    morpheus: [
      { label: 'Chat Completions', method: 'POST', base: 'https://api.mor.org/api/v1', path: '/chat/completions', streaming: true },
    ],
    discourse: [
      { label: 'Personas (proxy)', method: 'GET', base: 'https://hub.bitwiki.org/api', path: '/discourse_ai/personas' },
    ],
  }), []);

  // Effects
  useEffect(() => {
    // Load feature toggles (migrate from legacy experimental)
    try {
      const raw = localStorage.getItem('sf_local_settings_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.features) {
          const { experimental, advanced, discourseTab } = parsed.features;
          setFeatures({
            advanced: typeof advanced === 'boolean' ? advanced : !!experimental,
            discourseTab: typeof discourseTab === 'boolean' ? discourseTab : true,
          });
        }
      }
    } catch {}

    const savedKey = SecureKeyManager.getApiKey(activeProvider);
    if (savedKey) setActiveKey(savedKey);

  const firstRoute = providerRoutes[activeProvider]?.[0];
    if (firstRoute) {
      setApiBase(firstRoute.base);
      setPath(firstRoute.path);
      setMethod(firstRoute.method);
      setStreaming(!!firstRoute.streaming);
    }
  // publish active provider so other pages pick it up
  publishAIRouterSettings({ activeProvider });
  }, [activeProvider]);

  useEffect(() => {
    if (activeKey && activeProvider) {
      SecureKeyManager.storeApiKey(activeProvider, activeKey);
    }
  }, [activeKey, activeProvider]);

  // Load available providers/models for AI Functions
  useEffect(() => {
    const load = async () => {
      try {
        const ps = await engine.getAvailableProviders();
        setAvailableProviders(ps);
        // If current model empty, pick a suggested model for the active provider
        const ap = ps.find(p => p.providerId === activeProvider);
        if (ap && (!model || !model.trim())) {
          setModel(ap.models?.[0] || model);
        }
      } catch {}
    };
    load();
  }, [engine, activeProvider]);

  // Keep local copy of prompt templates in sync with storage on mount
  useEffect(() => {
    try {
      const p = getPromptDefaults();
      setPromptTemplates(p);
    } catch {}
  }, []);

  // Keep model/stream fields in sync with body JSON
  useEffect(() => {
    try {
      const body = JSON.parse(bodyContent || '{}');
      if (body && typeof body === 'object') {
        const next = { ...body };
        if (model) next.model = model;
        if (typeof streaming === 'boolean') next.stream = streaming;
        setBodyContent(JSON.stringify(next, null, 2));
      }
    } catch { /* ignore invalid JSON */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, streaming]);

  // publish settings whenever base/model/streaming change so all pages share the router settings
  useEffect(() => {
    publishAIRouterSettings({ activeProvider, base: apiBase, model, streaming });
  }, [activeProvider, apiBase, model, streaming]);

  const toggleEndpoint = (endpointId) => {
    setActiveEndpoints((prev) =>
      prev.includes(endpointId) ? prev.filter((id) => id !== endpointId) : [...prev, endpointId],
    );
  };

  const sanitizeHeaders = (h) => {
    const c = { ...h };
    if (c.Authorization) {
      const v = String(c.Authorization);
      const tail = v.slice(-6);
      c.Authorization = `Bearer ••••••${tail}`;
    }
    return c;
  };

  const generateKey = () => {
    const keyPrefix = `sk-${activeProvider.substring(0, 2)}`;
    const randomPart = [...Array(24)].map(() => Math.random().toString(36)[2]).join('');
    const newKey = `${keyPrefix}-${randomPart}`;
    setActiveKey(newKey);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    const newKeyEntry = { label: `svc-${activeProvider.substring(0, 5)}`, lastUsed: timeStr };
    setKeys([newKeyEntry, ...keys.slice(0, 3)]);
  };

  const copyKey = () => {
    if (!activeKey) return;
    navigator.clipboard.writeText(activeKey);
    alert('API key copied to clipboard');
  };

  const saveActiveKey = () => {
    if (!activeProvider) return;
    if (!activeKey || !activeKey.trim()) {
      alert('Enter a valid API key');
      return;
    }
    SecureKeyManager.storeApiKey(activeProvider, activeKey.trim());
    alert(`${activeProvider} key saved to session`);
  };

  const loadSavedKey = () => {
    if (!activeProvider) return;
    const k = SecureKeyManager.getApiKey(activeProvider) || '';
    setActiveKey(k);
    if (!k) alert('No saved key found for this provider');
  };

  const clearActiveKey = () => {
    if (!activeProvider) return;
    // remove only this provider's key from session
    try {
  SecureKeyManager.clearApiKey(activeProvider);
      setActiveKey('');
      alert(`${activeProvider} key cleared from session`);
    } catch {}
  };

  const openKeyManager = () => {
    setKeyInputs({
      openai: SecureKeyManager.getApiKey('openai') || '',
      openrouter: SecureKeyManager.getApiKey('openrouter') || '',
      venice: SecureKeyManager.getApiKey('venice') || '',
      nous: SecureKeyManager.getApiKey('nous') || '',
      morpheus: SecureKeyManager.getApiKey('morpheus') || '',
    });
    setKeyManagerOpen(true);
  };

  const saveAllKeys = () => {
    Object.entries(keyInputs).forEach(([pid, val]) => {
      if (val && val.trim()) SecureKeyManager.storeApiKey(pid, val.trim());
    });
    alert('Keys saved to session');
    // if current provider has value, reflect it in Active Key
    const curr = keyInputs[activeProvider];
    if (typeof curr === 'string') setActiveKey(curr);
    setKeyManagerOpen(false);
  };

  const copyCurl = () => {
    const headerKey = SecureKeyManager.getApiKey(activeProvider) || activeKey || '';
    const h = [
      `Authorization: Bearer ${headerKey}`,
      'Content-Type: application/json',
      ...(activeProvider === 'openrouter'
        ? [
            `HTTP-Referer: ${window.location.origin}`,
            'X-Title: Semantic Canvas',
          ]
        : []),
      ...(activeProvider === 'openai'
        ? [
            ...(sessionStorage.getItem('openai_org') ? [`OpenAI-Organization: ${sessionStorage.getItem('openai_org')}`] : []),
            ...(sessionStorage.getItem('openai_project') ? [`OpenAI-Project: ${sessionStorage.getItem('openai_project')}`] : []),
          ]
        : []),
    ];
    const headers = h.map((x) => `-H '${x}'`).join(' ');
    const dataFlag = method !== 'GET' ? `--data '${bodyContent}'` : '';
    const curl = `curl -X ${method} '${apiBase}${path}' ${headers} ${dataFlag}`.trim();
    navigator.clipboard.writeText(curl);
    alert('cURL command copied to clipboard');
  };

  const sendRequest = async () => {
    try {
      setPipelineLog(`plan> ${method} ${path}  provider=${activeProvider}  stream=${streaming}`);
      setResponseStatus('');
      setResponseTime('');
      setResponseContent('');

      const startTime = Date.now();
      const requestKey = SecureKeyManager.getApiKey(activeProvider) || activeKey || '';
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${requestKey}`,
        ...(activeProvider === 'openrouter'
          ? {
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Semantic Canvas',
            }
          : {}),
        ...(activeProvider === 'openai'
          ? {
              ...(sessionStorage.getItem('openai_org') ? { 'OpenAI-Organization': sessionStorage.getItem('openai_org') } : {}),
              ...(sessionStorage.getItem('openai_project') ? { 'OpenAI-Project': sessionStorage.getItem('openai_project') } : {}),
            }
          : {}),
      };

      // Prepare request inspector info
      let parsedBody = {};
      try { parsedBody = method !== 'GET' ? JSON.parse(bodyContent) : {}; } catch {}
      const requestInfo = {
        provider: activeProvider,
        method,
        url: `${apiBase}${path}`,
        base: apiBase,
        path,
        model,
        streaming,
        headers: sanitizeHeaders(headers),
        body: parsedBody,
      };

  const response = await fetch(`${apiBase}${path}`, {
        method,
        headers,
        body: method !== 'GET' ? bodyContent : undefined,
      });

      const endTime = Date.now();
      setResponseTime(`${endTime - startTime} ms`);
      setResponseStatus(`${response.status} ${response.statusText}`);

      const meta = {
        requestId: response.headers.get('x-request-id') || response.headers.get('openai-request-id') || null,
        rateLimits: {
          limitRequests: response.headers.get('x-ratelimit-limit-requests') || null,
          remainingRequests: response.headers.get('x-ratelimit-remaining-requests') || null,
          resetRequests: response.headers.get('x-ratelimit-reset-requests') || null,
          limitTokens: response.headers.get('x-ratelimit-limit-tokens') || null,
          remainingTokens: response.headers.get('x-ratelimit-remaining-tokens') || null,
          resetTokens: response.headers.get('x-ratelimit-reset-tokens') || null,
        },
      };

      if (!response.ok) {
        const text = await response.text();
        // Try to format JSON error if possible
        let out = text;
        try { out = JSON.stringify(JSON.parse(text), null, 2); } catch {}
        setResponseContent(out);
        setHistory((prev) => {
          const entry = { ts: Date.now(), ...requestInfo, status: response.status, ms: endTime - startTime, tokens: null, error: true, responsePreview: (text || '').slice(0, 200), meta };
          const next = [entry, ...prev].slice(0, 50);
          sessionStorage.setItem('api_history_v1', JSON.stringify(next));
          return next;
        });
        setSelectedLogIndex(0);
        return;
      }

      if (streaming && path.includes('completions') && response.body?.getReader) {
        let inTokens = 0;
        let outTokens = 0;
        try {
          const body = JSON.parse(bodyContent);
          if (body.messages) inTokens = Math.round(body.messages.reduce((a, m) => a + (m.content?.length || 0) / 4, 0));
        } catch {}

        const reader = response.body.getReader();
        let streamChunks = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          streamChunks += chunk;
          outTokens += Math.round(chunk.length / 6);
          setResponseContent(streamChunks);
        }
        setTokens({ in: inTokens, out: outTokens });
        setCost(`$${(inTokens * 0.00001 + outTokens * 0.00003).toFixed(6)}`);
        // Record history
        setHistory((prev) => {
          const entry = { ts: Date.now(), ...requestInfo, status: response.status, ms: endTime - startTime, tokens: { in: inTokens, out: outTokens }, responsePreview: streamChunks.slice(0, 120) };
          const next = [entry, ...prev].slice(0, 50);
          sessionStorage.setItem('api_history_v1', JSON.stringify(next));
          return next;
        });
        setSelectedLogIndex(0);
      } else {
        const data = await response.json().catch(() => ({}));
        setResponseContent(JSON.stringify(data, null, 2));
        if (data.usage) {
          const pt = data.usage.prompt_tokens ?? data.usage.input_tokens ?? 0;
          const ct = data.usage.completion_tokens ?? data.usage.output_tokens ?? 0;
          setTokens({ in: pt, out: ct });
          setCost(`$${(pt * 0.00001 + ct * 0.00003).toFixed(6)}`);
        }
        // Record history
        setHistory((prev) => {
          const entry = { ts: Date.now(), ...requestInfo, status: response.status, ms: endTime - startTime, tokens: data.usage ? { in: (data.usage.prompt_tokens ?? data.usage.input_tokens ?? 0), out: (data.usage.completion_tokens ?? data.usage.output_tokens ?? 0) } : { ...tokens }, responsePreview: JSON.stringify(data).slice(0, 200), meta };
          const next = [entry, ...prev].slice(0, 50);
          sessionStorage.setItem('api_history_v1', JSON.stringify(next));
          return next;
        });
        setSelectedLogIndex(0);
      }
    } catch (err) {
      setResponseStatus('Error');
      setResponseContent(`Error: ${err.message}`);
    }
  };

  // --- AI Functions handlers ---
  const loadWorkflowFromLocal = () => {
    try {
      const raw = localStorage.getItem('current-workflow');
      if (!raw) { alert('No workflow found. Open the Builder and save a workflow first.'); return null; }
      const wf = JSON.parse(raw);
      const nodes = Array.isArray(wf?.nodes) ? wf.nodes.length : 0;
      const edges = Array.isArray(wf?.edges) ? wf.edges.length : 0;
      const title = wf?.metadata?.title || 'Untitled Workflow';
      setAiWorkflowInfo({ nodes, edges, title });
  setAiWf(wf);
  if (!selNodeId && wf.nodes?.[0]?.id) setSelNodeId(wf.nodes[0].id);
      return wf;
    } catch (e) { alert('Failed to load workflow: ' + (e.message || String(e))); return null; }
  };

  const aiTextToWorkflow = async () => {
    const prov = activeProvider;
    const key = SecureKeyManager.getApiKey(prov) || activeKey;
    if (!key) { alert(`Missing API key for ${prov}`); return; }
    setAiRunning(true); setAiOutput('');
    try {
  const res = await engine.convertTextToWorkflow(aiInput, key, prov, effectiveModel, {
        includeOntology: !!aiIncludeOntology,
        ontologyMode: aiOntologyMode,
        selectedOntologies: aiSelectedClusters,
        variant: aiText2WfVariant !== '__new' ? aiText2WfVariant : 'standard',
      });
      if (!res.success) throw new Error(res.error || 'Failed');
      setAiOutput(JSON.stringify(res.workflow, null, 2));
    } catch (e) { setAiOutput('Error: ' + (e.message || String(e))); }
    finally { setAiRunning(false); }
  };

  const aiExecuteWorkflow = async () => {
    const prov = activeProvider;
  const key = SecureKeyManager.getApiKey(prov) || activeKey;
    if (!key) { alert(`Missing API key for ${prov}`); return; }
  const wf = aiWf || loadWorkflowFromLocal();
    if (!wf || !wf.nodes?.length) { alert('Workflow has no nodes.'); return; }
    setAiRunning(true); setAiOutput('');
    try {
  const res = await engine.executeWorkflowWithFormat(wf, aiExecFormat, { temperature: aiTemp, maxTokens: Math.max(256, aiMax), providerId: prov, model: effectiveModel, apiKey: key, variant: aiExecuteVariant !== '__new' ? aiExecuteVariant : 'standard' });
      if (!res.success) throw new Error(res.error || 'Failed');
      setAiOutput(String(res.execution?.result || ''));
    } catch (e) { setAiOutput('Error: ' + (e.message || String(e))); }
    finally { setAiRunning(false); }
  };

  const aiEnhance = async () => {
    const prov = activeProvider;
  const key = SecureKeyManager.getApiKey(prov) || activeKey;
    if (!key) { alert(`Missing API key for ${prov}`); return; }
    let node;
    if (aiEnhanceMode === 'node') {
      if (!aiWf) { alert('Load a workflow first.'); return; }
      if (!selNode || !selField) { alert('Select a node and field to enhance.'); return; }
      const content = String(selFieldValue || '');
      if (!content.trim()) { alert('Selected field is empty.'); return; }
      node = { id: selNode.id, data: { ...(selNode.data || {}), content } };
    } else { // adhoc
      const content = String(aiInput || '');
      if (!content.trim()) { alert('Enter ad-hoc text to enhance.'); return; }
      node = { id: 'ad-hoc', data: { type: 'UTIL-BLANK', content } };
    }
    setAiRunning(true); setAiOutput('');
    try {
      const res = await engine.enhanceNode(node, aiEnhancementType || 'improve', { temperature: aiTemp, maxTokens: Math.max(256, aiMax), providerId: prov, model: effectiveModel, apiKey: key });
      if (!res.success) throw new Error(res.error || 'Failed');
      setAiOutput(String(res.enhancement?.enhancedContent || ''));
    } catch (e) { setAiOutput('Error: ' + (e.message || String(e))); }
    finally { setAiRunning(false); }
  };

  const applyEnhancedToWorkflow = () => {
    if (!aiWf || !selNode || !selField) { alert('Select node and field first.'); return; }
    if (!aiOutput || aiOutput.startsWith('Error:')) { alert('No enhanced output to apply.'); return; }
    try {
      const wf = JSON.parse(JSON.stringify(aiWf));
      const idx = wf.nodes.findIndex(n => n.id === selNode.id);
      if (idx < 0) throw new Error('Node not found');
      const n = wf.nodes[idx];
      const fs = Array.isArray(n.data?.fields) ? [...n.data.fields] : [];
      const fIdx = fs.findIndex(f => f.name === selField);
      if (fIdx >= 0) fs[fIdx] = { ...fs[fIdx], value: aiOutput };
      if (selField === 'content') n.data.content = aiOutput;
      if (selField === 'description') n.data.description = aiOutput;
      n.data.fields = fs;
      wf.nodes[idx] = n;
      localStorage.setItem('current-workflow', JSON.stringify(wf));
      setAiWf(wf);
      setAiWorkflowInfo({ nodes: wf.nodes.length, edges: wf.edges.length, title: wf?.metadata?.title || '' });
      alert('Applied enhanced text to workflow.');
    } catch (e) {
      alert('Failed to apply: ' + (e.message || String(e)));
    }
  };

  // Test helpers
  const smallTestBody = (m) => JSON.stringify({
    model: m,
    messages: [{ role: 'user', content: 'ping' }],
    max_tokens: 5,
    stream: false,
  });

  const testProvider = async (provId) => {
  const key = SecureKeyManager.getApiKey(provId) || (provId === activeProvider ? activeKey : '');
    if (!key) {
      alert(`${provId}: missing API key`);
      return { provider: provId, ok: false, error: 'missing_key' };
    }
    try {
      const result = await aiRouter.testProvider(provId, key, model);
      if (!result.ok) throw new Error(result.error || 'failed');
      alert(`${provId}: OK`);
      return { provider: provId, ok: true };
    } catch (e) {
      alert(`${provId}: ${e.message}`);
      return { provider: provId, ok: false, error: e.message };
    }
  };

  const testAllProviders = async () => {
  for (const p of ['openai', 'openrouter', 'venice', 'nous', 'morpheus']) {
      // eslint-disable-next-line no-await-in-loop
      await testProvider(p);
    }
  };

  const clearRequest = () => {
    setPath('/v1/chat/completions');
    setMethod('POST');
    setBodyContent(
      JSON.stringify(
        {
          model: 'gpt-4o-mini',
          temperature: 0.2,
          stream: true,
          messages: [{ role: 'user', content: 'Hello' }],
        },
        null,
        2,
      ),
    );
  };

  const savePreset = () => {
    const name = window.prompt('Save request as… name:');
    if (!name) return;
    const preset = { name, provider: activeProvider, base: apiBase, method, path, model, streaming, body: bodyContent };
    const next = [preset, ...presets.filter(p => p.name !== name)].slice(0, 50);
    setPresets(next);
    localStorage.setItem('api_presets_v1', JSON.stringify(next));
  };

  const loadPreset = (p) => {
    setActiveProvider(p.provider);
    setApiBase(p.base);
    setMethod(p.method);
    setPath(p.path);
    setModel(p.model);
    setStreaming(p.streaming);
    setBodyContent(p.body);
  };

  const deletePreset = (name) => {
    const next = presets.filter(p => p.name !== name);
    setPresets(next);
    localStorage.setItem('api_presets_v1', JSON.stringify(next));
  };

  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('api_history_v1');
  };

  const exportHistory = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'api-history.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-0 m-0 w-full h-full overflow-auto bg-[#008080] text-black flex items-start justify-center">
      <div className="w-full max-w-7xl p-4">
        <div className={`${win95.panel} ${win95.outset} w-full`}>
          <div className={win95.title}>Pipeline Forge OS · API Console</div>

          {/* Top: Provider Tabs (page-wide) */}
          <div className="p-2 bg-[#c0c0c0] border-b-2 flex items-center gap-2">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProvider(p.id)}
                className={`${win95.miniButton} ${win95.outset} px-4 py-2 text-sm ${activeProvider === p.id ? 'bg-[#000080] text-white' : ''}`}
              >
                {p.name}
              </button>
            ))}
            <div className="flex-1" />
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={features.advanced} onChange={(e)=>{const next={...features, advanced:e.target.checked}; setFeatures(next); try{const raw=localStorage.getItem('sf_local_settings_v1'); const parsed= raw?JSON.parse(raw):{}; localStorage.setItem('sf_local_settings_v1', JSON.stringify({...parsed, features: next}));}catch{}}} />
              Advanced
            </label>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-[#c0c0c0]`}>
            {/* Left: Provider Profile */}
            <div className={`col-span-12 md:col-span-3 ${win95.panel} ${win95.outset}`}>
              <div>
                <div className={win95.title}>{providers.find(p=>p.id===activeProvider)?.name || 'Provider'}</div>
                <div className="p-3 space-y-3">
                  <div className="text-sm">Profile</div>
                  <div className="text-xs opacity-80">Settings and keys for <b>{activeProvider}</b></div>

                  <div className="mt-2">
                    <div className="mb-1 text-sm">API Base</div>
                    <input type="text" value={apiBase} onChange={(e)=>setApiBase(e.target.value)} className={`${win95.inset} ${win95.inputField} w-full text-sm`} />
                  </div>

                  <div>
                    <div className="mb-1 text-sm">Model (suggested)</div>
                    <select value={providerModels.includes(model)? model : (providerModels[0]||'')} onChange={(e)=>setModel(e.target.value)} className={`${win95.inset} ${win95.inputField} w-full text-sm`}>
                      {providerModels.length === 0 && (<option value="">(no models available)</option>)}
                      {providerModels.map(m => (<option key={m} value={m}>{m}</option>))}
                    </select>
                    <div className="text-[11px] opacity-70 mt-1">Choose a model suggested for this provider or type a custom id in Request Builder.</div>
                  </div>

                  <div className="mt-2">
                    <div className="mb-1 text-sm">Streaming</div>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={streaming} onChange={()=>setStreaming(!streaming)} /> Enable streaming by default for this provider</label>
                  </div>

                  {/* Keys compact */}
                  <div className="mt-3">
                    <div className="mb-1 text-sm">API Key</div>
                    <div className={`${win95.inset} p-2 bg-white text-black font-mono`}> 
                      {(() => {
                        const k = SecureKeyManager.getApiKey(activeProvider) || activeKey || '';
                        if (!k) return (<div className="text-xs opacity-70">No key saved for this provider.</div>);
                        const m = k.length > 12 ? `${k.slice(0,4)}••••••${k.slice(-4)}` : `••••••${k.slice(-4)}`;
                        return (
                          <div className="flex items-center justify-between gap-2">
                            <div className="truncate">{m}</div>
                            <div className="flex gap-1">
                              <button onClick={()=>{ navigator.clipboard.writeText(k); alert('API key copied'); }} className={`${win95.miniButton} ${win95.outset} text-xs`}>Copy</button>
                              <button onClick={()=>{ setActiveKey(k); alert('Loaded key into active input'); }} className={`${win95.miniButton} ${win95.outset} text-xs`}>Use</button>
                              <button onClick={()=>{ try{ SecureKeyManager.clearApiKey(activeProvider); setActiveKey(''); alert('Key cleared'); }catch{} }} className={`${win95.miniButton} ${win95.outset} text-xs`}>Clear</button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button onClick={()=>openKeyManager()} className={`${win95.button} ${win95.outset} text-sm flex-1`}>Manage Keys…</button>
                      <button onClick={()=>testProvider(activeProvider)} className={`${win95.button} ${win95.outset} text-sm`}>Test</button>
                    </div>
                  </div>

                  {/* Discourse Viewer Link (only when discourse provider active) */}
                  {activeProvider === 'discourse' && (
                    <div className="mt-4 text-xs">
                      <div className="font-semibold mb-1">Viewer</div>
                      <div className="mb-2 opacity-80 leading-snug">Browse Discourse in-place without leaving the Router console. Read‑only.</div>
                      <div className="flex gap-2">
                        <button onClick={()=>setShowDiscourseViewer(v=>!v)} className={`${win95.button} ${win95.outset} text-sm ${showDiscourseViewer?'':'bg-[#000080] text-white'} flex-1`}>{showDiscourseViewer ? 'Hide Viewer' : 'Show Viewer'}</button>
                        <button onClick={()=>{ window.location.href='/discourse'; }} className={`${win95.button} ${win95.outset} text-sm flex-1`}>Full Page…</button>
                      </div>
                    </div>
                  )}

                  {/* Endpoints (advanced)
                      keep as a quick list with Use action */}
                  {features.advanced && (
                    <div className="mt-3">
                      <div className="mb-1 text-sm">Known Routes</div>
                      <div className={`${win95.inset} p-2 bg-white text-xs`}> 
                        {providerRoutes[activeProvider]?.map(r => (
                          <div key={r.label} className="flex items-center justify-between mb-1">
                            <div className="truncate">{r.label} <span className="opacity-60">{r.path}</span></div>
                            <button onClick={()=>{ setApiBase(r.base); setPath(r.path); setMethod(r.method); setStreaming(!!r.streaming); }} className={`${win95.miniButton} ${win95.outset} text-xs`}>Use</button>
                          </div>
                        ))}
                        {!providerRoutes[activeProvider] && (<div className="text-xs opacity-70">No known routes for this provider.</div>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Center: Request Builder + AI Functions */}
            <div className={`col-span-12 md:col-span-6 ${win95.panel} ${win95.outset}`}>
              <div className={win95.title}>Request Builder</div>
              <div className={`${win95.inset} p-2 m-2`}>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <div>
                    <div className="mb-1 text-sm">Method</div>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className={`${win95.inset} ${win95.inputField} w-40 text-sm`}
                    >
                      <option>GET</option>
                      <option>POST</option>
                      <option>PUT</option>
                      <option>DELETE</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <div className="mb-1 text-sm">Path</div>
                    <input
                      type="text"
                      value={path}
                      onChange={(e) => setPath(e.target.value)}
                      className={`${win95.inset} ${win95.inputField} w-full font-mono text-sm`}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <div className="mb-1 text-sm">Headers</div>
                  <div className={`${win95.inset} h-16 p-1 font-mono text-xs overflow-auto bg-white text-black`}>
                    Authorization: Bearer &lt;key&gt;
                    <br />
                    Content-Type: application/json
                    {activeProvider === 'openrouter' && (
                      <>
                        <br />HTTP-Referer: {typeof window !== 'undefined' ? window.location.origin : ''}
                        <br />X-Title: Semantic Canvas
                      </>
                    )}
                    {activeProvider === 'openai' && (
                      <>
                        {sessionStorage.getItem('openai_org') && (
                          <>
                            <br />OpenAI-Organization: {sessionStorage.getItem('openai_org')}
                          </>
                        )}
                        {sessionStorage.getItem('openai_project') && (
                          <>
                            <br />OpenAI-Project: {sessionStorage.getItem('openai_project')}
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="mb-4">
                  <div className="mb-1 text-sm">Body</div>
                  <textarea
                    value={bodyContent}
                    onChange={(e) => setBodyContent(e.target.value)}
                    className={`${win95.inset} w-full h-32 p-2 font-mono text-xs resize-none bg-white text-black`}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={sendRequest}
                    className={`${win95.button} ${win95.outset} text-sm bg-[#000080] text-white hover:brightness-110`}
                  >
                    Send
                  </button>
                  <button onClick={savePreset} className={`${win95.button} ${win95.outset} text-sm`}>Save</button>
                  <button onClick={copyCurl} className={`${win95.button} ${win95.outset} text-sm`}>
                    Copy cURL
                  </button>
                  <button onClick={clearRequest} className={`${win95.button} ${win95.outset} text-sm`}>
                    Clear
                  </button>
                </div>
              </div>

              {/* Request Inspector */}
              <div className={`${win95.panel} ${win95.outset} m-2`}>
                <div className={win95.title}>Request Inspector</div>
                <div className={`${win95.inset} p-2 text-xs bg-white text-black font-mono overflow-auto`}>
                  <div><b>{method}</b> {apiBase}{path}</div>
                  <div className="mt-1">Headers:</div>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(sanitizeHeaders({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${activeKey}`,
                    ...(activeProvider === 'openrouter' ? { 'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '', 'X-Title': 'Semantic Canvas' } : {}),
                    ...(activeProvider === 'openai' ? {
                      ...(sessionStorage.getItem('openai_org') ? { 'OpenAI-Organization': sessionStorage.getItem('openai_org') } : {}),
                      ...(sessionStorage.getItem('openai_project') ? { 'OpenAI-Project': sessionStorage.getItem('openai_project') } : {}),
                    } : {}),
                  }), null, 2)}</pre>
                  {method !== 'GET' && (
                    <>
                      <div className="mt-1">Body:</div>
                      <pre className="whitespace-pre-wrap">{bodyContent}</pre>
                    </>
                  )}
                </div>
              </div>

              {/* AI Functions */}
              <div className={`${win95.panel} ${win95.outset} m-2`}>
                <div className={win95.title}>AI Functions</div>
                <div className={`${win95.inset} p-2`}>
                  <div className="flex gap-2 mb-2">
                    {[
                      ['text2wf','Text → Workflow'],
                      ['execute','Execute Workflow'],
                      ['enhance','Enhance Content'],
                    ].map(([id,label]) => (
                      <button key={id} onClick={()=>setAiTab(id)} className={`${win95.miniButton} ${win95.outset} text-xs ${aiTab===id?'bg-[#000080] text-white':''}`}>{label}</button>
                    ))}
                  </div>
                  {/* Config row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 text-sm">
                    <div>
                      <div className="mb-1">Model (suggested)</div>
                      <select value={providerModels.includes(model)? model : (providerModels[0]||'')} onChange={(e)=>setModel(e.target.value)} className={`${win95.inset} ${win95.inputField} w-full text-sm`}>
                        {providerModels.length === 0 && (<option value="">(none)</option>)}
                        {providerModels.map(m => (<option key={m} value={m}>{m}</option>))}
                      </select>
                    </div>
                    <div>
                      <div className="mb-1">Temperature</div>
                      <input type="number" step="0.1" min="0" max="2" value={aiTemp} onChange={(e)=>setAiTemp(Number(e.target.value))} className={`${win95.inset} ${win95.inputField} w-full text-sm`} />
                    </div>
                    <div>
                      <div className="mb-1">Max tokens</div>
                      <input type="number" min="128" step="64" value={aiMax} onChange={(e)=>setAiMax(Number(e.target.value))} className={`${win95.inset} ${win95.inputField} w-full text-sm`} />
                    </div>
                    {aiTab==='execute' && (
                      <div>
                        <div className="mb-1">Format</div>
                        <select value={aiExecFormat} onChange={(e)=>setAiExecFormat(e.target.value)} className={`${win95.inset} ${win95.inputField} w-full text-sm`}>
                          <option value="json">json</option>
                          <option value="markdown">markdown</option>
                          <option value="yaml">yaml</option>
                          <option value="xml">xml</option>
                        </select>
                      </div>
                    )}
                  </div>
                  {aiTab === 'text2wf' && (
                    <div className="grid grid-cols-3 gap-2 mb-2 text-sm">
                      <div>
                        <div className="mb-1">Include Ontology</div>
                        <label className="flex items-center gap-2"><input type="checkbox" checked={aiIncludeOntology} onChange={(e)=>setAiIncludeOntology(e.target.checked)} /> Attach ontology</label>
                      </div>
                      <div>
                        <div className="mb-1">Ontology Mode</div>
                        <select value={aiOntologyMode} onChange={(e)=>setAiOntologyMode(e.target.value)} className={`${win95.inset} ${win95.inputField} w-full text-sm`}>
                          <option value="force_framework">Force framework</option>
                          <option value="novel_category">Generate novel category</option>
                          <option value="exclude">Exclude ontology</option>
                        </select>
                      </div>
                      <div>
                        <div className="mb-1">Clusters (optional)</div>
                        <div className="p-2 border rounded bg-white text-xs">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold">Ontology selection</div>
                            <label className="text-[12px] flex items-center gap-1"><input type="checkbox" checked={aiSelectedClusters.length === Object.keys(ONTOLOGY_CLUSTERS).length} onChange={(e)=>aiSelectAllClusters(e.target.checked)} /> <span>Select all</span></label>
                          </div>
                          <div className="h-40 overflow-auto pr-1">
                            {Object.keys(ONTOLOGY_CLUSTERS).map(c => (
                              <label key={c} className="flex items-center gap-2 mb-1 text-[13px]">
                                <input type="checkbox" checked={aiSelectedClusters.includes(c)} onChange={()=>aiToggleCluster(c)} />
                                <span className="truncate">{c} — {ONTOLOGY_CLUSTERS[c].name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <div className="mb-1">Variant</div>
                          <select value={aiText2WfVariant} onChange={(e)=>setAiText2WfVariant(e.target.value)} className={`${win95.inset} ${win95.inputField} text-xs`}>
                            {Object.keys(text2wfVariants).map(v=> <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2 text-[11px] opacity-70 flex items-end">
                          {(text2wfVariants[aiText2WfVariant] || '').slice(0,160) || 'No instruction text.'}
                        </div>
                        <div className="col-span-3 mt-1">
                          <button onClick={()=>setPromptDialogFeature('text2wf')} className={`${win95.miniButton} ${win95.outset} text-xs`}>Edit Prompts…</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {features.advanced && (
                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <div className="mb-1">Custom model (optional)</div>
                        <input value={customModel} onChange={(e)=>setCustomModel(e.target.value)} placeholder="override model id" className={`${win95.inset} ${win95.inputField} w-full text-sm`} />
                      </div>
                      <div className="text-[11px] opacity-70 flex items-end">If set, custom model overrides suggested list.</div>
                    </div>
                  )}

                  {/* Body/Input: per tab */}
                  {aiTab === 'text2wf' && (
                    <div className="mb-2">
                      <div className="mb-1 text-sm">Input</div>
                      <textarea value={aiInput} onChange={(e)=>setAiInput(e.target.value)} className={`${win95.inset} w-full h-28 p-2 font-mono text-xs resize-none bg-white text-black`} />
                    </div>
                  )}
                  {aiTab === 'execute' && (
                    <div className="mb-2 text-xs opacity-80">
                      <div className="mb-1">Workflow</div>
                      <div className={`${win95.inset} p-2 bg-white`}>
                        <div>Title: <b>{aiWorkflowInfo.title || '—'}</b></div>
                        <div>Nodes: <b>{aiWorkflowInfo.nodes}</b> · Edges: <b>{aiWorkflowInfo.edges}</b></div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={loadWorkflowFromLocal} className={`${win95.button} ${win95.outset} text-sm`}>Refresh from Builder</button>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div>
                          <div className="mb-1">Variant</div>
                          <select value={aiExecuteVariant} onChange={(e)=>setAiExecuteVariant(e.target.value)} className={`${win95.inset} ${win95.inputField} text-xs`}>
                            {Object.keys(executeVariants).map(v=> <option key={v} value={v}>{v}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2 text-[11px] opacity-70 flex items-end">{(executeVariants[aiExecuteVariant]||'').slice(0,160) || 'No instruction text.'}</div>
                        <div className="col-span-3 mt-1">
                          <button onClick={()=>setPromptDialogFeature('execute')} className={`${win95.miniButton} ${win95.outset} text-xs`}>Edit Prompts…</button>
                        </div>
                      </div>
                    </div>
                  )}
                  {aiTab === 'enhance' && (
                    <div className="mb-2 text-xs">
                      <div className="mb-2 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="font-semibold text-[11px]">Mode:</label>
                          <label className="flex items-center gap-1 text-[11px]"><input type="radio" name="enhMode" value="node" checked={aiEnhanceMode==='node'} onChange={()=>setAiEnhanceMode('node')} /> Node Field</label>
                          <label className="flex items-center gap-1 text-[11px]"><input type="radio" name="enhMode" value="adhoc" checked={aiEnhanceMode==='adhoc'} onChange={()=>setAiEnhanceMode('adhoc')} /> Ad‑hoc Text</label>
                        </div>
                        {aiEnhanceMode==='node' && !aiWf && (
                          <button onClick={loadWorkflowFromLocal} className={`${win95.button} ${win95.outset} text-xs`}>Load workflow</button>
                        )}
                      </div>
                      {aiEnhanceMode==='node' && (
                        <>
                          <div className="mb-1">Select Node & Field</div>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <select value={selNodeId} onChange={(e)=>setSelNodeId(e.target.value)} className={`${win95.inset} ${win95.inputField} text-xs`}>
                              <option value="">— choose node —</option>
                              {(aiWf?.nodes||[]).map(n => (
                                <option key={n.id} value={n.id}>{(n.data?.label || n.id).slice(0,64)}</option>
                              ))}
                            </select>
                            <select value={selField} onChange={(e)=>setSelField(e.target.value)} className={`${win95.inset} ${win95.inputField} text-xs`} disabled={!selNodeId}>
                              <option value="">— choose field —</option>
                              {nodeFields.map(f => (<option key={f.name} value={f.name}>{f.name}</option>))}
                            </select>
                          </div>
                        </>
                      )}
                      {aiEnhanceMode==='adhoc' && (
                        <div className="mb-2">
                          <div className="mb-1">Ad‑hoc Text</div>
                          <textarea value={aiInput} onChange={(e)=>setAiInput(e.target.value)} className={`${win95.inset} w-full h-24 p-2 font-mono text-xs resize-none bg-white text-black`} />
                        </div>
                      )}
                      {/* (Removed duplicate node/field selectors in favor of mode-specific UI above) */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <div className="mb-1">Variant</div>
                          <select value={aiEnhancementType} onChange={(e)=>setAiEnhancementType(e.target.value)} className={`${win95.inset} ${win95.inputField} text-xs`}>
                            {Object.keys(enhancementVariants).map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                        </div>
                        <div className="text-[11px] opacity-70 flex items-end">
                          {enhancementVariants[aiEnhancementType] ? enhancementVariants[aiEnhancementType].slice(0,140) : 'No instruction text (uses default).'}
                        </div>
                        <div className="col-span-2 mt-1">
                          <button onClick={()=>setPromptDialogFeature('enhance')} className={`${win95.miniButton} ${win95.outset} text-xs`}>Edit Prompts…</button>
                        </div>
                      </div>
                      {aiEnhanceMode==='node' && (selNodeId && selField) && (
                        <div className="mt-2">
                          <div className="mb-1">Selected field value</div>
                          <div className={`${win95.inset} p-2 bg-white text-black max-h-28 overflow-auto font-mono`}>{String(selFieldValue || '—')}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mb-2">
                    {aiTab==='text2wf' && (
                      <button onClick={aiTextToWorkflow} disabled={aiRunning} className={`${win95.button} ${win95.outset} text-sm bg-[#000080] text-white`}>{aiRunning ? 'Running…' : 'Convert'}</button>
                    )}
                    {aiTab==='execute' && (
                      <button onClick={aiExecuteWorkflow} disabled={aiRunning} className={`${win95.button} ${win95.outset} text-sm bg-[#000080] text-white`}>{aiRunning ? 'Running…' : 'Execute'}</button>
                    )}
                    {aiTab==='enhance' && (
                      <>
                        <button onClick={aiEnhance} disabled={aiRunning} className={`${win95.button} ${win95.outset} text-sm bg-[#000080] text-white`}>{aiRunning ? 'Running…' : 'Enhance'}</button>
                        <button onClick={applyEnhancedToWorkflow} disabled={!aiOutput || !selNodeId || !selField || aiRunning} className={`${win95.button} ${win95.outset} text-sm`}>Apply to Workflow</button>
                      </>
                    )}
                    <button onClick={()=>setAiOutput('')} className={`${win95.button} ${win95.outset} text-sm`}>Clear</button>
                  </div>

                  <div className={`${win95.inset} p-2 bg-white text-black`}> 
                    <div className="text-xs mb-1">Output</div>
                    <pre className="whitespace-pre-wrap font-mono text-xs max-h-56 overflow-auto">{aiOutput || '—'}</pre>
                  </div>
                </div>
                  {/* Prompt templates editor */}
                  {/* Removed global Prompt Templates editor; customization is now contextual per tab */}
              </div>

              {/* Presets list */}
              {presets.length > 0 && (
                <div className={`${win95.panel} ${win95.outset} m-2`}>
                  <div className={win95.title}>Saved Requests</div>
                  <div className={`${win95.inset} p-2 text-xs bg-white text-black`}> 
                    <div className="space-y-1">
                      {presets.map((p) => (
                        <div key={p.name} className="flex items-center justify-between gap-2">
                          <div className="truncate">{p.name} <span className="opacity-60">({p.provider} {p.method} {p.path})</span></div>
                          <div className="flex gap-1">
                            <button onClick={() => loadPreset(p)} className={`${win95.miniButton} ${win95.outset} text-xs`}>Load</button>
                            <button onClick={() => deletePreset(p.name)} className={`${win95.miniButton} ${win95.outset} text-xs`}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Response */}
            <div className={`col-span-12 md:col-span-3 ${win95.panel} ${win95.outset}`}>
              <div className={win95.title}>Response</div>
              <div className={`${win95.inset} p-2 m-2`}>
                <div className="mb-4 text-sm">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="font-mono">{responseStatus || '200 OK'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <span className="font-mono">{responseTime || '182 ms'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tokens</span>
                    <span className="font-mono">in:{tokens.in || 8} out:{tokens.out || 10}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost</span>
                    <span className="font-mono">{cost}</span>
                  </div>
                </div>
                <div className={`${win95.inset} h-44 p-2 font-mono text-xs overflow-auto mb-2 bg-white text-black break-words`}>
                  {responseView === 'json' ? (
                    <pre className="whitespace-pre-wrap">{(() => { try { return JSON.stringify(JSON.parse(responseContent), null, 2); } catch { return responseContent; } })()}</pre>
                  ) : (
                    <pre className="whitespace-pre-wrap">{responseContent}</pre>
                  )}
                </div>
                <div className="flex gap-2 mb-2">
                  <button onClick={() => setResponseView('json')} className={`${win95.miniButton} ${win95.outset} text-xs`}>JSON</button>
                  <button onClick={() => setResponseView('text')} className={`${win95.miniButton} ${win95.outset} text-xs`}>Text</button>
                  <button onClick={() => {
                    const blob = new Blob([responseContent], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'response.json'; a.click();
                    URL.revokeObjectURL(url);
                  }} className={`${win95.miniButton} ${win95.outset} text-xs`}>Export Response</button>
                </div>
              </div>
              {/* Limits */}
              <div className={`${win95.panel} ${win95.outset} m-2`}>
                <div className={win95.title}>Limits</div>
                <div className={`${win95.inset} p-2 text-xs space-y-3`}>
                  <div className="flex justify-between items-center">
                    <span>Total calls</span><span className="font-mono">{history.length}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="mb-1">Tokens in</div>
                      <div className={`${win95.panel} ${win95.outset} w-full h-4`}>
                        <div className="bg-[#1084d0] h-full" style={{ width: `${Math.min(100, totalTokens.in / 2000 * 100)}%` }} />
                      </div>
                      <div className="text-[10px] opacity-70 mt-0.5">{totalTokens.in}</div>
                    </div>
                    <div>
                      <div className="mb-1">Tokens out</div>
                      <div className={`${win95.panel} ${win95.outset} w-full h-4`}>
                        <div className="bg-[#1084d0] h-full" style={{ width: `${Math.min(100, totalTokens.out / 4000 * 100)}%` }} />
                      </div>
                      <div className="text-[10px] opacity-70 mt-0.5">{totalTokens.out}</div>
                    </div>
                  </div>
                  {/* Gauge Board relocated here */}
                  <div className="mt-2">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <span>Gauge Board</span>
                      <span className="text-[10px] font-normal opacity-70">live session metrics</span>
                    </div>
                    <div className="flex justify-around mb-2">
                      {[
                        ['tps', gauge.tps, `${gauge.rawTPS.toFixed(2)} /s`],
                        ['latency', gauge.latency, `${gauge.avgLatency}ms`],
                        ['errors', gauge.errors, `${gauge.errorRate}%`],
                      ].map(([label, val, foot]) => (
                        <div key={label} className="flex flex-col items-center">
                          <div className={`${win95.panel} ${win95.outset} w-10 h-24 flex flex-col-reverse mb-1`}>
                            <div className={`bg-[#1084d0]`} style={{ height: `${Math.round((val||0)*100)}%`, width: '100%' }} />
                          </div>
                          <span className="text-[11px] leading-none">{label}</span>
                          <span className="text-[10px] opacity-70 mt-0.5">{foot}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-[10px] opacity-70">Session-local estimates; not provider-enforced quotas.</div>
                </div>
              </div>
            </div>

            {/* Embedded Discourse Viewer (when discourse provider selected) */}
            {activeProvider === 'discourse' && showDiscourseViewer && (
              <div className={`col-span-12 ${win95.panel} ${win95.outset}`}>
                <div className={win95.title}>Discourse Viewer (Embedded)</div>
                <div className={`${win95.inset} p-0 bg-[var(--w95-face)]`}> 
                  <div className="h-[640px] overflow-hidden">
                    <DiscourseViewer embedded />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom: History Carousel (Advanced) */}
            {features.advanced && (
              <div className={`col-span-12 ${win95.panel} ${win95.outset} relative`}>
                <div className={win95.title + ' flex items-center justify-between'}>
                  <span>API Call History · Carousel</span>
                  <div className="flex gap-2 items-center text-xs">
                    <button className={`${win95.miniButton} ${win95.outset}`} disabled={!history.length} onClick={() => setSelectedLogIndex(i => Math.max(0, i - 1))}>◀</button>
                    <span className="px-1">{history.length ? `${selectedLogIndex + 1}/${history.length}` : '0/0'}</span>
                    <button className={`${win95.miniButton} ${win95.outset}`} disabled={!history.length} onClick={() => setSelectedLogIndex(i => Math.min(history.length - 1, i + 1))}>▶</button>
                    <button className={`${win95.miniButton} ${win95.outset}`} onClick={exportHistory} disabled={!history.length}>Export</button>
                    <button className={`${win95.miniButton} ${win95.outset}`} onClick={clearHistory} disabled={!history.length}>Clear</button>
                    <button className={`${win95.miniButton} ${win95.outset}`} onClick={() => setShowCallDetails(v=>!v)} disabled={!history.length}>{showCallDetails ? 'Hide Details' : 'Show Details'}</button>
                  </div>
                </div>
                <div className={`${win95.inset} p-3 m-2 overflow-hidden`}> 
                  {history.length === 0 && (
                    <div className="text-xs opacity-70">No calls yet. Send a request to populate history.</div>
                  )}
                  {history.length > 0 && (
                    <div className="relative">
                      {/* Carousel Track */}
                      <div className="flex items-stretch justify-center gap-4 select-none">
                        {[-2,-1,0,1,2].map(offset => {
                          const idx = selectedLogIndex + offset;
                          if (idx < 0 || idx >= history.length) return <div key={offset} className="w-40" />;
                          const h = history[idx];
                          const isCenter = offset === 0;
                          return (
                            <div
                              key={offset}
                              className={`${win95.panel} ${win95.outset} ${isCenter ? 'w-64' : 'w-40'} cursor-pointer transition-all duration-150`}
                              style={{ opacity: isCenter ? 1 : 0.6, transform: isCenter ? 'scale(1.05)' : 'scale(0.92)' }}
                              onClick={() => setSelectedLogIndex(idx)}
                            >
                              <div className={win95.title + ' text-xs flex justify-between'}>
                                <span>{h.provider.toUpperCase()}</span>
                                <span>{h.status}</span>
                              </div>
                              <div className={`${win95.inset} p-1 text-[11px] h-32 overflow-hidden bg-white text-black`}> 
                                <div className="truncate"><span className="font-mono">{h.method}</span> {h.path || h.url.replace(h.base||'', '')}</div>
                                <div className="flex justify-between mt-1">
                                  <span>{h.ms}ms</span>
                                  <span className="font-mono">{h.model || ''}</span>
                                </div>
                                <div className="mt-1 line-clamp-4 whitespace-pre-wrap">{h.responsePreview}</div>
                                <div className="mt-1 text-[10px] opacity-70 flex justify-between"><span>{new Date(h.ts).toLocaleTimeString()}</span><span>{(h.tokens?.in||0)+(h.tokens?.out||0)} tok</span></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                {/* Details Sidebar */}
                {showCallDetails && history[selectedLogIndex] && (
                  <div className="absolute top-0 right-0 h-full w-[340px] bg-[#c0c0c0] border-l-2 border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d] shadow-lg flex flex-col">
                    <div className={win95.title + ' flex justify-between items-center'}>
                      <span>Call Details</span>
                      <button className={`${win95.miniButton} ${win95.outset}`} onClick={()=>setShowCallDetails(false)}>×</button>
                    </div>
                    <div className="p-2 overflow-auto text-xs space-y-2">
                      {(() => { const h = history[selectedLogIndex]; return (
                        <>
                          <div className="font-semibold">{h.method} {h.url}</div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>Status: <span className="font-mono">{h.status}</span></div>
                            <div>Time: <span className="font-mono">{h.ms}ms</span></div>
                            <div>Model: <span className="font-mono">{h.model||'-'}</span></div>
                            <div>Tokens: <span className="font-mono">{(h.tokens?.in||0)}/{(h.tokens?.out||0)}</span></div>
                          </div>
                          <details open>
                            <summary className="cursor-pointer">Request</summary>
                            <pre className="whitespace-pre-wrap bg-white text-black p-1 border-2 border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]">{JSON.stringify({ headers: h.headers, body: h.body }, null, 2)}</pre>
                          </details>
                          <details open>
                            <summary className="cursor-pointer">Response</summary>
                            <pre className="whitespace-pre-wrap bg-white text-black p-1 border-2 border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]">{h.responseRaw || h.responsePreview}</pre>
                          </details>
                        </>
                      ); })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Key Manager Modal */}
  {keyManagerOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className={`${win95.panel} ${win95.outset} w-full max-w-lg bg-[#c0c0c0]`}>
              <div className={win95.title}>Manage Provider Keys</div>
              <div className="p-3 space-y-3">
                {['openai','openrouter','venice','nous','morpheus'].map((pid) => (
                  <div key={pid} className={`${win95.panel} ${win95.outset}`}>
                    <div className={win95.title + ' text-xs'}>{pid.toUpperCase()}</div>
                    <div className={`${win95.inset} p-2`}>
                      <div className="flex gap-2">
                        <input
                          type={showKeyFields[pid] ? 'text' : 'password'}
                          value={keyInputs[pid] || ''}
                          onChange={(e) => setKeyInputs((prev) => ({ ...prev, [pid]: e.target.value }))}
                          placeholder={`Enter ${pid} API key`}
                          className={`${win95.inset} ${win95.inputField} flex-1 text-sm`}
                        />
                        <button onClick={() => setShowKeyFields((prev) => ({ ...prev, [pid]: !prev[pid] }))} className={`${win95.miniButton} ${win95.outset} text-xs`}>{showKeyFields[pid] ? 'Hide' : 'Show'}</button>
                        <button onClick={() => testProvider(pid)} className={`${win95.miniButton} ${win95.outset} text-xs`}>Test</button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setKeyManagerOpen(false)} className={`${win95.button} ${win95.outset} text-sm`}>Close</button>
                  <button onClick={saveAllKeys} className={`${win95.button} ${win95.outset} text-sm bg-[#000080] text-white`}>Save All</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Unified Prompt Configuration Dialog */}
        <PromptConfigDialog
          feature={promptDialogFeature}
          open={promptDialogOpen}
          onClose={()=>setPromptDialogFeature(null)}
          templates={promptTemplates}
          setTemplates={setPromptTemplates}
          activeVariant={
            promptDialogFeature==='text2wf' ? aiText2WfVariant : (
              promptDialogFeature==='execute' ? aiExecuteVariant : (
                promptDialogFeature==='enhance' ? aiEnhancementType : null))
          }
          setActiveVariant={(v)=>{
            if(promptDialogFeature==='text2wf') setAiText2WfVariant(v);
            else if(promptDialogFeature==='execute') setAiExecuteVariant(v);
            else if(promptDialogFeature==='enhance') setAiEnhancementType(v);
          }}
        />
      </div>
    </div>
  );
}
