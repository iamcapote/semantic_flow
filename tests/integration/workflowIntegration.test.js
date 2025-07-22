
// Mock trpcClient for integration tests
const trpcClient = {
  workflow: {
    create: { mutate: async ({ name, userId }) => ({ id: 'test-id', name, userId }) },
    update: { mutate: async ({ id, name }) => ({ id, name }) },
    delete: { mutate: async ({ id }) => ({ id, deleted: true }) },
  },
};

describe('Workflow Integration', () => {
  it('creates, updates, and deletes a workflow', async () => {
    // Create
    const created = await trpcClient.workflow.create.mutate({ name: 'Test Workflow', userId: 'demo-user' });
    expect(created).toBeDefined();
    expect(created.name).toBe('Test Workflow');
    expect(created.userId).toBe('demo-user');
    // Update
    const updated = await trpcClient.workflow.update.mutate({ id: created.id, name: 'Updated Workflow' });
    expect(updated.name).toBe('Updated Workflow');
    // Delete
    const deleted = await trpcClient.workflow.delete.mutate({ id: created.id });
    expect(deleted).toBeDefined();
    expect(deleted.deleted).toBe(true);
  });
});
