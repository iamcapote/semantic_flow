
import { test, expect } from '@playwright/test';

test.describe('E2E: Provider Setup and Security', () => {
  let page;
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    const siteUrl = process.env.VITE_SITE_URL || 'http://localhost:8081';
    await page.goto(siteUrl, { waitUntil: 'load' });
    await page.waitForTimeout(2000);
  });
  test.afterAll(async () => {
    await page.close();
  });

  test('sets up provider with valid API key', async () => {
    if (await page.isVisible('text=Get Started')) {
      await page.click('text=Get Started');
      await page.waitForTimeout(1000);
    }
    await page.waitForSelector('text=Configure AI Providers', { timeout: 5000 });
    await page.click('text=Configure AI Providers');
    await page.waitForSelector('input[placeholder="Enter your API key..."]', { timeout: 5000 });
    await page.fill('input[placeholder="Enter your API key..."]', 'sk-test-valid-key');
    if (await page.isVisible('text=Save & Continue')) {
      await page.click('text=Save & Continue');
    } else {
      await page.click('text=Save Settings');
    }
    await page.waitForSelector('text=Ready to proceed', { timeout: 5000 });
    expect(await page.isVisible('text=Ready to proceed')).toBe(true);
  });

  test('handles invalid API key gracefully', async () => {
    if (await page.isVisible('text=Get Started')) {
      await page.click('text=Get Started');
      await page.waitForTimeout(1000);
    }
    await page.waitForSelector('text=Configure AI Providers', { timeout: 5000 });
    await page.click('text=Configure AI Providers');
    await page.waitForSelector('input[placeholder="Enter your API key..."]', { timeout: 5000 });
    await page.fill('input[placeholder="Enter your API key..."]', '');
    if (await page.isVisible('text=Save & Continue')) {
      await page.click('text=Save & Continue');
    } else {
      await page.click('text=Save Settings');
    }
    await page.waitForSelector('text=Please configure at least one provider with an API key', { timeout: 5000 });
    expect(await page.isVisible('text=Please configure at least one provider with an API key')).toBe(true);
  });
});
