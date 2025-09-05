import React, { useEffect, useState } from 'react';
import { exportWorkflow } from '@/lib/exportUtils';
import PromptingEngine from '@/lib/promptingEngine';
import { SecureKeyManager } from '@/lib/security';

const ui = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  win: { width: 980, maxWidth: '96vw', maxHeight: '94vh', background: '#C0C0C0', color: '#000', border: '2px solid #808080', boxShadow: '4px 4px 0 #000', display: 'grid', gridTemplateRows: '28px 28px 1fr 36px' },
  title: { height: 28, background: '#000080', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', fontWeight: 700 },
  menu: { height: 28, display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px', borderTop: '2px solid #fff', borderLeft: '2px solid #fff', borderRight: '2px solid #6d6d6d', borderBottom: '2px solid #6d6d6d', background: '#c0c0c0' },
  body: { padding: 8, display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' },
  panel: { background: '#fff', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', padding: 8, minHeight: 120, display: 'flex', flexDirection: 'column' },
  head: { background: '#000080', color: '#fff', padding: '4px 6px', fontWeight: 700, margin: '-8px -8px 8px -8px' },
  btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '6px 10px', cursor: 'pointer' },
  select: { padding: '4px 6px', border: '2px solid #808080', background: '#C0C0C0' },
  ta: { flex: 1, minHeight: 0, resize: 'none', width: '100%', padding: 8, border: '2px solid #808080', background: '#fff', color: '#000', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
  foot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderTop: '1px solid #808080', background: '#C0C0C0' },
  small: { fontSize: 12, opacity: 0.8 },
};

export default function WorkflowExecutionModal95({ workflow, trigger, onExecutionComplete }) {
  const [open, setOpen] = useState(false);
  const [outputFormat, setOutputFormat] = useState('json');
  const [structured, setStructured] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState('openai');
  const [model, setModel] = useState('gpt-4o');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1500);
  const [result, setResult] = useState(null);
  const [engine] = useState(() => new PromptingEngine('demo-user'));

  useEffect(() => {
    if (open && workflow) {
      try {
        const exp = exportWorkflow(workflow, outputFormat);
        setStructured(exp.content);
      } catch (e) {
        setStructured('Error formatting workflow');
      }
    }
  }, [open, workflow, outputFormat]);

  useEffect(() => {
    const load = async () => {
      const ps = await engine.getAvailableProviders();
      setProviders(ps);
      const active = ps.find(p => p.isActive) || ps[0];
      if (active) {
        setProviderId(active.providerId);
        setModel(active.models[0]);
      }
    };
    load();
  }, [engine]);

  const exec = async () => {
    if (!workflow || !workflow.nodes?.length) return;
    const apiKey = SecureKeyManager.getApiKey(providerId);
    if (!apiKey) { alert(`Missing API key for ${providerId}`); return; }
    setIsExecuting(true);
    setResult(null);
    try {
      const res = await engine.executeWorkflowWithFormat(workflow, outputFormat, {
        temperature, maxTokens, providerId, model, apiKey,
      });
      if (res.success) {
        setResult(res.execution);
        onExecutionComplete?.(res.execution);
      } else {
        alert(res.error || 'Execution failed');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <>
      {trigger ? (
        React.cloneElement(trigger, { onClick: () => setOpen(true) })
      ) : (
        <button style={ui.btn} onClick={() => setOpen(true)}>Execute…</button>
      )}
      {open && (
        <div style={ui.overlay} role="dialog" aria-modal="true">
          <div style={ui.win}>
            <div style={ui.title}>
              <span>Execute Workflow — Win95</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={ui.btn} onClick={() => setOpen(false)} aria-label="close">X</button>
              </div>
            </div>
            <div style={ui.menu}>
              <span>File</span>
              <span>Options</span>
              <span>Help</span>
              <span style={{ marginLeft: 'auto', ...ui.small }}>Nodes: {workflow?.nodes?.length || 0}</span>
            </div>
            <div style={ui.body}>
              <div style={ui.panel}>
                <div style={ui.head}>Configuration</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={{ display: 'grid', gap: 4 }}>
                    <span style={ui.small}>Output format</span>
                    <select value={outputFormat} onChange={(e)=>setOutputFormat(e.target.value)} style={ui.select}>
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                      <option value="yaml">YAML</option>
                      <option value="xml">XML</option>
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: 4 }}>
                    <span style={ui.small}>Provider</span>
                    <select value={providerId} onChange={(e)=>setProviderId(e.target.value)} style={ui.select}>
                      {providers.map(p => (<option key={p.providerId} value={p.providerId}>{p.name}</option>))}
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: 4 }}>
                    <span style={ui.small}>Model</span>
                    <select value={model} onChange={(e)=>setModel(e.target.value)} style={ui.select}>
                      {(providers.find(p=>p.providerId===providerId)?.models || []).map(m => (<option key={m} value={m}>{m}</option>))}
                    </select>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <label style={{ display: 'grid', gap: 4 }}>
                      <span style={ui.small}>Temperature: {temperature}</span>
                      <input type="range" min={0} max={1.5} step={0.1} value={temperature} onChange={(e)=>setTemperature(Number(e.target.value))} />
                    </label>
                    <label style={{ display: 'grid', gap: 4 }}>
                      <span style={ui.small}>Max Tokens: {maxTokens}</span>
                      <input type="range" min={256} max={4096} step={64} value={maxTokens} onChange={(e)=>setMaxTokens(Number(e.target.value))} />
                    </label>
                  </div>
                  <button onClick={exec} disabled={isExecuting || !workflow?.nodes?.length} style={{ ...ui.btn, marginTop: 4 }}>
                    {isExecuting ? 'Executing…' : `Execute as ${outputFormat.toUpperCase()}`}
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={ui.panel}>
                  <div style={ui.head}>Structured Workflow ({outputFormat.toUpperCase()})</div>
                  <textarea readOnly value={structured} style={ui.ta} />
                </div>
                {result && (
                  <div style={ui.panel}>
                    <div style={ui.head}>Execution Result</div>
                    <textarea readOnly value={result.result} style={ui.ta} />
                    <div style={{ ...ui.small, marginTop: 6 }}>Provider: {result.provider} • Model: {result.model} • {new Date(result.executedAt).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
            <div style={ui.foot}>
              <span style={ui.small}>Pro tip: Export the workflow before execution for reproducibility.</span>
              <div>
                <button style={ui.btn} onClick={() => setOpen(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
