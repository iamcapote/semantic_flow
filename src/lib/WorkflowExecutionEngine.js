import PromptingEngine from './promptingEngine.js';
import { SecureKeyManager } from './security.js';
import { buildNodeContext } from './nodeModel.js';

class WorkflowExecutionEngine {
  constructor(userId, toast) {
    this.userId = userId;
    this.toast = toast;
    this.engine = new PromptingEngine(userId);
  }

  async executeWorkflow(workflow, onProgress) {
    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new Error('Workflow is empty');
    }

    const providers = await this.engine.getAvailableProviders();
    const activeId = sessionStorage.getItem('active_provider') || providers[0].providerId;
    const activeProvider = providers.find(p => p.providerId === activeId) || providers[0];
    const apiKey = SecureKeyManager.getApiKey(activeProvider.providerId);
    if (!apiKey) {
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

    if (onProgress && typeof onProgress === 'function') {
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

        if (onProgress && typeof onProgress === 'function') {
          onProgress({
            type: 'node_start',
            nodeId: nodeId,
            message: `Processing node: ${node.data.label} (${node.data.type})`
          });
        }

  // Prepare contextual input from node's fields/content, then add upstream outputs
  const baseContext = buildNodeContext(node);
  const nodeInput = this.prepareNodeInput(node, nodeStates, workflow, baseContext);

    // Execute node using the active provider
    const result = await this.engine.callProvider(
      activeProvider.providerId,
      activeProvider.models[0],
      apiKey,
      [
        { role: 'system', content: `You are executing a workflow node of type ${node.data.type}.` },
        { role: 'user', content: nodeInput },
      ]
    );
        nodeState.status = 'completed';
        nodeState.output = result.choices?.[0]?.message?.content || '';
        nodeState.endTime = Date.now();

        results.push({
          nodeId: nodeId,
          nodeLabel: node.data.label,
          nodeType: node.data.type,
          input: nodeInput,
          output: nodeState.output,
          duration: nodeState.endTime - nodeState.startTime,
          provider: activeProvider.providerId,
          model: activeProvider.models[0],
          usage: result.usage,
        });

        if (onProgress && typeof onProgress === 'function') {
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

        if (onProgress && typeof onProgress === 'function') {
          onProgress({
            type: 'node_error',
            nodeId: nodeId,
            message: `Error in ${node.data.label}: ${error.message}`,
            error: error.message
          });
        }

        // For now, continue execution even if a node fails
        // Production: Handle node failures according to workflow requirements
        console.error(`Node ${nodeId} failed:`, error);
      }
    }

    if (onProgress && typeof onProgress === 'function') {
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

  prepareNodeInput(node, nodeStates, workflow, baseContext = '') {
    let input = baseContext || node.data.content || '';

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

  input = `${input}\n\n---\nUpstream Context:\n${inputContext}`;
    }

    return input;
  }

  getExecutionOrder(workflow) {
    // Production: Implement topological sort and full dependency resolution for workflow nodes
    return workflow.nodes.map(node => node.id);
  }

  async testSingleNode(nodeId, nodeType, content, providerId, model, apiKey) {
    try {
      const result = await this.engine.callProvider(providerId, model, apiKey, [
        { role: 'system', content: `You are testing a node of type ${nodeType}.` },
        { role: 'user', content },
      ]);

      return {
        success: true,
        result: result.choices?.[0]?.message?.content || '',
        provider: providerId,
        model: model,
        usage: result.usage,
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
