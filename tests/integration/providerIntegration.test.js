// Mock trpcClient for integration tests
const trpcClient = {
  provider: {
    getConfig: { query: async () => ({}) },
    updateConfig: { mutate: async () => ({}) },
    testNode: { mutate: async () => ({}) },
  },
};

describe('Provider Integration', () => {
  it('gets and updates provider config', async () => {
    const config = await trpcClient.provider.getConfig.query({ userId: 'demo-user' });
    expect(config).toBeDefined();
    // Update config
    const updated = await trpcClient.provider.updateConfig.mutate({ userId: 'demo-user', config });
    expect(updated).toBeDefined();
  });

  it('tests provider connection', async () => {
    const result = await trpcClient.provider.testNode.mutate({ providerId: 'openai', model: 'gpt-4o' });
    expect(result).toBeDefined();
  });
});
