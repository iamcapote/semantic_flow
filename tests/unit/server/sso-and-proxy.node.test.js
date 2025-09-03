/**
 * @jest-environment node
 */
import request from 'supertest';
import crypto from 'crypto';

// Mock ESM default exports for node-fetch and jsonwebtoken
jest.mock('node-fetch', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ __esModule: true, default: { sign: () => 'stub.jwt.token', verify: () => ({ user: { username: 'tester' } }) } }));

import fetch from 'node-fetch';

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');
const hmac = (secret, payload) => crypto.createHmac('sha256', secret).update(payload).digest('hex');

describe('server sso + proxy', () => {
  const SECRET = 's3cret';
  const BASE = 'https://hub.example.org';
  const APP = 'http://localhost:8081';

  let app;
  beforeAll(async () => {
    process.env.DISCOURSE_SSO_SECRET = SECRET;
    process.env.DISCOURSE_BASE_URL = BASE;
    process.env.APP_BASE_URL = APP;
    process.env.API_KEY = 'change-me';
    const mod = await import('../../../server/app.js');
    app = mod.createApp();
  });

  afterEach(() => {
    fetch.mockReset();
  });

  test('health + public config', async () => {
    const health = await request(app).get('/api/health');
    expect(health.status).toBe(200);
    const cfg = await request(app).get('/api/config');
    expect(cfg.status).toBe(200);
    expect(cfg.body.discourseBaseUrl).toBe(BASE);
  });

  test('me unauthenticated returns 401', async () => {
    const me = await request(app).get('/api/me');
    expect(me.status).toBe(401);
  });

  test('sso login redirects to Discourse provider', async () => {
    const r = await request(app).get('/api/sso/login');
    expect(r.status).toBe(302);
    expect(r.headers.location).toContain('/session/sso_provider');
    expect(r.headers.location).toContain('sso=');
    expect(r.headers.location).toContain('sig=');
    // Nonce cookie set
    const setCookie = r.headers['set-cookie']?.join(';') || '';
    expect(setCookie).toContain('sf_sso_nonce=');
  });

  test('sso callback sets session and redirects to /discourse', async () => {
    // Prepare payload from discourse with matching nonce
    const nonce = 'abc123';
    const profile = new URLSearchParams({
      nonce,
      external_id: 'u-1',
      username: 'tester',
      email: 't@example.com',
      name: 'T User',
      admin: 'true',
      groups: 'staff,mods',
      avatar_url: 'https://example.com/a.png',
      return_sso_url: `${APP}/api/sso/callback`,
    }).toString();
    const sso = b64(profile);
    const sig = hmac(SECRET, sso);

    const r = await request(app)
      .get(`/api/sso/callback?sso=${encodeURIComponent(sso)}&sig=${sig}`)
      .set('Cookie', [`sf_sso_nonce=${nonce}`]);

    expect(r.status).toBe(302);
    expect(r.headers.location).toBe(`${APP}/discourse`);
    const cookies = r.headers['set-cookie']?.join(';') || '';
    expect(cookies).toContain('sf_session=');
    expect(cookies).toContain('sf_csrf=');
  });

  test('proxy latest + topic (mocked)', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ topic_list: { topics: [{ id: 1, title: 'Hi' }] } }) });
    const latest = await request(app).get('/api/discourse/latest?page=0');
    expect(latest.status).toBe(200);
    expect(latest.body.topic_list.topics[0].id).toBe(1);

    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 42, title: 'Topic' }) });
    const topic = await request(app).get('/api/discourse/topic/42');
    expect(topic.status).toBe(200);
    expect(topic.body.id).toBe(42);
  });

  test('logout requires CSRF and clears cookies', async () => {
    const res = await request(app).post('/api/logout');
    expect(res.status).toBe(403);

    const ok = await request(app)
      .post('/api/logout')
      .set('Cookie', ['sf_csrf=token'])
      .set('x-csrf-token', 'token');
    expect(ok.status).toBe(200);
  });
});
