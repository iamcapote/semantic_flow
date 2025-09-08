import 'dotenv/config'; // Load environment variables from .env before reading them
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { stringify as qsStringify, parse as qsParse } from 'querystring';
import fs from 'fs';
import path from 'path';
// import { fileURLToPath } from 'url';

// Environment
const DISCOURSE_BASE_URL = process.env.DISCOURSE_BASE_URL || 'https://hub.bitwiki.org';
const DISCOURSE_SSO_SECRET = process.env.DISCOURSE_SSO_SECRET || '';
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:8081';
const API_KEY = process.env.API_KEY || 'change-me';
const DISCOURSE_WEBHOOK_SECRET = process.env.DISCOURSE_WEBHOOK_SECRET || '';
// Optional default internal persona id (numeric) used when persona list cannot be fetched
const INTERNAL_DEFAULT_PERSONA_ID = process.env.INTERNAL_DEFAULT_PERSONA_ID || process.env.BITHUB_DEFAULT_PERSONA_ID || '';
// Optional branding override (e.g., BIThub) – falls back to "Discourse" when unset
const DISCOURSE_BRAND = process.env.BITHUB || process.env.BITHUB_NAME || 'Discourse';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Helpers
const isProd = NODE_ENV === 'production';
const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  path: '/',
};

function base64(input) { return Buffer.from(input).toString('base64'); }
function b64urlEncode(buf) {
  return Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function b64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  return Buffer.from(str + pad, 'base64');
}
function base64url(input) { return base64(input); } // kept for SSO which expects standard b64

function hmacSha256Hex(secret, payload) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function makeCSRFToken() {
  return crypto.randomBytes(24).toString('hex');
}

function signSession(user) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: user.external_id || user.id || user.username, user, iat: now, exp: now + 7 * 24 * 3600 };
  const h = b64urlEncode(JSON.stringify(header));
  const p = b64urlEncode(JSON.stringify(payload));
  const data = `${h}.${p}`;
  const sig = crypto.createHmac('sha256', API_KEY).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${data}.${sig}`;
}

function verifySession(token) {
  try {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) return null;
    const [h, p, s] = parts;
    const data = `${h}.${p}`;
    const expected = crypto.createHmac('sha256', API_KEY).update(data).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    if (s !== expected) return null;
    const payload = JSON.parse(b64urlDecode(p).toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// Build / deployment metadata (exposed via API)
const BUILD_INFO = {
  version: process.env.BUILD_VERSION || process.env.npm_package_version || 'dev',
  commit: process.env.GIT_COMMIT || '',
  startedAt: Date.now(),
};

export function createApp() {
  const app = express();
  // Resolve project paths for static serving (avoid import.meta for Jest compatibility)
  const ROOT_DIR = path.resolve(process.cwd());
  const DIST_DIR = path.join(ROOT_DIR, 'dist');
  // In-memory SSE clients (simple fan-out bus)
  const sseClients = new Set();
  let sseId = 1;
  // In-memory dedupe for webhooks (TTL)
  const seenEvents = new Map(); // key -> ts
  const SEEN_TTL_MS = 2 * 60 * 1000; // 2 minutes
  function markSeen(key) {
    const now = Date.now();
    seenEvents.set(key, now);
    // occasional sweep
    if (seenEvents.size > 500) {
      const cutoff = now - SEEN_TTL_MS;
      for (const [k, ts] of seenEvents.entries()) { if (ts < cutoff) seenEvents.delete(k); }
    }
  }
  function wasSeen(key) {
    const ts = seenEvents.get(key);
    if (!ts) return false;
    if (Date.now() - ts > SEEN_TTL_MS) { seenEvents.delete(key); return false; }
    return true;
  }

  // CORS
  const allowedOrigins = [APP_BASE_URL, 'http://localhost:5173'];
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(null, isProd ? false : true);
    },
    credentials: true,
  }));

  app.use(cookieParser());
  // capture raw body for webhook HMAC verification
  app.use(express.json({
    verify: (req, _res, buf) => {
      try { req.rawBody = buf; } catch {}
    }
  }));

  // Health
  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, env: NODE_ENV });
  });

  // Build/version metadata (lightweight)
  app.get('/api/meta/version', (_req, res) => {
    res.json({
      ...BUILD_INFO,
      uptime_ms: Date.now() - BUILD_INFO.startedAt,
    });
  });

  // SSE stream for build/version notifications
  const versionClients = new Set();
  app.get('/api/meta/version/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Emit current build info immediately
    res.write('event: version\n');
    res.write(`data: ${JSON.stringify(BUILD_INFO)}\n\n`);

    versionClients.add(res);
    const keepAlive = setInterval(() => {
      try {
        res.write('event: ping\n');
        res.write('data: {}\n\n');
      } catch {}
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
      versionClients.delete(res);
    });
  });

  // Public config (no secrets)
  app.get('/api/config', (_req, res) => {
    res.json({
      discourseBaseUrl: DISCOURSE_BASE_URL,
      ssoProvider: !!DISCOURSE_SSO_SECRET,
      appBaseUrl: APP_BASE_URL,
  brand: DISCOURSE_BRAND,
  internalDefaultPersonaId: INTERNAL_DEFAULT_PERSONA_ID || null,
    });
  });

  // SSE events stream (webhooks fan-out, heartbeats)
  app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();
    const client = res;
    sseClients.add(client);
    const id = sseId++;
    client.write(`event: open\n`);
    client.write(`data: {"ok":true,"id":${id}}\n\n`);
    const ping = setInterval(() => {
      try { client.write(`event: ping\n` + `data: ${Date.now()}\n\n`); } catch {}
    }, 15000);
    req.on('close', () => {
      clearInterval(ping);
      sseClients.delete(client);
    });
  });

  // SSO: start login
  app.get('/api/sso/login', (req, res) => {
    if (!DISCOURSE_SSO_SECRET) return res.status(500).json({ error: 'SSO not configured' });
    const nonce = crypto.randomBytes(16).toString('hex');
    const returnUrl = `${APP_BASE_URL}/api/sso/callback`;
  const payload = qsStringify({ nonce, return_sso_url: returnUrl });
    const sso = base64url(payload);
    const sig = hmacSha256Hex(DISCOURSE_SSO_SECRET, sso);

    // Store nonce in httpOnly cookie
    res.cookie('sf_sso_nonce', nonce, { ...cookieOpts, maxAge: 5 * 60 * 1000 });

    const redirectUrl = `${DISCOURSE_BASE_URL}/session/sso_provider?sso=${encodeURIComponent(sso)}&sig=${sig}`;
    return res.redirect(302, redirectUrl);
  });

  // SSO: callback
  app.get('/api/sso/callback', async (req, res) => {
    try {
      const { sso, sig } = req.query;
      if (!sso || !sig) return res.status(400).send('Missing sso/sig');
      const expected = hmacSha256Hex(DISCOURSE_SSO_SECRET, sso);
      if (expected !== sig) return res.status(400).send('Bad signature');

      const decoded = Buffer.from(String(sso), 'base64').toString('utf8');
  const params = qsParse(decoded);
      const nonceCookie = req.cookies['sf_sso_nonce'];
      if (!nonceCookie || params.nonce !== nonceCookie) return res.status(400).send('Nonce mismatch');

      // Extract profile
      const user = {
        external_id: params.external_id,
        username: params.username,
        email: params.email,
        name: params.name,
        admin: params.admin === 'true' || params.admin === true,
        groups: params.groups ? String(params.groups).split(',') : [],
        avatar_url: params.avatar_url,
      };

      // Create session and csrf cookies
      const token = signSession(user);
      const csrf = makeCSRFToken();
      res.cookie('sf_session', token, { ...cookieOpts, maxAge: 7 * 24 * 3600 * 1000 });
      // Double-submit cookie for CSRF (readable by JS)
      res.cookie('sf_csrf', csrf, { sameSite: 'lax', secure: isProd, path: '/' });
      // Clear nonce
      res.clearCookie('sf_sso_nonce', { path: '/' });

      // Redirect back to app Discourse tab
      return res.redirect(302, `${APP_BASE_URL}/discourse`);
    } catch (e) {
      return res.status(500).send('SSO error');
    }
  });

  // Logout
  app.post('/api/logout', (req, res) => {
    const csrfHeader = req.get('x-csrf-token');
    const csrfCookie = req.cookies['sf_csrf'];
    if (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie) {
      return res.status(403).json({ error: 'CSRF invalid' });
    }
    res.clearCookie('sf_session', { path: '/' });
    res.clearCookie('sf_csrf', { path: '/' });
    return res.json({ ok: true });
  });

  // Me
  app.get('/api/me', (req, res) => {
    const token = req.cookies['sf_session'];
    if (!token) return res.status(401).json({ error: 'unauthenticated' });
    const payload = verifySession(token);
    if (!payload) return res.status(401).json({ error: 'unauthenticated' });
    return res.json({ user: payload.user });
  });

  // Discourse proxy helpers
  async function fetchWithRetry(url, init = {}, attempts = 3) {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try {
        const r = await fetch(url, init);
        if (r.status === 429 || r.status >= 500) {
          const retryAfter = Number(r.headers.get('retry-after') || 0);
          const backoff = retryAfter > 0 ? retryAfter * 1000 : (250 * Math.pow(2, i));
          await new Promise((res) => setTimeout(res, backoff));
          lastErr = new Error(`HTTP ${r.status}`);
          continue;
        }
        return r;
      } catch (e) {
        lastErr = e;
        await new Promise((res) => setTimeout(res, 200 * Math.pow(2, i)));
      }
    }
    throw lastErr || new Error('fetch_failed');
  }

  function getSessionUser(req) {
    try {
      const token = req.cookies?.sf_session;
      if (!token) return null;
      const payload = verifySession(token);
      return payload?.user || null;
    } catch { return null; }
  }

  async function discourseGet(pathname, req) {
    const url = `${DISCOURSE_BASE_URL}${pathname}`;
    const headers = { 'Accept': 'application/json' };
    if (API_KEY && API_KEY !== 'change-me') {
      headers['Api-Key'] = API_KEY;
      // Impersonate session user if available per architecture (Api-Username=session.username)
      const su = req ? getSessionUser(req) : null;
      headers['Api-Username'] = su?.username || 'system';
    }
    const r = await fetchWithRetry(url, { headers });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`Discourse error ${r.status}: ${text}`);
    }
    return r.json();
  }

  async function discoursePost(pathname, body, req) {
    if (!API_KEY || API_KEY === 'change-me') throw new Error('admin_key_missing');
    const url = `${DISCOURSE_BASE_URL}${pathname}`;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': API_KEY,
      // Use session user if available (writes will still be authorized by Discourse ACLs)
      'Api-Username': (req && getSessionUser(req)?.username) || 'system',
    };
    const r = await fetchWithRetry(url, { method: 'POST', headers, body: JSON.stringify(body || {}) });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`Discourse error ${r.status}: ${text}`);
    }
    return r.json();
  }

  // Latest topics
  app.get('/api/discourse/latest', async (req, res) => {
    try {
      const page = Number(req.query.page || 0);
      const data = await discourseGet(`/latest.json?page=${page}`, req);
      return res.json(data);
    } catch (e) {
      return res.status(502).json({ error: 'proxy_failed' });
    }
  });

  // Topic detail
  app.get('/api/discourse/topic/:id', async (req, res) => {
    try {
      const id = encodeURIComponent(req.params.id);
      const data = await discourseGet(`/t/${id}.json`, req);
      return res.json(data);
    } catch (e) {
      return res.status(502).json({ error: 'proxy_failed' });
    }
  });

  // PM inbox for a username (read-only)
  app.get('/api/discourse/pm/:username', async (req, res) => {
    try {
      // Username parity guard: only allow session user to access their own PM inbox
      const sessionUser = getSessionUser(req);
      if (!sessionUser) return res.status(401).json({ error: 'unauthenticated' });
      if (String(req.params.username) !== String(sessionUser.username)) {
        return res.status(403).json({ error: 'username_mismatch' });
      }
      const u = encodeURIComponent(req.params.username);
      const data = await discourseGet(`/topics/private-messages/${u}.json`, req);
      return res.json(data);
    } catch (e) {
      return res.status(502).json({ error: 'proxy_failed' });
    }
  });

  // Webhook receiver (Discourse Admin -> API -> Webhooks)
  app.post('/api/webhooks/discourse', (req, res) => {
    if (!DISCOURSE_WEBHOOK_SECRET) return res.status(501).json({ error: 'webhook_unconfigured' });
    const sig = req.get('x-discourse-event-signature') || '';
    const event = req.get('x-discourse-event') || 'unknown';
    const type = req.get('x-discourse-event-type') || 'unknown';
    // Discourse sends: sha256=<hmac>
    const expected = 'sha256=' + crypto.createHmac('sha256', DISCOURSE_WEBHOOK_SECRET).update(req.rawBody || Buffer.from('')).digest('hex');
    if (sig !== expected) return res.status(401).json({ error: 'bad_signature' });
    // dedupe by rawBody hash
    const bodyHash = crypto.createHash('sha256').update(req.rawBody || Buffer.from('')).digest('hex');
    if (wasSeen(bodyHash)) {
      return res.json({ ok: true, deduped: true });
    }
    markSeen(bodyHash);

    // Try to parse body for lightweight projection
    let body = null;
    try { body = JSON.parse(String(req.rawBody || '')); } catch {}
    const projection = {};
    if (body && typeof body === 'object') {
      // Common shapes: post_created -> post.id/topic_id, topic_created/updated -> topic.id
      const post = body.post || body.post_payload || body.post_created || null;
      const topic = body.topic || body.topic_payload || body.topic_created || body.topic_updated || null;
      if (post) {
        projection.postId = post.id || post.post_id;
        projection.topicId = post.topic_id || (post.topic && post.topic.id);
        projection.userId = post.user_id;
      }
      if (topic) {
        projection.topicId = projection.topicId || topic.id;
        projection.categoryId = topic.category_id;
      }
    }
    console.log('[webhook]', { event, type, ...projection });
    // Broadcast to SSE clients (best-effort)
    const payload = JSON.stringify({ event, type, ts: Date.now(), ...projection });
    for (const client of sseClients) {
      try { client.write(`event: webhook\n` + `data: ${payload}\n\n`); } catch {}
    }
    return res.json({ ok: true });
  });

  // Create a Context Seed (Topic in a category with tags and JSON front‑matter)
  app.post('/api/discourse/seed', async (req, res) => {
    try {
      const { title, category_id, tags = [], raw, idempotencyKey } = req.body || {};
      if (!title || !category_id) return res.status(400).json({ error: 'missing_params' });

      // Simple idempotency: search for existing by title in category
      if (idempotencyKey) {
        try {
          const hit = await discourseGet(`/search.json?q=title:${encodeURIComponent(title)}%20category:${encodeURIComponent(category_id)}`);
          const existing = hit?.topics?.find?.((t) => String(t.title).trim() === String(title).trim());
          if (existing) return res.json({ ok: true, idempotent: true, topic: existing });
        } catch {}
      }

      const bodyFrontMatter = raw || [
        '---',
        JSON.stringify({ seed: true, idempotencyKey: idempotencyKey || null, createdAt: new Date().toISOString() }),
        '---',
        '',
        'Seed initialized by Semantic Flow.',
      ].join('\n');

  const created = await discoursePost('/posts', {
        title,
        raw: bodyFrontMatter,
        category: Number(category_id),
        tags,
  }, req);
      return res.json({ ok: true, topic: created?.topic });
    } catch (e) {
      const msg = String(e.message || e);
      const code = msg.includes('admin_key_missing') ? 501 : 502;
      return res.status(code).json({ error: 'seed_failed', detail: msg });
    }
  });

  // Attach a seed topic link into a PM topic by posting a reply
  app.post('/api/discourse/seed/:seedTopicId/attach', async (req, res) => {
    try {
      const { pm_topic_id } = req.body || {};
      const seedTopicId = req.params.seedTopicId;
      if (!pm_topic_id || !seedTopicId) return res.status(400).json({ error: 'missing_params' });
      const seedUrl = `${DISCOURSE_BASE_URL}/t/${encodeURIComponent(seedTopicId)}`;
  const created = await discoursePost('/posts', {
        topic_id: Number(pm_topic_id),
        raw: `Attaching context seed: ${seedUrl}`,
  }, req);
      return res.json({ ok: true, post: created });
    } catch (e) {
      const msg = String(e.message || e);
      const code = msg.includes('admin_key_missing') ? 501 : 502;
      return res.status(code).json({ error: 'attach_failed', detail: msg });
    }
  });

  // Index seeds by category and optional tags
  app.get('/api/discourse/seeds', async (req, res) => {
    try {
      const category_id = req.query.category_id;
      const tags = (req.query.tags || '').split(',').filter(Boolean);
      if (!category_id) return res.status(400).json({ error: 'missing_category' });
  const data = await discourseGet(`/latest.json?category_id=${encodeURIComponent(category_id)}`, req);
      let topics = data?.topic_list?.topics || [];
      if (tags.length) topics = topics.filter((t) => Array.isArray(t.tags) && tags.every((tg) => t.tags.includes(tg)));
      return res.json({ topics });
    } catch (e) {
      return res.status(502).json({ error: 'index_failed' });
    }
  });

  // Discourse AI proxy (plugin endpoints). These require Discourse AI to be installed.
  app.post('/api/ai/search', async (req, res) => {
    try {
      const url = `${DISCOURSE_BASE_URL}/discourse_ai/search`;
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
  if (API_KEY && API_KEY !== 'change-me') { headers['Api-Key'] = API_KEY; headers['Api-Username'] = (getSessionUser(req)?.username) || 'system'; }
      const upstream = await fetchWithRetry(url, { method: 'POST', headers, body: JSON.stringify(req.body || {}) });
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
      return res.send(text);
    } catch (e) {
      return res.status(502).json({ error: 'ai_search_failed' });
    }
  });

  // AI Personas streaming proxy (adapts newline-delimited JSON -> SSE events)
  // Upstream confirmed working endpoint: POST /admin/plugins/discourse-ai/ai-personas/stream-reply
  // Input (internal canonical): { persona, topic_id?, query, model? }
  // Output SSE events: meta -> token -> done (or error)
  const AI_STREAM_METRICS = { requests: 0, perPersona: Object.create(null), tokens: 0, failures: 0 };
  app.post('/api/ai/stream', async (req, res) => {
    const sessionUser = getSessionUser(req);
    const { persona, topic_id, query, model } = req.body || {};
    // Basic validation
    if (!persona || !query) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(400).json({ error: 'missing_params', detail: 'persona and query are required' });
    }
    // Prepare upstream payload
    const upstreamPayload = {
      // Use system impersonation for confirmed working AI endpoints (matches test curl) regardless of session user
      username: 'system',
      query,
    };
    let personaSent = persona;
    if (personaSent === '0-NULL' && INTERNAL_DEFAULT_PERSONA_ID && /^[0-9]+$/.test(INTERNAL_DEFAULT_PERSONA_ID)) {
      personaSent = INTERNAL_DEFAULT_PERSONA_ID;
    }
    if (/^[0-9]+$/.test(String(personaSent))) upstreamPayload.persona_id = Number(personaSent);
    else upstreamPayload.persona_name = String(personaSent);
    if (typeof topic_id === 'number' || /^[0-9]+$/.test(String(topic_id))) upstreamPayload.topic_id = Number(topic_id);
    if (model) upstreamPayload.model = model;

    // Metrics bookkeeping
    AI_STREAM_METRICS.requests++;
    AI_STREAM_METRICS.perPersona[persona] = (AI_STREAM_METRICS.perPersona[persona] || 0) + 1;

    // Headers
    const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
    if (API_KEY && API_KEY !== 'change-me') {
      headers['Api-Key'] = API_KEY;
      // Force system for AI endpoints as upstream requires elevated persona access
      headers['Api-Username'] = 'system';
    }

    // Open SSE channel to client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const upstreamUrl = `${DISCOURSE_BASE_URL}/admin/plugins/discourse-ai/ai-personas/stream-reply`;
    let metaEmitted = false;
    try {
      async function attempt(payload, label) {
        console.log('[ai-stream] attempt', label, payload);
        try {
          const up = await fetch(upstreamUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
          if (!up.ok || !up.body) {
            let detail = '';
            try { detail = await up.text(); } catch {}
            return { ok: false, status: up.status, detail, label };
          }
          return { ok: true, upstream: up, label };
        } catch (e) {
          return { ok: false, status: 599, detail: String(e.message || e), label };
        }
      }
  let first = await attempt(upstreamPayload, 'primary');
      if (!first.ok) {
        console.warn('[ai-stream] primary attempt failed', { status: first.status, snippet: first.detail?.slice(0,200) });
      }
      let chosen = first;
      let usedPayload = upstreamPayload;
      let second = null;
      if (!first.ok) {
        if (upstreamPayload.persona_id) {
          const alt = { ...upstreamPayload, persona_name: String(persona) }; delete alt.persona_id;
          second = await attempt(alt, 'fallback_name');
          if (!second.ok) console.warn('[ai-stream] fallback_name failed', { status: second.status, snippet: second.detail?.slice(0,200) });
          if (second.ok) { chosen = second; usedPayload = alt; }
        } else if (upstreamPayload.persona_name && /^[0-9]+$/.test(String(persona))) {
          const alt = { ...upstreamPayload, persona_id: Number(persona) }; delete alt.persona_name;
          second = await attempt(alt, 'fallback_id');
          if (!second.ok) console.warn('[ai-stream] fallback_id failed', { status: second.status, snippet: second.detail?.slice(0,200) });
          if (second.ok) { chosen = second; usedPayload = alt; }
        }
      }
      if (!chosen.ok) {
        AI_STREAM_METRICS.failures++;
        res.write('event: error\n');
  res.write('data: ' + JSON.stringify({ error: 'upstream_failure', status_first: first.status, detail_first: first.detail?.slice(0,800), status_second: second?.status || null, detail_second: second?.detail?.slice(0,800) || null, persona_sent: persona, persona_effective: personaSent, attempted_payloads: { primary: upstreamPayload, fallback: usedPayload !== upstreamPayload ? usedPayload : null } }) + '\n\n');
        return res.end();
      }
      const upstream = chosen.upstream;
      console.log('[ai-stream] streaming start', chosen.label, usedPayload);
      const decoder = new TextDecoder();
      let buffer = '';
      upstream.body.on('data', (chunk) => {
        buffer += decoder.decode(chunk, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line) continue;
          let obj = null;
          try { obj = JSON.parse(line); } catch (e) {
            if (!metaEmitted) {
              AI_STREAM_METRICS.failures++;
              res.write('event: error\n');
              res.write('data: ' + JSON.stringify({ error: 'bad_upstream_line', line: line.slice(0,400), persona_sent: persona }) + '\n\n');
              return res.end();
            }
            continue;
          }
          if (obj.partial) {
            AI_STREAM_METRICS.tokens++;
            res.write('event: token\n');
            res.write('data: ' + JSON.stringify({ text: obj.partial }) + '\n\n');
          } else if (!metaEmitted && (obj.topic_id || obj.persona_id)) {
            metaEmitted = true;
            res.write('event: meta\n');
            res.write('data: ' + JSON.stringify(obj) + '\n\n');
          }
        }
      });
      upstream.body.on('end', () => {
        if (!res.writableEnded) {
          res.write('event: done\n');
          res.write('data: {}\n\n');
          res.end();
        }
      });
      upstream.body.on('error', () => {
        AI_STREAM_METRICS.failures++;
        try { res.write('event: error\n' + 'data: ' + JSON.stringify({ error: 'upstream_stream_error' }) + '\n\n'); } catch {}
        res.end();
      });
    } catch (e) {
      AI_STREAM_METRICS.failures++;
      try { res.write('event: error\n' + 'data: ' + JSON.stringify({ error: 'proxy_exception', message: String(e.message || e) }) + '\n\n'); } catch {}
      return res.end();
    }
  });

  // Metrics endpoint for debugging internal AI stream behavior
  app.get('/api/ai/metrics', (_req, res) => {
    res.json({ ...AI_STREAM_METRICS, now: Date.now() });
  });

  // Personas list proxy with caching & updated endpoint ordering
  const PERSONAS_CACHE = { ts: 0, data: null };
  app.get('/api/ai/personas', async (req, res) => {
    const now = Date.now();
    if (PERSONAS_CACHE.data && (now - PERSONAS_CACHE.ts) < 60_000) {
      return res.json(PERSONAS_CACHE.data);
    }
    const headers = { 'Accept': 'application/json' };
    if (API_KEY && API_KEY !== 'change-me') { headers['Api-Key'] = API_KEY; headers['Api-Username'] = (getSessionUser(req)?.username) || 'system'; }
    async function tryPath(path) {
      try {
        const r = await fetchWithRetry(`${DISCOURSE_BASE_URL}${path}`, { headers });
        if (!r.ok) return null;
        return await r.json();
      } catch { return null; }
    }
    // Preferred confirmed path first
    const candidates = [
      '/admin/plugins/discourse-ai/ai-personas.json',
      '/discourse_ai/personas',
      '/admin/plugins/discourse-ai/personas.json', // legacy guess
      '/discourse_ai/bot/personas',
    ];
    let personas = [];
    for (const p of candidates) {
      const data = await tryPath(p);
      if (data) {
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.personas)
            ? data.personas
            : Array.isArray(data?.rows)
              ? data.rows
              : [];
        personas = items.map((it) => ({
          id: it.id || it.slug || it.name,
          name: it.name || it.title || it.slug || String(it.id || ''),
          description: it.description || it.summary || '',
          default_llm: it.default_llm || null,
          slug: it.slug || null,
        })).filter((x) => x.id);
        if (personas.length) break;
      }
    }
    if (!personas.length) {
      // Minimal safe fallback – avoid inventing fictional personas that cause confusion.
      personas = [
        { id: '0-NULL', name: '0-NULL', description: 'Neutral baseline persona.' },
      ];
    }
    PERSONAS_CACHE.data = { personas }; PERSONAS_CACHE.ts = Date.now();
    return res.json({ personas });
  });

  // Static files in production; SPA fallback. In dev, redirect root to APP_BASE_URL.
  if (fs.existsSync(DIST_DIR)) {
    app.use(express.static(DIST_DIR));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      try { return res.sendFile(path.join(DIST_DIR, 'index.html')); } catch { return next(); }
    });
  } else {
    // In dev, the HTML and assets are served by Vite middleware from server/index.js on the same port
  }

  return app;
}
