import fs from 'fs';
import path from 'path';

describe('server routes (static analysis)', () => {
  test('server/app.js declares expected endpoints', () => {
    const filePath = path.resolve(__dirname, '../../../server/app.js');
    const src = fs.readFileSync(filePath, 'utf8');

    const expectations = [
      { method: 'get', path: "/api/health" },
      { method: 'get', path: "/api/config" },
      { method: 'get', path: "/api/sso/login" },
      { method: 'get', path: "/api/sso/callback" },
      { method: 'post', path: "/api/logout" },
      { method: 'get', path: "/api/me" },
      { method: 'get', path: "/api/discourse/latest" },
      { method: 'get', path: "/api/discourse/topic/:id" },
    ];

    for (const { method, path: p } of expectations) {
      const pattern = new RegExp(`app\\.${method}\\(\\s*['\"]${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]`);
      expect(pattern.test(src)).toBe(true);
    }
  });
});
