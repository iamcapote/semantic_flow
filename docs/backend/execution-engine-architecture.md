# Execution Engine Architecture

This document outlines the architecture for the Semantic-Logic AI Workflow execution engine.

## Overview

The execution engine is responsible for processing a workflow graph by traversing nodes in a topological order, evaluating conditions, and executing the logic associated with each node type.

## Core Components

### 1. Graph Processing

The engine processes graphs using a topological sort to ensure that nodes are executed in the correct order (dependencies before dependents).

```typescript
function topologicalSort(nodes: Node[], edges: Edge[]): Node[] {
  // Implementation using Kahn's algorithm
  // 1. Find nodes with no incoming edges
  // 2. Remove these nodes and their outgoing edges
  // 3. Repeat until all nodes are processed or cycle detected
}
```

### 2. Execution Context

The execution context maintains the state throughout the workflow execution:

```typescript
interface ExecutionContext {
  symbols: Record<string, any>;  // Symbol table for variables
  traces: Array<{                // Execution traces for debugging
    nodeId: string;
    timestamp: string;
    action: string;
    result: any;
  }>;
  errors: Array<{               // Errors encountered
    nodeId: string;
    message: string;
    severity: "warning" | "error";
  }>;
  metadata: {                   // Runtime metadata
    startTime: string;
    lastNodeExecuted: string;
    tokenUsage?: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
}
```

### 3. Node Handler Registry

Each node type (PROP-*, RSN-*, etc.) is associated with a handler function:

```typescript
type NodeHandler = (node: Node, context: ExecutionContext) => Promise<ExecutionContext>;

const handlers: Record<string, NodeHandler> = {
  // Proposition Cluster
  "PROP": handleProposition,
  
  // Reasoning Cluster
  "RSN": handleReasoning,
  
  // Evaluation Gates
  "EVL": handleEvaluation,
  
  // Control Structures
  "CTL": handleControl,
  
  // Error Handling
  "ERR": handleError,
  
  // ... other handlers
};
```

### 4. Main Execution Flow

```typescript
async function executeGraph(graph: GraphSchema, config: Config, initialContext?: any): Promise<ExecutionResult> {
  // Initialize context
  let ctx: ExecutionContext = createInitialContext(initialContext);
  
  // Sort nodes topologically
  const sortedNodes = topologicalSort(graph.nodes, graph.edges);
  
  // Execute each node in order
  for (const node of sortedNodes) {
    try {
      // Check if we should execute this node (evaluate edge conditions)
      if (!shouldExecuteNode(node, graph.edges, ctx)) {
        continue;
      }
      
      // Get the appropriate handler for this node type
      const handlerPrefix = node.kind.split('-')[0]; // e.g., "PROP", "RSN"
      const handler = handlers[handlerPrefix];
      
      if (!handler) {
        throw new Error(`No handler found for node kind: ${node.kind}`);
      }
      
      // Execute the node handler
      ctx = await handler(node, ctx);
      
      // Add trace
      ctx.traces.push({
        nodeId: node.id,
        timestamp: new Date().toISOString(),
        action: `Executed ${node.kind}`,
        result: summarizeResult(node, ctx)
      });
      
    } catch (error) {
      // Handle errors
      ctx.errors.push({
        nodeId: node.id,
        message: error.message,
        severity: "error"
      });
      
      // Decide whether to continue or abort
      if (isFailFastError(error)) {
        return {
          status: "error",
          message: error.message,
          nodeId: node.id,
          context: ctx
        };
      }
    }
  }
  
  // Execution completed successfully
  return {
    status: "success",
    result: extractResult(ctx),
    context: ctx
  };
}
```

## Node Type Handlers

### Proposition Handler

```typescript
async function handleProposition(node: Node, ctx: ExecutionContext): Promise<ExecutionContext> {
  const newCtx = { ...ctx };
  
  // Handle different proposition types
  switch (node.kind) {
    case NodeKind.PROP_STM: // Statement
      newCtx.symbols[node.id] = {
        type: "statement",
        content: node.payload.content,
        truthValue: node.payload.truthValue
      };
      break;
    
    case NodeKind.PROP_CLM: // Claim
      // Similar to statement but with assertion strength
      break;
    
    // Other proposition types...
    
    default:
      throw new Error(`Unsupported proposition kind: ${node.kind}`);
  }
  
  return newCtx;
}
```

### Reasoning Handler

```typescript
async function handleReasoning(node: Node, ctx: ExecutionContext): Promise<ExecutionContext> {
  const newCtx = { ...ctx };
  
  switch (node.kind) {
    case NodeKind.RSN_DED: // Deduction
      // Get input values from incoming edges
      const premise1 = getNodeInput(node, "premise1", ctx);
      const premise2 = getNodeInput(node, "premise2", ctx);
      
      // Apply deduction logic
      const result = applyDeduction(premise1, premise2);
      
      // Store result in context
      newCtx.symbols[node.id] = {
        type: "deduction",
        result
      };
      break;
    
    // Other reasoning types...
    
    default:
      throw new Error(`Unsupported reasoning kind: ${node.kind}`);
  }
  
  return newCtx;
}
```

### Evaluation Gates

```typescript
async function handleEvaluation(node: Node, ctx: ExecutionContext): Promise<ExecutionContext> {
  const newCtx = { ...ctx };
  
  switch (node.kind) {
    case NodeKind.EVL_CON: // Consistency Check
      const statements = getNodeInputs(node, ctx);
      const isConsistent = checkConsistency(statements);
      
      if (!isConsistent) {
        throw new GateFailError(`Consistency check failed at node ${node.id}`);
      }
      
      newCtx.symbols[node.id] = {
        type: "gate",
        passed: true
      };
      break;
    
    // Other evaluation types...
    
    default:
      throw new Error(`Unsupported evaluation kind: ${node.kind}`);
  }
  
  return newCtx;
}
```

### LLM Integration

For nodes that require AI reasoning (like CTL_ABD for abduction):

```typescript
async function handleAIReasoning(node: Node, ctx: ExecutionContext, config: Config): Promise<ExecutionContext> {
  const newCtx = { ...ctx };
  
  // Prepare prompt for LLM
  const prompt = preparePromptForNode(node, ctx);
  
  // Call OpenAI with appropriate parameters from config
  const response = await callOpenAI({
    model: config.modelSlug,
    messages: [
      { role: "system", content: prepareSystemPrompt(node.kind) },
      { role: "user", content: prompt }
    ],
    temperature: config.temperature
  });
  
  // Parse and structure the response
  const parsedResponse = parseAIResponse(response, node.kind);
  
  // Store in context
  newCtx.symbols[node.id] = parsedResponse;
  
  // Update token usage
  newCtx.metadata.tokenUsage = {
    prompt: (newCtx.metadata.tokenUsage?.prompt || 0) + response.usage.prompt_tokens,
    completion: (newCtx.metadata.tokenUsage?.completion || 0) + response.usage.completion_tokens,
    total: (newCtx.metadata.tokenUsage?.total || 0) + response.usage.total_tokens
  };
  
  return newCtx;
}
```

## Edge Condition Evaluation

```typescript
function shouldExecuteNode(node: Node, edges: Edge[], ctx: ExecutionContext): boolean {
  // Get all incoming edges to this node
  const incomingEdges = edges.filter(edge => edge.target === node.id);
  
  // If no incoming edges, execute the node (it's a start node)
  if (incomingEdges.length === 0) {
    return true;
  }
  
  // Check if at least one incoming edge's condition is satisfied
  return incomingEdges.some(edge => {
    // If no condition, edge is always active
    if (!edge.condition) {
      return true;
    }
    
    // Evaluate the condition in the context
    return evaluateCondition(edge.condition, ctx);
  });
}

function evaluateCondition(conditionExpr: string, ctx: ExecutionContext): boolean {
  // Create a safe evaluation environment with context
  const evalContext = { ctx };
  
  try {
    // Use a sandboxed evaluation approach (VM2 or similar)
    const result = safeEval(conditionExpr, evalContext);
    return Boolean(result);
  } catch (error) {
    console.error(`Error evaluating condition "${conditionExpr}":`, error);
    return false;
  }
}
```

## Streaming Execution

For real-time updates during execution:

```typescript
async function* executeGraphStream(graph: GraphSchema, config: Config, initialContext?: any): AsyncGenerator<ExecutionUpdate> {
  // Initialize context
  let ctx: ExecutionContext = createInitialContext(initialContext);
  
  // Sort nodes topologically
  const sortedNodes = topologicalSort(graph.nodes, graph.edges);
  
  // Yield initial state
  yield {
    type: "start",
    totalNodes: sortedNodes.length,
    context: ctx
  };
  
  // Execute each node in order
  for (let i = 0; i < sortedNodes.length; i++) {
    const node = sortedNodes[i];
    
    try {
      // Yield node execution start
      yield {
        type: "nodeStart",
        nodeId: node.id,
        nodeKind: node.kind,
        progress: i / sortedNodes.length
      };
      
      // Execute node (similar to non-streaming version)
      // ...
      
      // Yield node execution result
      yield {
        type: "nodeComplete",
        nodeId: node.id,
        result: summarizeResult(node, ctx),
        progress: (i + 1) / sortedNodes.length
      };
      
    } catch (error) {
      // Yield error
      yield {
        type: "error",
        nodeId: node.id,
        message: error.message
      };
      
      if (isFailFastError(error)) {
        break;
      }
    }
  }
  
  // Yield completion
  yield {
    type: "complete",
    result: extractResult(ctx),
    context: ctx
  };
}
```

## Security Considerations

1. **Sandboxed Execution**: All JS expressions (edge conditions) must be evaluated in a sandboxed environment.
2. **Timeouts**: Node execution should have time limits to prevent infinite loops.
3. **Memory Limits**: Context size should be monitored to prevent memory exhaustion.
4. **Input Validation**: All graph components must be validated against the schema.
5. **Rate Limiting**: LLM calls should be rate-limited and monitored.

## Performance Considerations

1. **Caching**: Results of expensive operations (LLM calls) should be cached.
2. **Parallelization**: Independent branches of the graph can be executed in parallel.
3. **Chunking**: For large graphs, execution can be chunked into smaller batches.
4. **Token Budget Management**: LLM token usage should be tracked and optimized.

## Error Handling Strategy

1. **Fail Fast vs. Continue**: Some errors should halt execution (gate failures), others can be logged and execution can continue.
2. **Error Types**: Different error types should be handled appropriately (validation errors, runtime errors, LLM errors).
3. **Recovery**: Where possible, provide recovery mechanisms for common errors.
4. **Detailed Logging**: All errors should be logged with detailed context for debugging.
