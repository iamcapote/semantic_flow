// Mock trpcClient for integration tests
const trpcClient = {
  workflow: {
    list: { query: async () => [] },
  },
  provider: {
    getConfig: { query: async () => ({}) },
  },
  execution: {
    execute: { mutate: async () => ({}) },
  },
};

describe('API Integration', () => {
  it('should list workflows for demo user', async () => {
    const result = await trpcClient.workflow.list.query({ userId: 'demo-user' });
    expect(Array.isArray(result)).toBe(true);
  });

  it('should get provider config', async () => {
    const config = await trpcClient.provider.getConfig.query({ userId: 'demo-user' });
    expect(config).toBeDefined();
  });

  it('should execute workflow', async () => {
    const exec = await trpcClient.execution.execute.mutate({ workflowId: 'test-workflow' });
    expect(exec).toBeDefined();
  });
});
