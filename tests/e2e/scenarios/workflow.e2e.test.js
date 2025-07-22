
import { chromium } from 'playwright';

jest.setTimeout(60000); // Increase timeout for slow E2E tests

describe('E2E: Workflow Creation and Execution', () => {
  let browser, page;
  beforeAll(async () => {
    browser = await chromium.launch();
    page = await browser.newPage();
    const siteUrl = process.env.VITE_SITE_URL || 'http://localhost:8081';
    await page.goto(siteUrl);
  });
  afterAll(async () => {
    await browser.close();
  });

  it('creates a new workflow', async () => {
    await page.click('text=New Workflow');
    await page.fill('input[name="workflowName"]', 'Test Workflow');
    await page.click('text=Save');
    expect(await page.isVisible('text=Test Workflow')).toBe(true);
  });

  it('executes workflow and displays results', async () => {
    await page.click('text=Test Workflow');
    await page.click('text=Run Workflow');
    expect(await page.isVisible('text=Execution Complete')).toBe(true);
  });
});
