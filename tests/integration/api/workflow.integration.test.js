import request from 'supertest';
import { getApp } from '../../../server/index.js';

describe('API Integration: Workflow', () => {
  let app;
  beforeAll(async () => {
    app = await getApp();
  });

  it('GET /api/workflows returns list of workflows', async () => {
    const res = await request(app.server).get('/api/workflows');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/workflows creates a workflow', async () => {
    const res = await request(app.server)
      .post('/api/workflows')
      .send({
        title: 'Test Workflow',
        description: 'Integration test workflow',
        content: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
        userId: '00000000-0000-0000-0000-000000000000'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBeDefined();
  });

  it('handles invalid workflow creation', async () => {
    const res = await request(app.server)
      .post('/api/workflows')
      .send({ title: '', userId: '' });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
  });
});
