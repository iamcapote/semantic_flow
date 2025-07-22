// Example test data for workflows, nodes, and API keys

export const validNode = {
  id: 'node-1',
  type: 'statement', // Add top-level type for schema validation
  position: { x: 0, y: 0 },
  data: {
    type: 'statement',
    label: 'Valid Statement',
    content: 'Test content',
    metadata: {
      cluster: 'Proposition',
      tags: ['logic'],
      description: 'A valid statement node',
      createdAt: '2025-07-20T00:00:00Z',
      updatedAt: '2025-07-20T00:00:00Z',
      title: 'Valid Statement Node', // Ensure title exists for export tests
    },
    ports: {
      inputs: [],
      outputs: []
    },
    config: {
      isExecutable: true,
      requiresInput: false,
      maxInputs: 1,
      maxOutputs: 1
    }
  },
  style: {
    backgroundColor: '#fff',
    borderColor: '#000',
    width: 200,
    height: 100
  }
};

// Invalid node shape for negative test cases
export const invalidNode = {
  id: null,
  type: '',
  data: {},
  position: null,
  selected: false,
  isConnectable: false,
};

export const validWorkflow = {
  id: 'workflow-1',
  nodes: [validNode],
  edges: [],
  metadata: {
    title: 'workflow-1',
    description: 'A valid workflow for testing',
    createdAt: '2025-07-20T00:00:00Z',
    updatedAt: '2025-07-20T00:00:00Z',
  },
  version: '1.0.0',
  content: 'Test workflow content', // Add content for export tests
};

export const invalidWorkflow = {
  id: 'workflow-2',
  nodes: [invalidNode],
  edges: [],
};

export const validApiKey = 'sk-test-valid-key';
export const invalidApiKey = '';
