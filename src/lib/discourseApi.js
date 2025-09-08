export async function getLatest(page = 0) {
  const r = await fetch(`/api/discourse/latest?page=${page}`, { credentials: 'include' });
  if (!r.ok) throw new Error('proxy_failed');
  return r.json();
}

export async function getTopic(id) {
  const r = await fetch(`/api/discourse/topic/${encodeURIComponent(id)}`, { credentials: 'include' });
  if (!r.ok) throw new Error('proxy_failed');
  return r.json();
}

export async function getPMInbox(username) {
  const r = await fetch(`/api/discourse/pm/${encodeURIComponent(username)}`, { credentials: 'include' });
  if (!r.ok) {
    let detail = 'proxy_failed';
    try { const j = await r.json(); if (j?.error) detail = j.error; if (j?.detail) detail += ':' + j.detail; } catch {}
    const err = new Error(detail);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

export function subscribeEvents(onMessage) {
  const ev = new EventSource('/api/events');
  ev.addEventListener('webhook', (e) => {
    try { onMessage && onMessage(JSON.parse(e.data)); } catch {}
  });
  ev.onerror = () => {
    // auto-reconnect handled by EventSource
  };
  return () => ev.close();
}

export async function aiSearch(payload) {
  const r = await fetch('/api/ai/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
  if (!r.ok) throw new Error('ai_search_failed');
  return r.json();
}

export function aiStream(payload, onEvent) {
  const ctrl = new AbortController();
  fetch('/api/ai/stream', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: ctrl.signal }).then(async (res) => {
    const reader = res.body?.getReader();
    const dec = new TextDecoder();
    while (reader) {
      const { value, done } = await reader.read();
      if (done) break;
      const text = dec.decode(value, { stream: true });
      onEvent && onEvent(text);
    }
  }).catch(()=>{});
  return () => ctrl.abort();
}

export async function getPersonas() {
  const r = await fetch('/api/ai/personas', { credentials: 'include' });
  if (!r.ok) throw new Error('personas_failed');
  return r.json();
}
