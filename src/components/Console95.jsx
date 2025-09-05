import React, { useEffect, useRef, useState } from 'react';
import WorkflowExecutionEngine from '@/lib/WorkflowExecutionEngine';

// PowerShell++ brand tokens
const brand = {
  desk: '#008080',
  chrome: '#C0C0C0',
  title: '#000080',
  viewport: '#012456',
  inputBg: '#011B3A',
  mono: "Consolas, 'Lucida Console', 'JetBrains Mono', monospace",
  accent: '#00D7FF', // cyan
  warn: '#FFD700',   // gold
  ok: '#00FF00',     // green
  err: '#FF5959',    // red
};

function Bevel({ children, style, inset = false }) {
  const common = {
    borderStyle: 'solid',
    borderWidth: 2,
    borderTopColor: inset ? '#6d6d6d' : '#ffffff',
    borderLeftColor: inset ? '#6d6d6d' : '#ffffff',
    borderBottomColor: inset ? '#ffffff' : '#6d6d6d',
    borderRightColor: inset ? '#ffffff' : '#6d6d6d',
  };
  return (
    <div style={{ ...common, ...style }}>
      {children}
    </div>
  );
}

export default function Console95() {
  // line items: { kind: 'plain'|'ok'|'err'|'cmd', text: string }
  // Added under-construction placeholder banner lines.
  const [lines, setLines] = useState([
    { kind: 'ok', text: 'Console tab under construction – expect limited functionality.' },
    { kind: 'ok', text: 'Planned: interactive workflow scripting, live node logs, session diffs.' },
    { kind: 'ok', text: 'Type "help" for current commands.' },
  ]);
  const [cmd, setCmd] = useState('');
  const [status, setStatus] = useState('ready');
  const [exitCode, setExitCode] = useState(0);
  const viewRef = useRef(null);
  useEffect(() => { viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight }); }, [lines]);

  const append = (entryOrText, kind = 'plain') => {
    if (typeof entryOrText === 'string') {
      setLines((L) => L.concat(entryOrText.split('\n').map((t) => ({ kind, text: t }))));
    } else {
      setLines((L) => L.concat(entryOrText));
    }
  };
  const clear = () => setLines([]);

  const loadWF = () => {
    try {
      const json = localStorage.getItem('current-workflow');
      return json ? JSON.parse(json) : { nodes: [], edges: [] };
    } catch {
      return { nodes: [], edges: [] };
    }
  };

  async function run() {
    const wf = loadWF();
    if (!wf.nodes?.length) { append('empty workflow', 'err'); setExitCode(1); return; }
    setStatus('running'); setExitCode(0);
    const engine = new WorkflowExecutionEngine('demo-user');
    try {
      await engine.executeWorkflow(wf, (progress) => { if (progress?.message) append(progress.message, 'plain'); });
      append('OK', 'ok');
      setStatus('ready'); setExitCode(0);
    } catch (e) {
      append(`Error: ${e?.message || e}`, 'err');
      setStatus('error'); setExitCode(1);
    }
  }

  function handle(raw) {
    const input = raw.trim();
    if (!input) return;
    append({ kind: 'cmd', text: input });
    const [c, ...rest] = input.split(' ');
    switch ((c || '').toLowerCase()) {
      case 'help': {
        append(
          [
            'help            Show this help',
            'status          Workflow stats',
            'run             Execute workflow',
            'export json     Export workflow JSON',
            'clear           Clear screen',
          ].join('\n'),
          'plain',
        );
        break;
      }
      case 'status': {
        const wf = loadWF();
        append(`nodes: ${wf.nodes?.length || 0}   edges: ${wf.edges?.length || 0}`);
        break;
      }
      case 'run':
        run();
        break;
      case 'export': {
        const fmt = (rest[0] || '').toLowerCase();
        if (fmt === 'json') { const wf = loadWF(); append(JSON.stringify(wf, null, 2)); }
        else append('expected: export json', 'err');
        break;
      }
      case 'clear':
        clear();
        break;
      default:
        append('unknown command', 'err');
    }
  }

  const onKey = (e) => { if (e.key === 'Enter') { const v = cmd; setCmd(''); handle(v); } };

  // simple fake gauges
  const cpu = 12; const mem = 152; const depth = 2;

  return (
    <div style={{ background: brand.desk, minHeight: 'calc(100vh - 8px)', padding: 6, color: '#dadada', fontFamily: brand.mono }}>
      {/* Console frame */}
      <Bevel style={{ background: brand.chrome, padding: 6 }}>
        {/* Title */}
        <div style={{ background: brand.title, color: '#fff', padding: '4px 8px', fontFamily: 'Tahoma, Arial, sans-serif', fontWeight: 600 }}>
          Console (PowerShell++)
        </div>

        {/* Terminal viewport */}
        <div ref={viewRef} style={{ background: brand.viewport, color: '#dadada', height: '60vh', overflow: 'auto', padding: '12px', border: '1px solid #000', marginTop: 6 }}>
          <div style={{ fontSize: 14, lineHeight: 1.5 }}>
            {lines.map((l, i) => (
              <div key={i} style={{ whiteSpace: 'pre-wrap' }}>
                {l.kind === 'cmd' ? (
                  <>
                    <span style={{ color: brand.accent }}>PS</span>{' '}
                    <span style={{ color: brand.warn }}>C:\&gt;</span>{' '}
                    <span>{l.text}</span>
                  </>
                ) : l.kind === 'ok' ? (
                  <span style={{ color: brand.ok }}>{l.text}</span>
                ) : l.kind === 'err' ? (
                  <span style={{ color: brand.err }}>{l.text}</span>
                ) : (
                  <span>{l.text}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom input line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: brand.inputBg, color: '#dadada', padding: 6, border: '1px solid #000', borderTop: 'none' }}>
          <span style={{ color: brand.accent }}>PS</span>
          <span style={{ color: brand.warn }}>C:\&gt;</span>
          <input
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            onKeyDown={onKey}
            placeholder="help | status | run | export json"
            style={{ flex: 1, background: brand.inputBg, color: '#dadada', border: '1px solid #00FF7F', padding: '4px 6px', fontFamily: brand.mono }}
          />
          <Bevel style={{ background: brand.chrome, width: 74, textAlign: 'center', cursor: 'pointer' }}>
            <button onClick={() => { const v = cmd; setCmd(''); handle(v); }} style={{ width: '100%', height: 26, background: 'transparent', border: 'none', fontFamily: 'Tahoma, Arial, sans-serif', color: '#000' }}>Run</button>
          </Bevel>
        </div>

        {/* Output/status pane */}
        <Bevel inset style={{ background: '#fff', color: '#000', marginTop: 6, padding: 6, height: 72, overflow: 'hidden' }}>
          <div style={{ fontSize: 12, fontFamily: brand.mono }}>
            Status: {status}   ExitCode: {exitCode}   CPU: {cpu}%   Mem: {mem} MB   Depth: {depth}
          </div>
        </Bevel>
      </Bevel>
    </div>
  );
}
