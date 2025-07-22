import WorkflowExecutionEngine from '../../src/lib/WorkflowExecutionEngine.js';

describe('WorkflowExecutionEngine', () => {
  const toast = jest.fn();
  const engine = new WorkflowExecutionEngine('test-user', toast);
  const workflow = {
    nodes: [
      {
        id: '1',
        type: 'PROP-STM',
        data: { content: 'Test' }
      }
    ],
    edges: []
  };

  it('should not execute empty workflow', async () => {
    await expect(engine.executeWorkflow({ nodes: [], edges: [] })).rejects.toThrow();
  });

  it('should prepare node input', () => {
    const input = engine.prepareNodeInput(workflow.nodes[0], {}, workflow);
    expect(input).toBeDefined();
  });

  it('should get execution order', () => {
    const order = engine.getExecutionOrder(workflow);
    expect(Array.isArray(order)).toBe(true);
  });

  it('should test single node', async () => {
    const result = await engine.testSingleNode('1', 'PROP-STM', 'Test', 'openai', 'gpt-4o');
    expect(result).toBeDefined();
  });
});
