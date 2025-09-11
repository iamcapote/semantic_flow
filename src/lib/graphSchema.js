// Graph JSON Schema for Semantic-Logic AI Workflow Builder
// This file defines the data contracts between front-end and back-end

import { NODE_TYPES, CLUSTER_COLORS } from './ontology.js';

export const GRAPH_SCHEMA_VERSION = "1.0.0";

// Port types for semantic node connections
export const PORT_TYPES = {
  INPUT: 'input',
  OUTPUT: 'output',
  PREMISE: 'premise',
  CONCLUSION: 'conclusion',
  CONDITION: 'condition',
  EVIDENCE: 'evidence',
  HYPOTHESIS: 'hypothesis'
};

// Edge condition grammar for logical connections
export const EDGE_CONDITIONS = {
  IMPLIES: 'implies',
  SUPPORTS: 'supports',
  CONTRADICTS: 'contradicts',
  REFINES: 'refines',
  EXEMPLIFIES: 'exemplifies',
  FOLLOWS: 'follows',
  ENABLES: 'enables',
  DEPENDS_ON: 'depends_on'
};

// Workflow execution states
export const EXECUTION_STATES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PAUSED: 'paused'
};

// Node schema definition
export const createNodeSchema = () => ({
  id: '', // Unique identifier
  type: '', // Node type code from ontology (e.g., 'PROP-STM')
  position: { x: 0, y: 0 }, // Canvas position
  data: {
    label: '', // Display label (derived from title when present)
    title: '', // Node title (primary display)
    tags: [], // Node tags
    description: '', // Node description
    content: '', // Node content/value
    language: 'markdown', // Preferred content/fields language per node
    fields: [], // Custom key/value pairs only
    metadata: {
      cluster: '', // Ontology cluster (PROP, INQ, etc.)
      tags: [], // Deprecated: use data.tags
      description: '', // Deprecated: use data.description
      createdAt: '', // ISO timestamp
      updatedAt: '' // ISO timestamp
    },
    ports: {
      inputs: [], // Array of input port definitions
      outputs: [] // Array of output port definitions
    },
    config: {
      isExecutable: false, // Can this node be executed?
      requiresInput: false, // Must have incoming edges?
      maxInputs: null, // Maximum input connections (null = unlimited)
      maxOutputs: null // Maximum output connections (null = unlimited)
    }
  },
  style: {
    backgroundColor: '', // Cluster color
    borderColor: '',
  width: 320,
  height: 220
  }
});

// Edge schema definition
export const createEdgeSchema = () => ({
  id: '', // Unique identifier
  source: '', // Source node ID
  target: '', // Target node ID
  sourceHandle: '', // Source port ID
  targetHandle: '', // Target port ID
  type: 'smoothstep', // React Flow edge type
  data: {
    condition: '', // Logical condition (IMPLIES/SUPPORTS/etc.)
    operator: 'related', // Semantic operator (see edges.js)
    weight: 1.0, // Connection strength (0.0 - 1.0)
    metadata: {
      label: '', // Optional edge label
      description: '', // Edge description
      createdAt: '', // ISO timestamp
      isActive: true // Is this edge active in execution?
    }
  },
  style: {
    stroke: '#64748B',
    strokeWidth: 2
  }
});

// Complete workflow/graph schema
export const createWorkflowSchema = () => ({
  id: '', // Unique workflow identifier
  version: GRAPH_SCHEMA_VERSION,
  metadata: {
    title: '', // Workflow title
    description: '', // Workflow description
    author: '', // Creator
    createdAt: '', // ISO timestamp
    updatedAt: '', // ISO timestamp
    tags: [], // Workflow tags for organization
    isPublic: false, // Public visibility
    forkCount: 0 // Number of times forked
  },
  nodes: [], // Array of node schemas
  edges: [], // Array of edge schemas
  configs: [], // Array of AI model configurations
  execution: {
    state: EXECUTION_STATES.PENDING,
    currentNode: null, // Currently executing node ID
    startedAt: null, // Execution start time
    completedAt: null, // Execution completion time
    results: [], // Execution results
    errors: [] // Execution errors
  },
  viewport: {
    x: 0,
    y: 0,
    zoom: 1
  }
});

// AI Model Configuration schema
export const createConfigSchema = () => ({
  id: '', // Unique config identifier
  name: '', // Configuration name
  model: 'gpt-4o-mini', // AI model identifier
  parameters: {
    temperature: 0.7, // Response randomness (0.0 - 2.0)
    maxTokens: 4096, // Maximum response tokens
    topP: 1.0, // Nucleus sampling parameter
    frequencyPenalty: 0.0, // Frequency penalty (-2.0 to 2.0)
    presencePenalty: 0.0 // Presence penalty (-2.0 to 2.0)
  },
  systemPrompt: 'You are a helpful assistant processing semantic logic workflows.',
  isDefault: false, // Is this the default config?
  createdAt: '', // ISO timestamp
  updatedAt: '' // ISO timestamp
});

// Execution result schema
export const createExecutionResultSchema = () => ({
  nodeId: '', // Node that produced this result
  timestamp: '', // ISO timestamp
  input: '', // Input to the node
  output: '', // Output from the node
  metadata: {
    duration: 0, // Execution time in milliseconds
    tokenUsage: {
      prompt: 0,
      completion: 0,
      total: 0
    },
    model: '', // Model used for this execution
    confidence: null // Optional confidence score
  }
});

// Validation functions for schema compliance
export const validateNode = (node) => {
  const errors = [];
  
  if (!node.id) errors.push('Node ID is required');
  if (!node.type) errors.push('Node type is required');
  if (!node.data?.label) errors.push('Node label is required');
  if (!node.data?.metadata?.cluster) errors.push('Node cluster is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateEdge = (edge) => {
  const errors = [];
  
  if (!edge.id) errors.push('Edge ID is required');
  if (!edge.source) errors.push('Edge source is required');
  if (!edge.target) errors.push('Edge target is required');
  if (!edge.data?.condition) errors.push('Edge condition is required');
  if (!edge.data?.operator) errors.push('Edge operator is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateWorkflow = (workflow) => {
  const errors = [];
  
  if (!workflow.id) errors.push('Workflow ID is required');
  if (!workflow.metadata?.title) errors.push('Workflow title is required');
  if (!Array.isArray(workflow.nodes)) errors.push('Nodes must be an array');
  if (!Array.isArray(workflow.edges)) errors.push('Edges must be an array');
  
  // Validate all nodes
  workflow.nodes?.forEach((node, index) => {
    const nodeValidation = validateNode(node);
    if (!nodeValidation.isValid) {
      errors.push(`Node ${index}: ${nodeValidation.errors.join(', ')}`);
    }
  });
  
  // Validate all edges
  workflow.edges?.forEach((edge, index) => {
    const edgeValidation = validateEdge(edge);
    if (!edgeValidation.isValid) {
      errors.push(`Edge ${index}: ${edgeValidation.errors.join(', ')}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility functions for working with graphs
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createNode = (type, position, content = '') => {
  const nodeSchema = createNodeSchema();
  const nodeTypeData = NODE_TYPES[type];
  
  if (!nodeTypeData) {
    throw new Error(`Unknown node type: ${type}`);
  }
  // Build canonical array-of-fields (core first). Blank nodes come without fields.
  const coreFields = type === 'UTIL-BLANK' ? [] : [
    { name: 'title', type: 'text', value: nodeTypeData.label || 'Node' },
    { name: 'tags', type: 'tags', value: Array.isArray(nodeTypeData.tags) ? nodeTypeData.tags : [] },
    { name: 'ontology-type', type: 'text', value: type },
    { name: 'description', type: 'longText', value: nodeTypeData.description || '' },
    { name: 'content', type: 'longText', value: content || '' },
    { name: 'icon', type: 'text', value: nodeTypeData.icon || '📦' }
  ];

  return {
    ...nodeSchema,
    id: generateId(),
    type,
    position,
    width: 320,
    height: 220,
    data: {
      ...nodeSchema.data,
      label: type === 'UTIL-BLANK' ? 'Blank Node' : nodeTypeData.label,
      title: type === 'UTIL-BLANK' ? 'Blank Node' : nodeTypeData.label,
      tags: type === 'UTIL-BLANK' ? [] : (nodeTypeData.tags || []),
      description: type === 'UTIL-BLANK' ? '' : (nodeTypeData.description || ''),
      content: content || '',
      language: 'markdown',
      // Canonical storage (array of pairs including core keys)
      fields: coreFields,
      metadata: {
        ...nodeSchema.data.metadata,
        cluster: nodeTypeData.cluster,
        tags: nodeTypeData.tags,
        description: nodeTypeData.description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    style: {
      ...nodeSchema.style,
      backgroundColor: CLUSTER_COLORS[nodeTypeData.cluster]
    }
  };
};

export const createEdge = (sourceId, targetId, condition = EDGE_CONDITIONS.FOLLOWS, operator = 'related') => {
  const edgeSchema = createEdgeSchema();
  
  return {
    ...edgeSchema,
    id: generateId(),
    source: sourceId,
    target: targetId,
    data: {
      ...edgeSchema.data,
      condition,
      operator,
      metadata: {
        ...edgeSchema.data.metadata,
        createdAt: new Date().toISOString()
      }
    }
  };
};
