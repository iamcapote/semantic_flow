import React, { useEffect, useState } from 'react';
import PromptingEngine from '@/lib/promptingEngine';
import { getPromptDefaults, publishPromptDefaults } from '@/lib/aiRouter';
import { SecureKeyManager } from '@/lib/security';

const ui = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  win: { width: 900, maxWidth: '96vw', maxHeight: '94vh', background: '#C0C0C0', color: '#000', border: '2px solid #808080', boxShadow: '4px 4px 0 #000', display: 'grid', gridTemplateRows: '28px 24px 1fr 36px' },
  title: { height: 28, background: '#000080', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', fontWeight: 700 },
  menu: { height: 24, display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px', borderTop: '2px solid #fff', borderLeft: '2px solid #fff', borderRight: '2px solid #6d6d6d', borderBottom: '2px solid #6d6d6d', background: '#c0c0c0' },
  body: { padding: 8, display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' },
  panel: { background: '#fff', border: '2px solid #808080', boxShadow: '2px 2px 0 #000', padding: 8, minHeight: 120, display: 'flex', flexDirection: 'column' },
  head: { background: '#000080', color: '#fff', padding: '4px 6px', fontWeight: 700, margin: '-8px -8px 8px -8px' },
  btn: { background: '#C0C0C0', border: '1px solid #808080', boxShadow: 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000', padding: '6px 10px', cursor: 'pointer' },
  select: { padding: '4px 6px', border: '2px solid #808080', background: '#C0C0C0' },
  ta: { flex: 1, minHeight: 0, resize: 'none', width: '100%', padding: 8, border: '2px solid #808080', background: '#fff', color: '#000', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 },
  foot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8, borderTop: '1px solid #808080', background: '#C0C0C0' },
  small: { fontSize: 12, opacity: 0.8 },
};

export default function NodeEnhancementModal95({ node, onNodeUpdate, trigger }) {
  const [open, setOpen] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementType, setEnhancementType] = useState('improve');
  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState('openai');
  const [model, setModel] = useState('gpt-4o-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(800);
  const [result, setResult] = useState(null);
  // When node content is empty, allow manual input
  const [manualInput, setManualInput] = useState('');
  const [engine] = useState(() => new PromptingEngine('demo-user'));
  const [prompts, setPrompts] = useState(()=>getPromptDefaults());
  const variantMap = prompts?.enhance?.variants || {};
  const core = ['improve','optimize','refactor','enhance','simplify','elaborate'];
  const allVariants = [...new Set([...core, ...Object.keys(variantMap)])];
  const [addingVariant, setAddingVariant] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newText, setNewText] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const ps = await engine.getAvailableProviders();
        setProviders(ps);
        const storedId = sessionStorage.getItem('active_provider');
        const active = ps.find(p => p.providerId === storedId) || ps.find(p => p.isActive) || ps[0];
        if (active) {
          setProviderId(active.providerId);
          // Prefer smaller/cheaper models for enhancement
          const rec = engine.getRecommendedModels('node-enhancement');
          const m = active.models.find(x => rec.includes(x)) || active.models[0];
          setModel(m);
        }
      } catch (e) {
        // ignore
      }
    };
    load();
  }, [engine]);

  const enhance = async () => {
    if (!node) { alert('No node selected.'); return; }
    const apiKey = SecureKeyManager.getApiKey(providerId);
    if (!apiKey) { alert(`Missing API key for ${providerId}. Configure it in settings.`); return; }
    setIsEnhancing(true);
    setResult(null);
    try {
      // Build a temporary node if no content is present
      const target = node?.data?.content
        ? node
        : { ...node, data: { ...(node.data||{}), content: manualInput || '' } };
      if (!target.data.content || !target.data.content.trim()) {
        alert('Enter some text to enhance.');
        setIsEnhancing(false);
        return;
      }
      const res = await engine.enhanceNode(target, enhancementType, {
        temperature, maxTokens, providerId, model, apiKey,
      });
      if (res.success) {
        setResult(res.enhancement);
      } else {
        alert(res.error || 'Enhancement failed');
      }
    } catch (e) {
      alert(e.message || 'Enhancement failed');
    } finally {
      setIsEnhancing(false);
    }
  };

  const apply = () => {
    if (!result) return;
    const updated = {
      ...node,
      data: { ...(node?.data || {}), content: result.enhancedContent }
    };
    onNodeUpdate?.(updated);
    setOpen(false);
  };

  return (
    <>
      {trigger ? (
        React.cloneElement(trigger, { onClick: () => setOpen(true) })
      ) : (
        <button style={ui.btn} onClick={() => setOpen(true)}>Enhance…</button>
      )}
      {open && (
        <div style={ui.overlay} role="dialog" aria-modal="true">
          <div style={ui.win}>
            <div style={ui.title}>
              <span>Enhance Node — Win95</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button style={ui.btn} onClick={() => setOpen(false)} aria-label="close">X</button>
              </div>
            </div>
            <div style={ui.menu}>
              <span>Options</span>
              <span>Help</span>
              <span style={{ marginLeft: 'auto', ...ui.small }}>{node?.data?.label || node?.id || 'Node'} • {node?.data?.type || node?.type}</span>
            </div>
            <div style={ui.body}>
              <div style={ui.panel}>
                <div style={ui.head}>Configuration</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  <label style={{ display: 'grid', gap: 4 }}>
                    <span style={ui.small}>Enhancement type</span>
                    <select value={enhancementType} onChange={(e)=>setEnhancementType(e.target.value)} style={ui.select}>
                      {allVariants.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="__new">+ new variant…</option>
                    </select>
                  </label>
                  {enhancementType==='__new' && (
                    <div style={{ display:'grid', gap:4, border:'1px dashed #808080', padding:6 }}>
                      <input style={ui.select} placeholder="variant key" value={newKey} onChange={e=>setNewKey(e.target.value)} />
                      <textarea style={ui.ta} placeholder="Instruction text" value={newText} onChange={e=>setNewText(e.target.value)} />
                      <div style={{ display:'flex', gap:6 }}>
                        <button style={ui.btn} onClick={()=>{
                          const key = (newKey||'').trim().toLowerCase();
                          if(!key.match(/^[a-z0-9_-]{3,32}$/)){ alert('Invalid key'); return; }
                          if(!newText.trim()){ alert('Enter instruction text'); return; }
                          const next = { ...prompts, enhance: { ...(prompts.enhance||{}), variants: { ...(prompts.enhance?.variants||{}), [key]: newText } } };
                          setPrompts(next); publishPromptDefaults(next); setEnhancementType(key); setNewKey(''); setNewText('');
                        }}>Save</button>
                        <button style={ui.btn} onClick={()=>{ setEnhancementType('improve'); setNewKey(''); setNewText(''); }}>Cancel</button>
                      </div>
                    </div>
                  )}
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
                      <span style={ui.small}>Creativity: {temperature}</span>
                      <input type="range" min={0} max={1.5} step={0.1} value={temperature} onChange={(e)=>setTemperature(Number(e.target.value))} />
                    </label>
                    <label style={{ display: 'grid', gap: 4 }}>
                      <span style={ui.small}>Max Tokens: {maxTokens}</span>
                      <input type="range" min={128} max={4096} step={64} value={maxTokens} onChange={(e)=>setMaxTokens(Number(e.target.value))} />
                    </label>
                  </div>
                  <button onClick={enhance} disabled={isEnhancing || (!node?.data?.content && !(manualInput && manualInput.trim()))} style={{ ...ui.btn, marginTop: 4 }}>
                    {isEnhancing ? 'Enhancing…' : 'Enhance'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={ui.panel}>
                  <div style={ui.head}>Current Content</div>
                  {node?.data?.content ? (
                    <textarea readOnly value={node.data.content} style={ui.ta} />
                  ) : (
                    <>
                      <div style={{ marginBottom: 6, ...ui.small }}>This node has no content. Enter text to enhance:</div>
                      <textarea value={manualInput} onChange={(e)=>setManualInput(e.target.value)} placeholder="Type text to enhance…" style={ui.ta} />
                    </>
                  )}
                </div>
                {result && (
                  <div style={ui.panel}>
                    <div style={ui.head}>Enhanced Content</div>
                    <textarea readOnly value={result.enhancedContent} style={ui.ta} />
                    <div style={{ ...ui.small, marginTop: 6 }}>Provider: {result.provider} • Model: {result.model} • {new Date(result.enhancedAt).toLocaleString()}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button style={ui.btn} onClick={apply}>Apply to Node</button>
                      <button style={ui.btn} onClick={()=>setResult(null)}>Reset</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={ui.foot}>
              <span style={ui.small}>Tip: Use smaller models for faster, cheaper enhancements.</span>
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
