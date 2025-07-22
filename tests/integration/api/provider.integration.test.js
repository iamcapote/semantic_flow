import request from 'supertest';
import { getApp } from '../../../server/index.js';

describe('API Integration: Provider', () => {
  let app;
  beforeAll(async () => {
    app = await getApp();
  });

  it('GET /api/providers returns provider configs', async () => {
    const res = await request(app.server).get('/api/providers');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/providers updates provider config', async () => {
    const res = await request(app.server)
      .post('/api/providers')
      .send({
        providerId: 'openai',
        name: 'OpenAI',
        baseURL: 'https://api.openai.com/v1',
        models: ['gpt-4o', 'gpt-4'],
        isActive: true,
        headers: {},
        userId: '00000000-0000-0000-0000-000000000000'
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('handles invalid provider config', async () => {
    const res = await request(app.server)
      .post('/api/providers')
      .send({ providerId: '', userId: '' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
