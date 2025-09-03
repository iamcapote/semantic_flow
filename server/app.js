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

  // Public config (no secrets)
  app.get('/api/config', (_req, res) => {
    res.json({
      discourseBaseUrl: DISCOURSE_BASE_URL,
      ssoProvider: !!DISCOURSE_SSO_SECRET,
      appBaseUrl: APP_BASE_URL,
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

  async function discourseGet(pathname) {
    const url = `${DISCOURSE_BASE_URL}${pathname}`;
    const headers = { 'Accept': 'application/json' };
    if (API_KEY && API_KEY !== 'change-me') {
      headers['Api-Key'] = API_KEY;
      headers['Api-Username'] = 'system';
    }
    const r = await fetchWithRetry(url, { headers });
    if (!r.ok) {
      const text = await r.text();
      throw new Error(`Discourse error ${r.status}: ${text}`);
    }
    return r.json();
  }

  async function discoursePost(pathname, body) {
    if (!API_KEY || API_KEY === 'change-me') throw new Error('admin_key_missing');
    const url = `${DISCOURSE_BASE_URL}${pathname}`;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': API_KEY,
      'Api-Username': 'system',
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
      const data = await discourseGet(`/latest.json?page=${page}`);
      return res.json(data);
    } catch (e) {
      return res.status(502).json({ error: 'proxy_failed' });
    }
  });

  // Topic detail
  app.get('/api/discourse/topic/:id', async (req, res) => {
    try {
      const id = encodeURIComponent(req.params.id);
      const data = await discourseGet(`/t/${id}.json`);
      return res.json(data);
    } catch (e) {
      return res.status(502).json({ error: 'proxy_failed' });
    }
  });

  // PM inbox for a username (read-only)
  app.get('/api/discourse/pm/:username', async (req, res) => {
    try {
      const u = encodeURIComponent(req.params.username);
      const data = await discourseGet(`/topics/private-messages/${u}.json`);
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
      });
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
      });
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
      const data = await discourseGet(`/latest.json?category_id=${encodeURIComponent(category_id)}`);
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
      if (API_KEY && API_KEY !== 'change-me') { headers['Api-Key'] = API_KEY; headers['Api-Username'] = 'system'; }
      const upstream = await fetchWithRetry(url, { method: 'POST', headers, body: JSON.stringify(req.body || {}) });
      const text = await upstream.text();
      res.status(upstream.status);
      res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
      return res.send(text);
    } catch (e) {
      return res.status(502).json({ error: 'ai_search_failed' });
    }
  });

  // Stream completion proxy (pipes text/event-stream)
  app.post('/api/ai/stream', async (req, res) => {
    try {
      const url = `${DISCOURSE_BASE_URL}/discourse_ai/stream_completion`;
      const headers = {
        'Accept': 'text/event-stream',
        'Content-Type': 'application/json',
      };
      if (API_KEY && API_KEY !== 'change-me') { headers['Api-Key'] = API_KEY; headers['Api-Username'] = 'system'; }
      const upstream = await fetch(url, { method: 'POST', headers, body: JSON.stringify(req.body || {}) });
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();
      if (!upstream.ok || !upstream.body) {
        res.write(`event: error\n` + `data: {"status":${upstream.status}}\n\n`);
        return res.end();
      }
      upstream.body.on('data', (chunk) => {
        res.write(chunk);
      });
      upstream.body.on('end', () => res.end());
      upstream.body.on('error', () => res.end());
    } catch (e) {
      try { res.write(`event: error\n` + `data: {"message":"proxy_error"}\n\n`); } catch {}
      return res.end();
    }
  });

  // Personas list proxy (best-effort; returns [] if plugin/endpoint unavailable)
  app.get('/api/ai/personas', async (_req, res) => {
    const headers = { 'Accept': 'application/json' };
    if (API_KEY && API_KEY !== 'change-me') { headers['Api-Key'] = API_KEY; headers['Api-Username'] = 'system'; }
    async function tryPath(path) {
      try {
        const r = await fetchWithRetry(`${DISCOURSE_BASE_URL}${path}`, { headers });
        if (!r.ok) return null;
        return await r.json();
      } catch { return null; }
    }
    // Try likely endpoints in order
    const candidates = [
      '/discourse_ai/personas',
      '/admin/plugins/discourse-ai/personas.json',
      '/discourse_ai/bot/personas',
    ];
    for (const p of candidates) {
      const data = await tryPath(p);
      if (data) {
        // Normalize a simple list: [{id, name, description?}]
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.personas)
            ? data.personas
            : Array.isArray(data?.rows)
              ? data.rows
              : [];
        const personas = items.map((it) => ({
          id: it.id || it.slug || it.name,
          name: it.name || it.title || it.slug || String(it.id || ''),
          description: it.description || it.summary || '',
        })).filter((x) => x.id);
        return res.json({ personas });
      }
    }
    // Fallback default
    return res.json({ personas: [
      { id: 'default', name: 'Default' },
      { id: 'coder', name: 'Coder' },
      { id: 'researcher', name: 'Researcher' },
    ]});
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
