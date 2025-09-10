// Centralized AI Router for provider calls, settings, and history
// Reads/writes sessionStorage so settings flow across pages.

const DEFAULTS = {
  internal: {
    base: '/api/ai',
    headers: {},
  },
  openai: {
    base: 'https://api.openai.com/v1',
    headers: {},
  },
  openrouter: {
    base: 'https://openrouter.ai/api/v1',
    headers: (origin) => ({ 'HTTP-Referer': origin, 'X-Title': 'Semantic Canvas' }),
  },
  venice: {
    base: 'https://api.venice.ai/api/v1',
    headers: {},
  },
  nous: {
    base: 'https://inference-api.nousresearch.com/v1',
    headers: {},
  },
  morpheus: {
    base: 'https://api.mor.org/api/v1',
    headers: {},
  },
};

// Default system/user prompt templates for AI Functions (editable by user via Router UI)
const DEFAULT_PROMPTS = {
  text2wf: {
    system: `You are a semantic logic workflow converter. Your job is to convert the user's free-form specification into a structured workflow composed of the canonical semantic node ontology used by the system.\n\nInstructions:\n1) Analyze the input and extract atomic statements, hypotheses, evidence, reasoning steps, goals, and control points.\n2) Map extracted items to appropriate ontology node types when possible.\n3) Create edges that represent logical or causal flow.\n4) Return ONLY valid JSON with top-level { nodes: [...], edges: [...] } using node.data.type values from the ontology.`,
    user: `User specification:\n\n{{input}}`,
    // allow engine to append dynamic ontology reference by default
    appendOntology: true,
    variants: {
      standard: 'Produce a faithful structured workflow capturing all major logical elements.',
      concise: 'Produce a minimal workflow capturing only core semantic steps.',
      verbose: 'Produce an exhaustive workflow including fine-grained reasoning nodes.',
      experimental: 'Favor novel node type suggestions when mapping is ambiguous.',
    },
  },
  execute: {
    system: `You are a semantic logic workflow executor. Execute the provided workflow step by step.\n\nWorkflow Format: {{format}}\nYour task:\n1. Process each node in the workflow according to its semantic type\n2. Follow the logical connections between nodes\n3. Provide reasoning for each step\n4. Return results in the same format structure.`,
    user: `Execute this semantic workflow:\n\n{{workflow}}`,
    variants: {
      standard: 'Perform a normal execution with balanced detail.',
      trace: 'Include a detailed reasoning trace for each node.',
      concise: 'Minimize verbosity; provide only essential outputs.',
      diagnostics: 'Highlight potential logical gaps or missing dependencies as you execute.',
    },
  },
  enhance: {
    system: `You are a semantic logic node enhancer. Your job is to improve, optimize or refactor a single semantic node's content while preserving its logical purpose and type.\n\nGuidelines:\n1. Maintain the node's semantic type and logical purpose\n2. Preserve the core meaning while improving expression\n3. Use appropriate technical vocabulary\n4. Return ONLY the enhanced content, no additional formatting.`,
    user: `Enhance this node content:\n\n{{content}}`,
    // Variant-specific instructions (editable) used when user picks a specific enhancementType
    variants: {
      improve: 'Improve and refine this semantic node while maintaining its logical purpose and type.',
      optimize: 'Optimize this semantic node for clarity, precision, and logical coherence.',
      refactor: 'Refactor this semantic node to be more structured and academically rigorous.',
      enhance: 'Enhance this semantic node with richer vocabulary and more sophisticated reasoning.',
      simplify: 'Simplify this semantic node while preserving its essential meaning and logical function.',
      elaborate: 'Elaborate on this semantic node with additional detail and nuanced reasoning.',
    },
  },
};

const PROMPT_KEY = 'ai_prompt_defaults_v1';

export function getPromptDefaults() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PROMPT_KEY) : null;
    if (!raw) return DEFAULT_PROMPTS;
    const parsed = JSON.parse(raw);
    // shallow merge
    return {
      text2wf: {
        ...DEFAULT_PROMPTS.text2wf,
        ...(parsed.text2wf || {}),
        variants: {
          ...(DEFAULT_PROMPTS.text2wf.variants || {}),
          ...(((parsed.text2wf || {}).variants) || {}),
        },
      },
      execute: {
        ...DEFAULT_PROMPTS.execute,
        ...(parsed.execute || {}),
        variants: {
          ...(DEFAULT_PROMPTS.execute.variants || {}),
          ...(((parsed.execute || {}).variants) || {}),
        },
      },
      enhance: {
        ...DEFAULT_PROMPTS.enhance,
        ...(parsed.enhance || {}),
        variants: {
          ...(DEFAULT_PROMPTS.enhance.variants || {}),
            ...(((parsed.enhance || {}).variants) || {}),
        },
      },
    };
  } catch (e) {
    return DEFAULT_PROMPTS;
  }
}

export function publishPromptDefaults(overrides) {
  try {
    const next = {
      text2wf: {
        ...(overrides.text2wf || {}),
        variants: { ...((overrides.text2wf || {}).variants || {}) },
      },
      execute: {
        ...(overrides.execute || {}),
        variants: { ...((overrides.execute || {}).variants || {}) },
      },
      enhance: {
        ...(overrides.enhance || {}),
        variants: {
          ...((overrides.enhance || {}).variants || {}),
        },
      },
    };
    if (typeof window !== 'undefined') localStorage.setItem(PROMPT_KEY, JSON.stringify(next));
    return true;
  } catch (e) {
    return false;
  }
}

function getBase(providerId) {
  const key = `base_url_${providerId}`;
  const override = typeof window !== 'undefined' ? sessionStorage.getItem(key) : null;
  if (override) return override;
  return DEFAULTS[providerId]?.base || DEFAULTS.openai.base;
}

function getHeaders(providerId, apiKey) {
  const base = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  if (providerId === 'openrouter') {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const extra = DEFAULTS.openrouter.headers(origin);
    return { ...base, ...extra };
  }
  if (providerId === 'openai') {
    // Optional org/project headers if user configured them
    try {
      const org = typeof window !== 'undefined' ? sessionStorage.getItem('openai_org') : null;
      const project = typeof window !== 'undefined' ? sessionStorage.getItem('openai_project') : null;
      return {
        ...base,
        ...(org ? { 'OpenAI-Organization': org } : {}),
        ...(project ? { 'OpenAI-Project': project } : {}),
      };
    } catch {}
  }
  return base;
}

function recordHistory(entry) {
  try {
    const raw = sessionStorage.getItem('api_history_v1');
    const arr = raw ? JSON.parse(raw) : [];
    const next = [entry, ...arr].slice(0, 50);
    sessionStorage.setItem('api_history_v1', JSON.stringify(next));
  } catch {}
}

function maskHeaders(headers = {}) {
  const h = { ...headers };
  if (h.Authorization) {
    const v = String(h.Authorization);
    const tail = v.slice(-6);
    h.Authorization = `Bearer ••••••${tail}`;
  }
  return h;
}

function adaptBodyAndPath(providerId, body, explicitPath) {
  // Returns { path, payload }
  if (explicitPath) return { path: explicitPath, payload: body };

  // Default endpoints by provider
  if (providerId === 'openai') {
    // Maintain compatibility with existing chat/completions clients by default.
    // Use /responses only when explicitly requested via path or when body already uses input/instructions.
    if (explicitPath === '/responses' || body?.input || body?.instructions) {
      let payload = { ...body };
      // If messages exist, we can still map them but prefer given input/instructions
      if (!payload.input && Array.isArray(payload.messages)) {
        const sys = payload.messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
        const convo = payload.messages
          .filter(m => m.role !== 'system')
          .map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : (Array.isArray(m.content) ? m.content.map(c => (c?.text || c?.type || '')).join(' ') : '')}`)
          .join('\n');
        payload = { ...payload, ...(sys ? { instructions: sys } : {}), input: convo };
        delete payload.messages;
      }
      return { path: '/responses', payload };
    }
    return { path: '/chat/completions', payload: body };
  }

  if (providerId === 'openrouter') {
    // Default to chat/completions if messages provided; else use completions with prompt
    if (Array.isArray(body?.messages)) return { path: '/chat/completions', payload: body };
    if (body?.prompt) return { path: '/completions', payload: body };
    // Fallback to chat
    return { path: '/chat/completions', payload: body };
  }

  if (providerId === 'venice') {
    return { path: '/chat/completions', payload: body };
  }

  if (providerId === 'nous') {
    // OpenAI compatible: supports /chat/completions and /completions
    if (Array.isArray(body?.messages)) return { path: '/chat/completions', payload: body };
    if (body?.prompt) return { path: '/completions', payload: body };
    return { path: '/chat/completions', payload: body };
  }

  if (providerId === 'morpheus') {
    // Observed endpoint: /chat/completions for chat
    if (Array.isArray(body?.messages)) return { path: '/chat/completions', payload: body };
    if (body?.prompt) return { path: '/completions', payload: body };
    return { path: '/chat/completions', payload: body };
  }

  // Fallback
  return { path: '/chat/completions', payload: body };
}

function extractTokenUsage(providerId, json) {
  if (!json || !json.usage) return null;
  // OpenAI Responses: input_tokens/output_tokens
  if (providerId === 'openai' && (typeof json.usage.input_tokens === 'number' || typeof json.usage.output_tokens === 'number')) {
    return { in: json.usage.input_tokens || 0, out: json.usage.output_tokens || 0 };
  }
  // Legacy OpenAI Chat/others
  return { in: json.usage.prompt_tokens || 0, out: json.usage.completion_tokens || 0 };
}

function collectResponseMeta(res) {
  try {
    return {
      requestId: res.headers.get('x-request-id') || res.headers.get('openai-request-id') || null,
      rateLimits: {
        limitRequests: res.headers.get('x-ratelimit-limit-requests') || null,
        remainingRequests: res.headers.get('x-ratelimit-remaining-requests') || null,
        resetRequests: res.headers.get('x-ratelimit-reset-requests') || null,
        limitTokens: res.headers.get('x-ratelimit-limit-tokens') || null,
        remainingTokens: res.headers.get('x-ratelimit-remaining-tokens') || null,
        resetTokens: res.headers.get('x-ratelimit-reset-tokens') || null,
      },
    };
  } catch { return null; }
}

export async function chatCompletion(providerId, apiKey, body, { path } = {}) {
  const base = getBase(providerId);
  const { path: finalPath, payload } = adaptBodyAndPath(providerId, body, path);
  const url = `${base}${finalPath}`;
  const headers = getHeaders(providerId, apiKey);
  const method = 'POST';
  const start = Date.now();
  const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
  const ms = Date.now() - start;
  const text = await res.text();
  let json; try { json = JSON.parse(text); } catch {}
  const usage = extractTokenUsage(providerId, json);
  const meta = collectResponseMeta(res);
  recordHistory({
    ts: Date.now(), provider: providerId, method, url, status: res.status, ms,
    tokens: usage, model: payload?.model, headers: maskHeaders(headers), body: payload, meta,
  });
  if (!res.ok) {
    const message = json?.error?.message || json?.message || text || res.statusText;
    const code = json?.error?.type || json?.error?.code || res.status;
    const err = new Error(`${providerId}: ${message}`);
    err.code = code;
    err.status = res.status;
    err.meta = meta;
    throw err;
  }
  return json || text;
}

// Raw fetch for streaming usage; caller handles reader.
export async function fetchChatCompletionRaw(providerId, apiKey, body, { path } = {}) {
  const base = getBase(providerId);
  const { path: finalPath, payload } = adaptBodyAndPath(providerId, body, path);
  const url = `${base}${finalPath}`;
  const headers = getHeaders(providerId, apiKey);
  const start = Date.now();
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
  if (!res.ok) {
    // Record error snapshot and throw enriched error
    let text = '';
    try { text = await res.text(); } catch {}
    let json; try { json = JSON.parse(text); } catch {}
    recordHistory({ ts: Date.now(), provider: providerId, method: 'POST', url, status: res.status, ms: Date.now()-start, tokens: null, model: payload?.model, headers: maskHeaders(headers), body: payload, meta: collectResponseMeta(res) });
    const message = json?.error?.message || json?.message || text || res.statusText;
    const err = new Error(`${providerId}: ${message}`);
    err.status = res.status;
    throw err;
  }
  return res;
}

export async function testProvider(providerId, apiKey, model) {
  const body = { model, messages: [{ role: 'user', content: 'ping' }], max_tokens: 5 };
  try {
    await chatCompletion(providerId, apiKey, body);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export function publishSettings({ activeProvider, base, model, streaming }) {
  try {
    if (activeProvider) sessionStorage.setItem('active_provider', activeProvider);
    if (base && activeProvider) sessionStorage.setItem(`base_url_${activeProvider}`, base);
    if (model && activeProvider) sessionStorage.setItem(`default_model_${activeProvider}`, model);
    if (typeof streaming === 'boolean') sessionStorage.setItem('streaming_enabled', String(streaming));
  } catch {}
}

export function getActiveProvider() {
  return (typeof window !== 'undefined' && sessionStorage.getItem('active_provider')) || 'openai';
}

export default {
  getBase,
  getHeaders,
  chatCompletion,
  fetchChatCompletionRaw,
  testProvider,
  publishSettings,
  getActiveProvider,
};
