import { createApp } from './app.js';
import fs from 'fs';
import path from 'path';

const PORT = Number(process.env.PORT || process.env.APP_PORT || 8081);
const app = createApp();

// In development (without a dist build), mount Vite as middleware so the whole app runs on one port
if ((process.env.NODE_ENV || 'development') !== 'production' && !fs.existsSync(path.join(process.cwd(), 'dist'))) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  // Vite dev middleware (assets, HMR)
  app.use(vite.middlewares);
  // HTML fallback through Vite transform for SPA routes
  app.use(async (req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.originalUrl && req.originalUrl.startsWith('/api/')) return next();
    try {
      const url = req.originalUrl || '/';
      const template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).setHeader('Content-Type', 'text/html').end(html);
    } catch (e) {
      next(e);
    }
  });
}

app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
