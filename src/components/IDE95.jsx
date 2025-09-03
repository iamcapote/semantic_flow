import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Win95++ tokens
const colors = {
  desk: '#008080',
  face: '#C0C0C0',
  title: '#000080',
  sunken: '#FFFFFF',
  text: '#000000',
};

const bevel = {
  outset: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000',
  inset: 'inset 1px 1px 0 #FFF, inset -1px -1px 0 #000',
};

const ui = {
  desktop: { background: colors.desk, height: '100vh', width: '100%', padding: 16, boxSizing: 'border-box' },
  window: { background: colors.face, color: colors.text, height: '100%', display: 'grid', gridTemplateRows: '28px 24px 1fr 28px', border: '1px solid #000', boxShadow: '2px 2px 0 #000' },
  titleBar: { background: colors.title, color: '#fff', display: 'flex', alignItems: 'center', padding: '4px 8px', fontWeight: 700, borderBottom: '1px solid #000' },
  menuBar: { background: colors.face, display: 'flex', gap: 16, padding: '3px 8px', borderBottom: '1px solid #808080', boxShadow: bevel.outset },
  menui: { cursor: 'default', fontSize: 12 },
  client: { display: 'grid', gridTemplateRows: '1fr 200px', gap: 8, padding: 8 },
  topRow: { display: 'grid', gridTemplateColumns: '48px 280px 1fr 190px', gap: 8, minHeight: 0 },
  // panels
  activity: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 4 },
  sidePanel: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'grid', gridTemplateRows: '22px 1fr', minHeight: 0 },
  panelTitle: { background: colors.title, color: '#fff', fontSize: 12, padding: '2px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  panelBody: { background: colors.sunken, borderTop: '1px solid #000', boxShadow: bevel.inset, padding: 6, overflow: 'auto' },
  editor: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'grid', gridTemplateRows: '24px 1fr', minHeight: 0 },
  tabs: { background: colors.face, display: 'flex', gap: 6, alignItems: 'center', padding: '2px 4px', borderBottom: '1px solid #808080', boxShadow: bevel.outset },
  tab: (active) => ({ background: active ? colors.sunken : colors.face, border: '1px solid #000', boxShadow: active ? bevel.inset : bevel.outset, padding: '1px 8px', fontSize: 12, cursor: 'pointer' }),
  editorBody: { display: 'grid', gridTemplateColumns: 'auto 1fr 8px', minHeight: 0 },
  gutter: { width: 44, background: '#E6E6E6', borderRight: '1px solid #000', boxShadow: bevel.inset, paddingTop: 8, paddingBottom: 8, overflow: 'hidden' },
  code: { background: '#012456', color: '#E6E6E6', minHeight: 0, overflow: 'auto', border: '1px solid #000' },
  minimap: { width: 8, background: colors.face, borderLeft: '1px solid #000', boxShadow: bevel.outset },
  outline: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'grid', gridTemplateRows: '22px 1fr' },
  bottom: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'grid', gridTemplateRows: '22px 1fr' },
  bottomTabs: { display: 'flex', gap: 8, alignItems: 'center', padding: '2px 6px', borderBottom: '1px solid #808080', boxShadow: bevel.outset },
  bottomTab: (active) => ({ background: active ? colors.sunken : colors.face, border: '1px solid #000', boxShadow: active ? bevel.inset : bevel.outset, padding: '1px 8px', fontSize: 12, cursor: 'pointer' }),
  terminal: { background: '#011B3A', color: '#E6E6E6', padding: 8, fontFamily: 'Consolas, "Lucida Console", monospace', fontSize: 12, overflow: 'auto' },
  statusBar: { background: colors.face, display: 'flex', alignItems: 'center', gap: 16, padding: '4px 8px', borderTop: '1px solid #808080', boxShadow: bevel.outset },
  button: { background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, padding: '2px 10px', cursor: 'pointer', fontSize: 12 },
  input: { background: colors.sunken, border: '1px solid #000', boxShadow: bevel.inset, padding: '4px 6px', fontSize: 12 },
  // floating Command Palette
  palette: { position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', width: 520, background: colors.face, border: '1px solid #000', boxShadow: '4px 4px 0 #000', display: 'grid', gridTemplateRows: '22px 28px 1fr' },
};

function toDSL(workflow) {
  const nodes = (workflow?.nodes || []).map((n) => {
    const label = n?.data?.label || n?.data?.metadata?.label || n?.id;
    const type = n?.data?.type || n?.type || 'node';
    return `${n.id} ${type} "${String(label).replace(/\"/g, '"')}"`;
  });
  const edges = (workflow?.edges || []).map(e => `${e.source} -> ${e.target}`);
  return ['# nodes', ...nodes, '', '# edges', ...edges].join('\n');
}

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

  const refresh = useCallback(() => {
    try {
      const saved = localStorage.getItem('current-workflow');
      const obj = saved ? JSON.parse(saved) : { nodes: [], edges: [], metadata: { title: 'Untitled Workflow' } };
      setWf(obj);
      setJson(JSON.stringify(obj, null, 2));
      setDsl(toDSL(obj));
      setJsonError('');
    } catch (e) {
      setWf({ nodes: [], edges: [] });
      setJson('{}');
      setDsl('');
      setJsonError(String(e.message || e));
    }
  }, []);

  const applyToBuilder = useCallback(() => {
    try {
      const obj = JSON.parse(json);
      localStorage.setItem('current-workflow', JSON.stringify(obj));
      window.dispatchEvent(new CustomEvent('workflow:updated', { detail: { source: 'IDE95', workflow: obj } }));
      setWf(obj);
      setDsl(toDSL(obj));
      setJsonError('');
    } catch (e) {
      setJsonError('Invalid JSON: ' + (e.message || String(e)));
    }
  }, [json]);

  const copy = async (text) => { try { await navigator.clipboard.writeText(text); } catch {} };

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const handler = () => {
      try {
        const saved = localStorage.getItem('current-workflow');
        const obj = saved ? JSON.parse(saved) : null;
        if (obj) {
          setWf(obj);
          setDsl(toDSL(obj));
        }
      } catch {}
    };
    window.addEventListener('workflow:updated', handler);
    return () => window.removeEventListener('workflow:updated', handler);
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

  return (
    <div style={ui.desktop}>
      <div style={ui.window}>
        {/* Title Bar */}
        <div style={ui.titleBar}>
          <span>BITCORE IDE — Win95++</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <div style={{ ...ui.button, width: 18, textAlign: 'center' }}>_</div>
            <div style={{ ...ui.button, width: 18, textAlign: 'center' }}>□</div>
            <div style={{ ...ui.button, width: 18, textAlign: 'center' }}>×</div>
          </div>
        </div>

        {/* Menu Bar */}
        <div style={ui.menuBar}>
          {['File','Edit','View','Go','Run','Terminal','Help'].map((m) => (
            <span key={m} style={ui.menui}>{m}</span>
          ))}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <button style={ui.button} onClick={refresh}>Sync Builder</button>
            <button style={ui.button} onClick={() => copy(json)}>Copy JSON</button>
            <button style={ui.button} onClick={() => copy(dsl)}>Copy DSL</button>
            <button style={ui.button} onClick={applyToBuilder}>Apply → Builder</button>
          </div>
        </div>

        {/* Client area */}
        <div style={ui.client}>
          {/* Top Row: Activity | Explorer+Search | Editor | Outline */}
          <div style={ui.topRow}>
            {/* Activity */}
            <div style={ui.activity}>
              {['E','S','G','D','X'].map((c, i) => (
                <div key={i} style={{ width: 34, height: 34, margin: 4, background: colors.face, border: '1px solid #000', boxShadow: bevel.outset, display: 'grid', placeItems: 'center', fontWeight: 700 }}>{c}</div>
              ))}
            </div>

            {/* Left: Explorer + Search stacked */}
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8, minHeight: 0 }}>
              <div style={ui.sidePanel}>
                <div style={ui.panelTitle}>Explorer</div>
                <div style={ui.panelBody}>
                  <div style={{ fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 10, display: 'inline-block' }}>▶</span>
                      <strong>workspace</strong>
                    </div>
                    <div style={{ paddingLeft: 18, marginTop: 6 }}>
                      <div>src/</div>
                      <div style={{ paddingLeft: 12, opacity: 0.9 }}>main.jsx</div>
                      <div style={{ paddingLeft: 12, opacity: 0.9 }}>App.jsx</div>
                      <div>server/</div>
                      <div style={{ paddingLeft: 12, opacity: 0.9 }}>app.js</div>
                      <div>README.md</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={ui.sidePanel}>
                <div style={ui.panelTitle}>Search</div>
                <div style={ui.panelBody}>
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

            {/* Editor */}
            <div style={ui.editor}>
              {/* Tabs */}
              <div style={ui.tabs}>
                {['workflow.json','workflow.dsl','preview'].map((t) => (
                  <div key={t} style={ui.tab(activeTab === t)} onClick={() => setActiveTab(t)}>{t}</div>
                ))}
              </div>

              {/* Code area */}
              <div style={ui.editorBody}>
                <div style={ui.gutter}>
                  {[...Array(200)].map((_, i) => (
                    <div key={i} style={{ textAlign: 'right', paddingRight: 6, fontSize: 11 }}>{i + 1}</div>
                  ))}
                </div>
                <div style={ui.code}>
                  {activeTab === 'workflow.json' && (
                    <textarea
                      value={json}
                      onChange={(e)=>setJson(e.target.value)}
                      spellCheck={false}
                      style={{ width: '100%', height: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', padding: 8, background: 'transparent', color: '#E6E6E6', fontFamily: 'Consolas, "Lucida Console", monospace', fontSize: 12 }}
                    />
                  )}
                  {activeTab === 'workflow.dsl' && (
                    <textarea
                      value={dsl}
                      readOnly
                      spellCheck={false}
                      style={{ width: '100%', height: '100%', boxSizing: 'border-box', border: 'none', outline: 'none', padding: 8, background: 'transparent', color: '#E6E6E6', fontFamily: 'Consolas, "Lucida Console", monospace', fontSize: 12 }}
                    />
                  )}
                  {activeTab === 'preview' && (
                    <div style={{ height: '100%', overflow: 'auto' }}>
                      <SyntaxHighlighter language="json" style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent' }}>
                        {json}
                      </SyntaxHighlighter>
                    </div>
                  )}
                  {jsonError && (
                    <div style={{ position: 'absolute', right: 12, bottom: 12, color: '#FF8080', background: '#400', padding: '4px 6px', border: '1px solid #800', boxShadow: '2px 2px 0 #000', fontSize: 12 }}>Error: {jsonError}</div>
                  )}
                </div>
                <div style={ui.minimap} />
              </div>
            </div>

            {/* Outline */}
            <div style={ui.outline}>
              <div style={ui.panelTitle}>Outline</div>
              <div style={{ ...ui.panelBody, fontSize: 12 }}>
                <div>nodes()</div>
                <div>edges()</div>
                <div>metadata()</div>
              </div>
            </div>
          </div>

          {/* Bottom panel */}
          <div style={ui.bottom}>
            <div style={ui.bottomTabs}>
              {['terminal','problems','output'].map((t) => (
                <div key={t} style={ui.bottomTab(bottomTab === t)} onClick={() => setBottomTab(t)}>{t[0].toUpperCase()+t.slice(1)}</div>
              ))}
            </div>
            <div style={{ background: colors.sunken, borderTop: '1px solid #000', boxShadow: bevel.inset, minHeight: 0, overflow: 'auto' }}>
              {bottomTab === 'terminal' && (
                <pre id="ide95-terminal" style={ui.terminal}>
PS C:\\semantic_flow&gt; npm run build
Build succeeded.
0 Warning(s)   0 Error(s)
                </pre>
              )}
              {bottomTab === 'problems' && (
                <div style={{ padding: 8, fontSize: 12 }}>No problems detected.</div>
              )}
              {bottomTab === 'output' && (
                <div style={{ padding: 8, fontSize: 12 }}>Ready.</div>
              )}
            </div>
          </div>
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
