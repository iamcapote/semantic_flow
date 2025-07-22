import PromptingEngine from '../../src/lib/promptingEngine.js';

describe('PromptingEngine', () => {
  const trpcClient = { /* mock tRPC client */ };
  const engine = new PromptingEngine(trpcClient, 'test-user');

  it('converts text to workflow', async () => {
    const result = await engine.convertTextToWorkflow('Test input', 'test-key');
    expect(result).toBeDefined();
  });

  // Add more tests for other modes as implemented
});
