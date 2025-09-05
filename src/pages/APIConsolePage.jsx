import React, { useState, useEffect, useMemo } from 'react';
import { SecureKeyManager } from '@/lib/security';
import aiRouter, { publishSettings as publishAIRouterSettings } from '@/lib/aiRouter';

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
    };
  }, [history, recent]);

  // Keys
  const [keys, setKeys] = useState([
    { label: 'svc-openai', lastUsed: '' },
    { label: 'svc-openrouter', lastUsed: '' },
    { label: 'svc-venice', lastUsed: '' },
  ]);
  const [activeKey, setActiveKey] = useState('');
  const [keyManagerOpen, setKeyManagerOpen] = useState(false);
  const [keyInputs, setKeyInputs] = useState({ openai: '', openrouter: '', venice: '' });
  const [showKeyFields, setShowKeyFields] = useState({ openai: false, openrouter: false, venice: false });

  // Pipeline
  const [pipelineLog, setPipelineLog] = useState('');

  // Features (Advanced toggle)
  const [features, setFeatures] = useState({ advanced: false, discourseTab: true });

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
      sessionStorage.removeItem(`api_key_${activeProvider}`);
      setActiveKey('');
      alert(`${activeProvider} key cleared from session`);
    } catch {}
  };

  const openKeyManager = () => {
    setKeyInputs({
      openai: SecureKeyManager.getApiKey('openai') || '',
      openrouter: SecureKeyManager.getApiKey('openrouter') || '',
      venice: SecureKeyManager.getApiKey('venice') || '',
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
    const h = [
      `Authorization: Bearer ${activeKey}`,
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
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${activeKey}`,
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
    for (const p of ['openai', 'openrouter', 'venice']) {
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
          <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-[#c0c0c0]`}>
            {/* Left: Providers + Endpoints + Keys */}
            <div className={`col-span-12 md:col-span-3 ${win95.panel} ${win95.outset}`}>
              {/* Providers */}
              <div>
                <div className={win95.title}>Providers</div>
                <div className="p-2 space-y-2">
                  {providers.map((provider) => (
                    <div key={provider.id} className="flex items-center">
                      <div
                        onClick={() => setActiveProvider(provider.id)}
                        className={`${win95.radio} ${win95.outset} w-3 h-3 flex items-center justify-center mr-2 cursor-pointer`}
                      >
                        {activeProvider === provider.id && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                      </div>
                      <span className="text-sm">{provider.name}</span>
                    </div>
                  ))}
                </div>
                <div className="p-2 flex gap-2">
                  <button onClick={() => testProvider(activeProvider)} className={`${win95.button} ${win95.outset} text-sm`}>Test</button>
                  <button onClick={testAllProviders} className={`${win95.button} ${win95.outset} text-sm`}>Test All</button>
                </div>
                <div className="p-2 mt-4">
                  <div className="mb-1 text-sm">API Base</div>
                  <input
                    type="text"
                    value={apiBase}
                    onChange={(e) => setApiBase(e.target.value)}
                    className={`${win95.inset} ${win95.inputField} w-full mb-2 text-sm`}
                  />
                  <div className="mb-1 text-sm">Model</div>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className={`${win95.inset} ${win95.inputField} w-full mb-2 text-sm`}
                  />
                  <div className="flex items-center mt-2">
                    <div
                      onClick={() => setStreaming(!streaming)}
                      className={`${win95.checkbox} ${win95.outset} w-3 h-3 flex items-center justify-center mr-2 cursor-pointer`}
                    >
                      {streaming && <div className="w-1.5 h-1.5 bg-black" />}
                    </div>
                    <span className="text-sm">Streaming</span>
                  </div>
                </div>
              </div>
              {/* Endpoints (Advanced) */}
              {features.advanced && (
                <div className="mt-4">
                  <div className={win95.title}>Endpoints</div>
                  <div className="p-2 space-y-2">
                    {providerRoutes[activeProvider]?.map((r) => (
                      <div key={r.label} className="flex items-center justify-between gap-2">
                        <div className="flex items-center">
                          <div className={`${win95.checkbox} ${win95.outset} w-3 h-3 mr-2`} />
                          <span className="text-sm">{r.label}</span>
                        </div>
                        <button
                          className={`${win95.miniButton} ${win95.outset} text-xs`}
                          onClick={() => {
                            setApiBase(r.base);
                            setPath(r.path);
                            setMethod(r.method);
                            setStreaming(!!r.streaming);
                          }}
                        >
                          Use
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Keys */}
              <div className="mt-4">
                <div className={win95.title}>Keys</div>
                <div className="p-2">
                  <div className="mb-1 text-sm">Active Key ({activeProvider})</div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="password"
                      value={activeKey}
                      onChange={(e) => setActiveKey(e.target.value)}
                      className={`${win95.inset} ${win95.inputField} flex-1 text-sm`}
                    />
                    <button onClick={copyKey} className={`${win95.button} ${win95.outset} text-sm px-2`}>
                      Copy
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <button onClick={saveActiveKey} className={`${win95.button} ${win95.outset} text-sm`}>
                      Save Key
                    </button>
                    <button onClick={loadSavedKey} className={`${win95.button} ${win95.outset} text-sm`}>
                      Load Saved
                    </button>
                    <button onClick={clearActiveKey} className={`${win95.button} ${win95.outset} text-sm`}>
                      Clear
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={openKeyManager} className={`${win95.button} ${win95.outset} flex-1 text-sm`}>
                      Manage All Keys…
                    </button>
                  </div>
                  <div className={`${win95.inset} mt-4 h-32 overflow-auto bg-white text-black`}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left p-1">label</th>
                          <th className="text-left p-1">last used</th>
                        </tr>
                      </thead>
                      <tbody>
                        {keys.map((key, index) => (
                          <tr key={index} className="font-mono text-xs hover:bg-gray-100">
                            <td className="p-1">{key.label}</td>
                            <td className="p-1">{key.lastUsed}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-[11px] opacity-70 mt-2">
                    Stored in this browser session. Use “Manage All Keys…” to re-enter your provider keys anytime.
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="mt-4">
                <div className={win95.title}>Settings</div>
                <div className="p-2 space-y-2">
                  <label className="flex items-center gap-2 text-[12px]">
                    <input
                      type="checkbox"
                      checked={features.advanced}
                      onChange={(e) => {
                        const next = { ...features, advanced: e.target.checked };
                        setFeatures(next);
                        try {
                          const raw = localStorage.getItem('sf_local_settings_v1');
                          const parsed = raw ? JSON.parse(raw) : {};
                          const updated = { ...parsed, features: { ...next } };
                          localStorage.setItem('sf_local_settings_v1', JSON.stringify(updated));
                        } catch {}
                      }}
                    />
                    Advanced features
                  </label>
                  <div className="text-[11px] opacity-70">
                    Advanced reduces clutter when off by hiding expert panels.
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Request Builder */}
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
                <div className={`${win95.inset} p-2 text-xs`}>
                  <div className="flex justify-between"><span>Total calls</span><span className="font-mono">{history.length}</span></div>
                  <div className="mt-2">Tokens in</div>
                  <div className={`${win95.panel} ${win95.outset} w-full h-4`}>
                    <div className="bg-[#1084d0] h-full" style={{ width: `${Math.min(100, totalTokens.in / 2000 * 100)}%` }} />
                  </div>
                  <div className="mt-2">Tokens out</div>
                  <div className={`${win95.panel} ${win95.outset} w-full h-4`}>
                    <div className="bg-[#1084d0] h-full" style={{ width: `${Math.min(100, totalTokens.out / 4000 * 100)}%` }} />
                  </div>
                  <div className="mt-2 opacity-70">Bars are local session estimates, not provider quotas.</div>
                </div>
              </div>
            </div>

            {/* Bottom: Conveyor (Advanced) */}
            {features.advanced && (
              <div className={`col-span-12 md:col-span-9 ${win95.panel} ${win95.outset}`}>
                <div className={win95.title}>Forge Conveyor · Call Timeline</div>
                <div className={`${win95.inset} p-2 m-2`}>
                  <div className={`${win95.inset} p-1 font-mono text-xs mb-4 bg-white text-black`}>
                    {pipelineLog || 'plan> POST /v1/chat/completions  provider=openai  stream=true'}
                  </div>
                  <div className="relative h-28 mb-4">
                    <div className="absolute top-1/2 w-full border-t border-black" />
                    <div className="absolute top-1/2 translate-y-14 w-full border-t border-black" />
                    <div className="flex justify-between px-4">
                      {[
                        ['S1 · Build', 'headers + body'],
                        ['S2 · Sign', 'keys + auth'],
                        ['S3 · Dispatch', 'provider endpoint'],
                        ['S4 · Stream', 'SSE chunks'],
                        ['S5 · Emit', 'response → UI'],
                      ].map(([title, desc]) => (
                        <div key={title} className={`${win95.panel} ${win95.outset} w-32`}>
                          <div className={win95.title + ' text-xs'}>{title}</div>
                          <div className={`${win95.inset} p-1 text-xs h-12 flex items-center justify-center`}>{desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className={`${win95.button} ${win95.outset} text-sm`} onClick={exportHistory}>Export</button>
                    <button className={`${win95.button} ${win95.outset} text-sm`} onClick={clearHistory}>Clear History</button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom right: Interface Logs + Gauge (Advanced) */}
            {features.advanced && (
              <div className={`col-span-12 md:col-span-3 ${win95.panel} ${win95.outset}`}>
                <div className={win95.title}>Interface Logs</div>
                <div className={`${win95.inset} p-2 m-2 h-64 overflow-auto bg-white text-black`}>
                  <div className="space-y-2">
                    {history.length === 0 && <div className="text-xs opacity-70">No calls yet.</div>}
                    {history.map((h, idx) => (
                      <div key={idx} className={`${win95.panel} ${win95.outset} cursor-pointer`} onClick={() => setSelectedLogIndex(idx)}>
                        <div className={`${win95.title} text-xs`}>{h.provider.toUpperCase()} · {h.status} · {h.ms}ms</div>
                        <div className={`${win95.inset} p-1 text-[11px]`}> 
                          <div className="truncate"><span className="font-mono">{h.method}</span> {h.url}</div>
                          <div className="flex justify-between mt-1">
                            <span>{new Date(h.ts).toLocaleTimeString()}</span>
                            <span className="font-mono">{h.model || ''}</span>
                          </div>
                          <div className="mt-1 opacity-80">{h.responsePreview}</div>
                          <details className="mt-1">
                            <summary>Request</summary>
                            <pre className="whitespace-pre-wrap">{JSON.stringify({ headers: h.headers, body: h.body }, null, 2)}</pre>
                          </details>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={win95.title}>Gauge Board</div>
                <div className={`${win95.inset} p-2 m-2`}>
                  <div className="flex justify-around mb-2">
                    {[
                      ['tps', gauge.tps],
                      ['latency', gauge.latency],
                      ['errors', gauge.errors],
                    ].map(([label, val]) => (
                      <div key={label} className="flex flex-col items-center">
                        <div className={`${win95.panel} ${win95.outset} w-10 h-32 flex flex-col-reverse mb-1`}>
                          <div className={`bg-[#1084d0]`} style={{ height: `${Math.round((val||0)*100)}%`, width: '100%' }} />
                        </div>
                        <span className="text-xs">{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] opacity-70">
                    avg latency: {gauge.avgLatency}ms · errors: {gauge.errorRate}%
                  </div>
                </div>
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
                {['openai','openrouter','venice'].map((pid) => (
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
      </div>
    </div>
  );
}
