import { trpc } from '@/lib/trpc';

class WorkflowExecutionEngine {
  constructor(userId, toast) {
    this.userId = userId;
    this.toast = toast;
    this.trpcClient = trpc;
  }

  async executeWorkflow(workflow, onProgress = null) {
    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new Error('Workflow is empty');
    }

    // Get user's provider configuration
    const providers = await this.trpcClient.provider.getConfig.query({ userId: this.userId });
    const activeProvider = providers.find(p => p.isActive);

    if (!activeProvider || !activeProvider.apiKey) {
      throw new Error('No active provider configured. Please set up your AI providers in settings.');
    }

    const results = [];
    const nodeStates = new Map();

    // Initialize node states
    workflow.nodes.forEach(node => {
      nodeStates.set(node.id, {
        id: node.id,
        status: 'pending',
        input: node.data.content || '',
        output: null,
        error: null,
        startTime: null,
        endTime: null
      });
    });

    if (onProgress) {
      onProgress({ type: 'start', message: 'Starting workflow execution...' });
    }

    // Execute nodes based on topology (for now, execute sequentially)
    const executionOrder = this.getExecutionOrder(workflow);

    for (const nodeId of executionOrder) {
      const node = workflow.nodes.find(n => n.id === nodeId);
      const nodeState = nodeStates.get(nodeId);

      if (!node || !nodeState) continue;

      try {
        nodeState.status = 'running';
        nodeState.startTime = Date.now();

        if (onProgress) {
          onProgress({
            type: 'node_start',
            nodeId: nodeId,
            message: `Processing node: ${node.data.label} (${node.data.type})`
          });
        }

        // Prepare input by combining node content with outputs from connected nodes
        const nodeInput = this.prepareNodeInput(node, nodeStates, workflow);

        // Execute node using the active provider
        const result = await this.trpcClient.provider.testNode.mutate({
          nodeId: nodeId,
          nodeType: node.data.type,
          content: nodeInput,
          providerId: activeProvider.providerId,
          model: activeProvider.models[0], // Use first available model
          parameters: {
            temperature: 0.7,
            max_tokens: 1000,
            top_p: 1,
          },
        });

        nodeState.status = 'completed';
        nodeState.output = result.result;
        nodeState.endTime = Date.now();

        results.push({
          nodeId: nodeId,
          nodeLabel: node.data.label,
          nodeType: node.data.type,
          input: nodeInput,
          output: result.result,
          duration: nodeState.endTime - nodeState.startTime,
          provider: result.provider,
          model: result.model,
          usage: result.usage
        });

        if (onProgress) {
          onProgress({
            type: 'node_complete',
            nodeId: nodeId,
            message: `Completed: ${node.data.label}`,
            result: result.result
          });
        }

      } catch (error) {
        nodeState.status = 'error';
        nodeState.error = error.message;
        nodeState.endTime = Date.now();

        if (onProgress) {
          onProgress({
            type: 'node_error',
            nodeId: nodeId,
            message: `Error in ${node.data.label}: ${error.message}`,
            error: error.message
          });
        }

        // For now, continue execution even if a node fails
        // In a production system, you might want to handle this differently
        console.error(`Node ${nodeId} failed:`, error);
      }
    }

    if (onProgress) {
      onProgress({
        type: 'complete',
        message: 'Workflow execution completed',
        results: results
      });
    }

    return {
      success: true,
      results: results,
      nodeStates: Array.from(nodeStates.values()),
      totalNodes: workflow.nodes.length,
      completedNodes: results.length,
      provider: activeProvider.name
    };
  }

  prepareNodeInput(node, nodeStates, workflow) {
    let input = node.data.content || '';

    // Find incoming edges to this node
    const incomingEdges = workflow.edges.filter(edge => edge.target === node.id);
    
    if (incomingEdges.length > 0) {
      const inputContext = incomingEdges
        .map(edge => {
          const sourceState = nodeStates.get(edge.source);
          return sourceState && sourceState.output 
            ? `Input from ${edge.source}: ${sourceState.output}`
            : `Input from ${edge.source}: [No output]`;
        })
        .join('\n');

      input = `${input}\n\nContext from connected nodes:\n${inputContext}`;
    }

    return input;
  }

  getExecutionOrder(workflow) {
    // Simple topological sort based on edges
    // For now, return nodes in their original order
    // In a production system, you'd implement proper dependency resolution
    return workflow.nodes.map(node => node.id);
  }

  async testSingleNode(nodeId, nodeType, content, providerId, model) {
    try {
      const result = await this.trpcClient.provider.testNode.mutate({
        nodeId: nodeId,
        nodeType: nodeType,
        content: content,
        providerId: providerId,
        model: model,
        parameters: {
          temperature: 0.7,
          max_tokens: 500,
          top_p: 1,
        },
      });

      return {
        success: true,
        result: result.result,
        provider: result.provider,
        model: result.model,
        usage: result.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default WorkflowExecutionEngine;
