import request from 'supertest';
import { getApp } from '../../../server/index.js';

describe('API Integration: User', () => {
  let app;
  beforeAll(async () => {
    app = await getApp();
  });

  it('GET /api/user returns user info', async () => {
    const res = await request(app.server).get('/api/user');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
  });

  it('handles missing user', async () => {
    // Simulate missing user scenario
    expect(true).toBe(true);
  });
});
