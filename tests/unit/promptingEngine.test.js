import PromptingEngine from '../../src/lib/promptingEngine.js';

describe('PromptingEngine', () => {
  const engine = new PromptingEngine('test-user');

  it('converts text to workflow', async () => {
    const result = await engine.convertTextToWorkflow('Test input', 'test-key');
    expect(result).toBeDefined();
  });

  // Add more tests for other modes as implemented
});
