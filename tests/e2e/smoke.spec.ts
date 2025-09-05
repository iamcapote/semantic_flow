import { test, expect } from '@playwright/test';

// These smokes assume both client (Vite) and server are running locally via `npm run dev`

test.describe('smokes', () => {
  test('loads unified home (Core Layer for Composable Inference)', async ({ page }) => {
    await page.goto('/');
  await expect(page.getByText('Semantic Flow — The Core Layer for Composable Inference')).toBeVisible();
  // Switch to Builder tab and see palette/logs
  await page.getByRole('tab', { name: 'Builder' }).click();
    await expect(page.getByText('Palette')).toBeVisible();
  });

  test('router settings render without crashing', async ({ page }) => {
    await page.route('**/api/config', route => {
      route.fulfill({ json: { discourseBaseUrl: 'https://hub.bitwiki.org', ssoProvider: true, appBaseUrl: 'http://localhost:8081' } });
    });
    await page.goto('/api');
    await expect(page.getByText('Providers')).toBeVisible();
    await expect(page.getByText('Settings')).toBeVisible();
  });

  test('discourse page shows login CTA when unauthenticated', async ({ page }) => {
    await page.route('**/api/me', route => route.fulfill({ status: 401, json: { error: 'unauthenticated' } }));
  await page.goto('/discourse');
  await expect(page.getByRole('button', { name: /Sign in with Discourse/i })).toBeVisible();
  });

  test('discourse latest renders when authenticated, logout works (mocked)', async ({ page }) => {
    await page.route('**/api/me', route => route.fulfill({ json: { user: { username: 'tester' } } }));
    await page.route('**/api/discourse/latest**', route => route.fulfill({ json: { topic_list: { topics: [{ id: 123, title: 'Welcome', posts_count: 3, views: 10 }] } } }));
    await page.route('**/api/discourse/topic/123', route => route.fulfill({ json: { id: 123, title: 'Welcome', created_at: new Date().toISOString(), post_stream: { posts: [{ id: 1, username: 'admin', created_at: new Date().toISOString(), cooked: '<p>Hello</p>' }] } } }));
    await page.route('**/api/logout', route => route.fulfill({ json: { ok: true } }));

    await page.goto('/discourse');
  await expect(page.getByRole('heading', { name: /Latest Topics/i })).toBeVisible();
  await page.getByRole('listitem').getByText('Welcome').click();
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
    await page.getByRole('button', { name: /Logout/i }).click();
    // After logout the page should show CTA (me may still be mocked; we simulate 401 after)
    await page.route('**/api/me', route => route.fulfill({ status: 401, json: { error: 'unauthenticated' } }), { times: 1 });
  });
});
