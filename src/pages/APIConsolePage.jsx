import React, { useState, useEffect } from 'react';
import { SecureKeyManager } from '@/lib/security';

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
  { id: 'venicellm', name: 'VeniceLLM' },
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
  const [apiBase, setApiBase] = useState('https://api.openai.com');
  const [model, setModel] = useState('gpt-4o-mini');
  const [streaming, setStreaming] = useState(true);

  // Endpoints
  const [activeEndpoints, setActiveEndpoints] = useState(['chatcompletions']);

  // Request
  const [method, setMethod] = useState('POST');
  const [path, setPath] = useState('/v1/chat/completions');
  const [bodyContent, setBodyContent] = useState(
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

  // Response
  const [responseStatus, setResponseStatus] = useState('');
  const [responseTime, setResponseTime] = useState('');
  const [tokens, setTokens] = useState({ in: 0, out: 0 });
  const [cost, setCost] = useState('$0.0000');
  const [responseContent, setResponseContent] = useState('');

  // Keys
  const [keys, setKeys] = useState([
    { label: 'svc-openai', lastUsed: '09:41' },
    { label: 'svc-router', lastUsed: '08:12' },
    { label: 'svc-venice', lastUsed: '07:59' },
    { label: 'svc-discai', lastUsed: '07:10' },
  ]);
  const [activeKey, setActiveKey] = useState('');

  // Pipeline
  const [pipelineLog, setPipelineLog] = useState('');

  // Effects
  useEffect(() => {
    const savedKey = SecureKeyManager.getApiKey(activeProvider);
    if (savedKey) setActiveKey(savedKey);

    switch (activeProvider) {
      case 'openai':
        setApiBase('https://api.openai.com');
        setPath('/v1/chat/completions');
        break;
      case 'openrouter':
        setApiBase('https://openrouter.ai/api');
        setPath('/v1/chat/completions');
        break;
      case 'venicellm':
        setApiBase('https://api.venice.ai');
        setPath('/v1/chat/completions');
        break;
      case 'discourse':
        setApiBase('https://hub.bitwiki.org/api');
        setPath('/discourse_ai/personas');
        break;
      default:
        setApiBase('https://api.openai.com');
    }
  }, [activeProvider]);

  useEffect(() => {
    if (activeKey && activeProvider) {
      SecureKeyManager.storeApiKey(activeProvider, activeKey);
    }
  }, [activeKey, activeProvider]);

  const toggleEndpoint = (endpointId) => {
    setActiveEndpoints((prev) =>
      prev.includes(endpointId) ? prev.filter((id) => id !== endpointId) : [...prev, endpointId],
    );
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

  const copyCurl = () => {
    const headers = `'Authorization: Bearer ${activeKey}' 'Content-Type: application/json'`;
    const curl = `curl -X ${method} ${apiBase}${path} -H ${headers} -d '${bodyContent}'`;
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
      };

      const response = await fetch(`${apiBase}${path}`, {
        method,
        headers,
        body: method !== 'GET' ? bodyContent : undefined,
      });

      const endTime = Date.now();
      setResponseTime(`${endTime - startTime} ms`);
      setResponseStatus(`${response.status} ${response.statusText}`);

      if (streaming && path.includes('completions') && response.body?.getReader) {
        let inTokens = 0;
        let outTokens = 0;
        try {
          const body = JSON.parse(bodyContent);
          if (body.messages) inTokens = Math.round(body.messages.reduce((a, m) => a + m.content.length / 4, 0));
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
      } else {
        const data = await response.json().catch(() => ({}));
        setResponseContent(JSON.stringify(data, null, 2));
        if (data.usage) {
          const pt = data.usage.prompt_tokens || 0;
          const ct = data.usage.completion_tokens || 0;
          setTokens({ in: pt, out: ct });
          setCost(`$${(pt * 0.00001 + ct * 0.00003).toFixed(6)}`);
        }
      }
    } catch (err) {
      setResponseStatus('Error');
      setResponseContent(`Error: ${err.message}`);
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
              {/* Endpoints */}
              <div className="mt-4">
                <div className={win95.title}>Endpoints</div>
                <div className="p-2 space-y-2">
                  {endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="flex items-center">
                      <div
                        onClick={() => toggleEndpoint(endpoint.id)}
                        className={`${win95.checkbox} ${win95.outset} w-3 h-3 flex items-center justify-center mr-2 cursor-pointer`}
                      >
                        {activeEndpoints.includes(endpoint.id) && <div className="w-1.5 h-1.5 bg-black" />}
                      </div>
                      <span className="text-sm">{endpoint.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Keys */}
              <div className="mt-4">
                <div className={win95.title}>Keys</div>
                <div className="p-2">
                  <div className="mb-1 text-sm">Active Key</div>
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
                  <div className="flex gap-2">
                    <button onClick={generateKey} className={`${win95.button} ${win95.outset} flex-1 text-sm`}>
                      Generate
                    </button>
                    <button className={`${win95.button} ${win95.outset} flex-1 text-sm`}>Revoke</button>
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
                  <button className={`${win95.button} ${win95.outset} text-sm`}>Save</button>
                  <button onClick={copyCurl} className={`${win95.button} ${win95.outset} text-sm`}>
                    Copy cURL
                  </button>
                  <button onClick={clearRequest} className={`${win95.button} ${win95.outset} text-sm`}>
                    Clear
                  </button>
                </div>
              </div>
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
                <div className={`${win95.inset} h-44 p-2 font-mono text-xs overflow-auto mb-4 bg-white text-black break-words`}>
                  {responseContent || `{ "id":"chatcmpl_...",
  "choices":[{ "delta":"Hi!" }],
  "usage":{ "prompt_tokens":8,
             "completion_tokens":10 }
}`}
                </div>
                <div className="flex gap-2">
                  <button className={`${win95.miniButton} ${win95.outset} text-xs`}>JSON</button>
                  <button className={`${win95.miniButton} ${win95.outset} text-xs`}>Text</button>
                  <button className={`${win95.miniButton} ${win95.outset} text-xs`}>Save Persona</button>
                </div>
              </div>
            </div>

            {/* Bottom: Conveyor */}
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
                  <button className={`${win95.button} ${win95.outset} text-sm`}>Checkpoint</button>
                  <button className={`${win95.button} ${win95.outset} text-sm`}>Rollback</button>
                  <button className={`${win95.button} ${win95.outset} text-sm`}>Export</button>
                </div>
              </div>
            </div>

            {/* Bottom right: Gauge Board */}
            <div className={`col-span-12 md:col-span-3 ${win95.panel} ${win95.outset}`}>
              <div className={win95.title}>Gauge Board</div>
              <div className={`${win95.inset} p-2 m-2`}>
                <div className="flex justify-around mb-4">
                  {[
                    ['tps', 'h-1/3'],
                    ['latency', 'h-1/2'],
                    ['errors', 'h-1/12'],
                  ].map(([label, height]) => (
                    <div key={label} className="flex flex-col items-center">
                      <div className={`${win95.panel} ${win95.outset} w-12 h-44 flex flex-col-reverse mb-1`}>
                        <div className={`bg-[#1084d0] ${height} w-full`} />
                      </div>
                      <span className="text-xs">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className={`${win95.button} ${win95.outset} text-sm flex-1`}>Calibrate</button>
                  <button className={`${win95.button} ${win95.outset} text-sm flex-1`}>Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
