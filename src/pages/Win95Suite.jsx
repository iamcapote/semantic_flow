// @ts-nocheck
// WinGPT 95 — Unified Suite (Builder, IDE, Router, Console, Chat)
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Builder95 from '@/components/Builder95';
import SemanticFlowBuilder from '@/components/SemanticFlowBuilder';
import IDE95 from '@/components/IDE95';
import Console95 from '@/components/Console95';
import APIConsolePage from './APIConsolePage';
import TopNav95Plus from '@/components/TopNav95Plus';

function uid() { return Math.random().toString(36).slice(2); }

function Win95Chat({ embedded = false }) {
  const [msgs, setMsgs] = useState([
    { id: uid(), role: 'system', text: 'WinGPT 95 booted.' },
    { id: uid(), role: 'assistant', text: 'Hello. Ask anything.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState('gpt-4o-mini');
  const [temp, setTemp] = useState(0.2);
  const viewRef = useRef(null);

  useEffect(() => { viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs, busy]);

  async function respond(prompt) {
    setBusy(true);
    const base = `You said: ${prompt}`;
    const tokens = base.split(' ');
    const id = uid();
    let acc = '';
    setMsgs((m) => [...m, { id, role: 'assistant', text: '' }]);
    for (const t of tokens) {
      await new Promise((r) => setTimeout(r, 18));
      acc += (acc ? ' ' : '') + t;
      setMsgs((m) => m.map((x) => (x.id === id ? { ...x, text: acc } : x)));
    }
    setBusy(false);
  }

  function onSend() {
    const v = input.trim();
    if (!v || busy) return;
    setMsgs((m) => [...m, { id: uid(), role: 'user', text: v }]);
    setInput('');
    respond(v);
  }

  function onKey(e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onSend(); } }

  const bevel = { out: 'border-t-white border-l-white border-b-[#6d6d6d] border-r-[#6d6d6d]', in: 'border-t-[#6d6d6d] border-l-[#6d6d6d] border-b-white border-r-white' };
  const containerStyle = embedded ? { height: '100%', width: '100%' } : { minHeight: '100vh', width: '100%' };

  return (
    <div className="w-full flex items-center justify-center p-4" style={{ background: '#008080', ...containerStyle }}>
      <div className={`w-full max-w-4xl select-none shadow-2xl ${bevel.out} border-2`} role="application" aria-label="WinGPT 95" style={{ background: '#c0c0c0', color: '#000' }}>
        <div className="h-8 flex items-center justify-between px-2 text-white" style={{ background: '#000080' }}>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white" />
            <div className="font-semibold" style={{ fontFamily: 'Tahoma, "MS Sans Serif", system-ui' }}>WinGPT 95</div>
          </div>
          <div className="flex items-center gap-1">
            <button className={`h-6 w-9 grid place-items-center bg-[#c0c0c0] text-black ${bevel.out} border-2`} aria-label="Minimize">[ _ ]</button>
            <button className={`h-6 w-9 grid place-items-center bg-[#c0c0c0] text-black ${bevel.out} border-2`} aria-label="Maximize">[ □ ]</button>
            <button className={`h-6 w-9 grid place-items-center bg-[#c0c0c0] text-black ${bevel.out} border-2`} aria-label="Close">[ X ]</button>
          </div>
        </div>
  {/* Decorative menu removed on non-landing pages to avoid overlapping nav */}
        <div className="grid grid-rows-[1fr_auto] gap-2 p-2 bg-[#c0c0c0]" style={{ height: embedded ? 'calc(100% - 3.5rem)' : undefined }}>
          <div className={`h-[52vh] md:h-[58vh] overflow-auto bg-[#ffffff] ${bevel.in} border-2`} ref={viewRef}>
            <div className="font-mono text-sm leading-6 p-3">
              {msgs.map((m) => (
                <div key={m.id} className="whitespace-pre-wrap"><span className="text-[#00008b] mr-2">{m.role === 'user' ? 'C>' : m.role === 'assistant' ? 'A>' : 'S>'}</span><span>{m.text}</span></div>
              ))}
              {busy && (
                <div className="whitespace-pre"><span className="text-[#00008b] mr-2">A&gt;</span><span className="animate-pulse">▪</span></div>
              )}
            </div>
          </div>
          <div className={`p-2 bg-[#c0c0c0] ${bevel.in} border-2`}>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs mb-1">Prompt</label>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKey} rows={3} className={`w-full resize-y bg-[#ffffff] text-black px-2 py-1 outline-none ${bevel.in} border-2 font-mono`} aria-label="Prompt input" />
                <div className="mt-1 text-[10px] opacity-80">Ctrl+Enter to send</div>
              </div>
              <div className="w-56">
                <label className="block text-xs mb-1">Settings</label>
                <div className={`p-2 bg-[#c0c0c0] ${bevel.out} border-2 space-y-2`}>
                  <div>
                    <div className="text-xs mb-1">Model</div>
                    <div className={`bg-white ${bevel.in} border-2 h-8 flex items-center px-2`}>
                      <select className="w-full bg-transparent outline-none" value={model} onChange={(e) => setModel(e.target.value)} aria-label="Model">
                        {['gpt-4o-mini','gpt-4o','local-llm'].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs mb-1">{`Temp ${temp.toFixed(1)}`}</div>
                    <div className={`bg-[#c0c0c0] ${bevel.out} border-2 p-2`}>
                      <input type="range" min={0} max={1} step={0.1} value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} className="w-full" aria-label="Temperature" />
                    </div>
                  </div>
                  <button onClick={onSend} disabled={busy} className={`w-full h-8 bg-[#c0c0c0] ${bevel.out} border-2 disabled:opacity-50`} aria-label="Send">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`h-7 bg-[#c0c0c0] px-2 flex items-center justify-between border-t-2`}>
          <div className="text-xs">{busy ? 'Thinking' : 'Ready'}</div>
          <div className="text-xs">Msgs: {msgs.length}</div>
        </div>
      </div>
    </div>
  );
}

export default function Win95Suite({ initialTab }) {
  const [tab, setTab] = useState(initialTab || 'builder'); // builder | ide | console | chat | api
  const navigate = useNavigate();

  useEffect(() => {
    if (initialTab && initialTab !== tab) setTab(initialTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab]);
  
  // Ensure tab reflects route changes

  const tabBtn = (t, label) => (
    <button
      onClick={() => setTab(t)}
      style={{
        padding: '4px 10px',
        border: '2px solid #808080',
        boxShadow: tab === t ? 'inset 1px 1px 0 #000, inset -1px -1px 0 #fff' : 'inset -1px -1px 0 #FFF, inset 1px 1px 0 #000',
        background: tab === t ? '#E6E6E6' : '#C0C0C0',
        cursor: 'pointer'
      }}
    >{label}</button>
  );

  const sections = [
    { id: 'builder', label: 'Builder', href: '/builder' },
    { id: 'ide', label: 'IDE', href: '/ide' },
    { id: 'api', label: 'Router', href: '/api' },
    { id: 'console', label: 'Console', href: '/console' },
    { id: 'chat', label: 'Chat', href: '/chat' },
  { id: 'learn', label: 'Learn', href: '/learn' },
  ];

  const onSelectTab = (id) => {
    setTab(id);
    const target = sections.find((s) => s.id === id);
    if (target?.href) navigate(target.href);
  };
  
  return (
    <div className="win95-suite-container" style={{ 
      height: '100vh', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top navigation (single source of truth) */}
      <TopNav95Plus
        appTitle="Semantic Flow — Win95 Suite"
        iconSrc="/logo.svg"
        sections={sections}
        activeId={tab}
        onSelect={onSelectTab}
      />
      
      <div 
        className="content-area"
        style={{ 
          minHeight: 0, 
          position: 'relative',
          zIndex: 995,
          overflow: 'auto'
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          {tab === 'builder' && (
            <div style={{ height: '100%' }}>
              <SemanticFlowBuilder />
            </div>
          )}
          {tab === 'ide' && (<IDE95 />)}
          {tab === 'console' && (<Console95 />)}
          {tab === 'api' && (
            <div style={{ height: '100%', overflow: 'auto' }}>
              <APIConsolePage />
            </div>
          )}
          {tab === 'chat' && <Win95Chat embedded />}
        </div>
      </div>
    </div>
  );
}
