// Enhanced AI Prompting Engine for Semantic Logic AI Workflow Builder
// Supports three prompting modes: 1) Text-to-Workflow, 2) Workflow Execution, 3) Node Enhancement

import { NODE_TYPES } from './ontology.js';
import { exportWorkflowAsJSON, exportWorkflowAsMarkdown, exportWorkflowAsYAML, exportWorkflowAsXML } from './exportUtils.js';

export class PromptingEngine {
  constructor(userId) {
    this.userId = userId;
    this.providers = [
      {
        providerId: 'openai',
        name: 'OpenAI',
        baseURL: 'https://api.openai.com/v1',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'o1-preview', 'o1-mini'],
        headers: {},
      },
      {
        providerId: 'openrouter',
        name: 'OpenRouter',
        baseURL: 'https://openrouter.ai/api/v1',
        models: [
          'qwen/qwen3-235b-a22b-07-25:free',
          'moonshotai/kimi-k2:free',
          'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
          'qwen/qwen3-235b-a22b:free',
          'deepseek/deepseek-chat-v3-0324:free',
        ],
        headers: {
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Semantic Canvas',
        },
      },
      {
        providerId: 'venice',
        name: 'Venice AI',
        baseURL: 'https://api.venice.ai/api/v1',
        models: ['venice-uncensored', 'mistral-31-24b', 'llama-3.2-3b'],
        headers: {},
      },
    ];
  }

  async callProvider(providerId, model, apiKey, messages) {
    const provider = this.providers.find((p) => p.providerId === providerId);
    if (!provider) {
      throw new Error('Unknown provider');
    }
    const response = await fetch(`${provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...provider.headers,
      },
      body: JSON.stringify({ model, messages }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error?.message || response.statusText);
    }
    return response.json();
  }

  // Mode 1: Text-to-Workflow Conversion
  async convertTextToWorkflow(textInput, apiKey, providerId = 'openai', model = 'gpt-4o') {
    const systemPrompt = `You are a semantic logic workflow converter. Convert the provided text into a structured workflow using our semantic node ontology.

Available Node Types:
${Object.entries(NODE_TYPES).map(([key, value]) => `- ${key}: ${value.label} (${value.description})`).join('\n')}

Instructions:
1. Analyze the text for logical components, statements, hypotheses, evidence, reasoning steps, etc.
2. Map these to appropriate semantic node types from our ontology
3. Create connections between nodes that show logical flow
4. Output ONLY valid JSON in this exact format:

{
  "nodes": [
    {
      "id": "node-1",
      "type": "semantic",
      "position": {"x": 100, "y": 100},
      "data": {
        "type": "PROP-STM",
        "label": "Main Statement",
        "content": "Extracted statement from text",
        "metadata": {
          "cluster": "PROP",
          "tags": ["extracted", "atomic"]
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1-2",
      "source": "node-1",
      "target": "node-2",
      "data": {"condition": "implies"}
    }
  ]
}

Position nodes logically from left to right, top to bottom. Use appropriate semantic node types.`;

    const userPrompt = `Convert this text into a semantic workflow:\n\n${textInput}`;

    try {
      const response = await this.callProvider(providerId, model, apiKey, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      const workflowData = this.parseWorkflowFromAIResponse(
        response.choices?.[0]?.message?.content || ''
      );
      return {
        success: true,
        workflow: workflowData,
        metadata: {
          originalText: textInput,
          generatedBy: `${providerId} - ${model}`,
          tokensUsed: response.usage,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mode 2: Workflow Execution with Format Control
  async executeWorkflowWithFormat(workflow, outputFormat = 'json', executionSettings = {}) {
    const {
      temperature = 0.7,
      maxTokens = 1500,
      providerId = 'openai',
      model = 'gpt-4o',
      apiKey
    } = executionSettings;

    // First, convert workflow to selected format for structured prompting
    const structuredWorkflow = this.formatWorkflowForPrompting(workflow, outputFormat);

    const systemPrompt = `You are a semantic logic workflow executor. Execute the provided workflow step by step.

Workflow Format: ${outputFormat.toUpperCase()}
Your task:
1. Process each node in the workflow according to its semantic type
2. Follow the logical connections between nodes
3. Provide reasoning for each step
4. Return results in the same ${outputFormat} format structure

Available Node Types and Their Purposes:
${Object.entries(NODE_TYPES).map(([key, value]) => `- ${key}: ${value.label} - ${value.description}`).join('\n')}

Process the workflow systematically and provide detailed reasoning for each node.`;

    const userPrompt = `Execute this semantic workflow:\n\n${structuredWorkflow}`;

    try {
      const response = await this.callProvider(providerId, model, apiKey, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      return {
        success: true,
        execution: {
          originalWorkflow: workflow,
          format: outputFormat,
          result: response.choices?.[0]?.message?.content || '',
          provider: providerId,
          model: model,
          usage: response.usage,
          executedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mode 3: Individual Node Enhancement
  async enhanceNode(node, enhancementType = 'improve', context = {}) {
    const {
      temperature = 0.7,
      maxTokens = 800,
      providerId = 'openai',
      model = 'gpt-4o',
      apiKey
    } = context;

    const nodeType = NODE_TYPES[node.data.type];
    if (!nodeType) {
      throw new Error(`Unknown node type: ${node.data.type}`);
    }

    const enhancementPrompts = {
      improve: `Improve and refine this semantic node while maintaining its logical purpose and type.`,
      optimize: `Optimize this semantic node for clarity, precision, and logical coherence.`,
      refactor: `Refactor this semantic node to be more structured and academically rigorous.`,
      enhance: `Enhance this semantic node with richer vocabulary and more sophisticated reasoning.`,
      simplify: `Simplify this semantic node while preserving its essential meaning and logical function.`,
      elaborate: `Elaborate on this semantic node with additional detail and nuanced reasoning.`
    };

    const systemPrompt = `You are a semantic logic node enhancer. Your task is to ${enhancementType} semantic workflow nodes.

Node Type: ${node.data.type} (${nodeType.label})
Purpose: ${nodeType.description}
Cluster: ${node.data.metadata?.cluster || 'Unknown'}

Guidelines:
1. Maintain the node's semantic type and logical purpose
2. Preserve the core meaning while improving expression
3. Use appropriate academic and technical vocabulary
4. Ensure the enhanced content fits the node's semantic category
5. Return ONLY the enhanced content, no additional formatting

Enhancement Type: ${enhancementType}`;

    const userPrompt = `${enhancementPrompts[enhancementType] || enhancementPrompts.improve}

Original Node Content:
"${node.data.content || 'No content provided'}"

Enhanced Content:`;

    try {
      const response = await this.callProvider(providerId, model, apiKey, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

      return {
        success: true,
        enhancement: {
          originalNode: node,
          enhancementType: enhancementType,
          originalContent: node.data.content,
          enhancedContent: response.choices?.[0]?.message?.content || '',
          provider: providerId,
          model: model,
          usage: response.usage,
          enhancedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Helper: Format workflow for prompting
  formatWorkflowForPrompting(workflow, format) {
    switch (format.toLowerCase()) {
      case 'json':
        return exportWorkflowAsJSON(workflow).content;
      case 'markdown':
        return exportWorkflowAsMarkdown(workflow).content;
      case 'yaml':
        return exportWorkflowAsYAML(workflow).content;
      case 'xml':
        return exportWorkflowAsXML(workflow).content;
      default:
        return exportWorkflowAsJSON(workflow).content;
    }
  }

  // Helper: Parse workflow from AI response
  parseWorkflowFromAIResponse(aiResponse) {
    try {
      // Look for JSON in the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // If no JSON found, return a simple structure
      return {
        nodes: [],
        edges: [],
        error: 'Could not parse workflow from AI response'
      };
    } catch (error) {
      return {
        nodes: [],
        edges: [],
        error: `JSON parsing error: ${error.message}`
      };
    }
  }

  // Helper: Get available providers for prompting
  async getAvailableProviders() {
    return this.providers.map(p => ({
      ...p,
      baseURL: sessionStorage.getItem(`base_url_${p.providerId}`) || p.baseURL,
      isActive: sessionStorage.getItem('active_provider') === p.providerId,
    }));
  }

  // Helper: Get recommended models for different prompting tasks
  getRecommendedModels(taskType) {
    const recommendations = {
      'text-to-workflow': ['gpt-4o', 'gpt-4', 'claude-3.5-sonnet'],
      'workflow-execution': ['gpt-4o', 'gpt-4', 'claude-3.5-sonnet'],
      'node-enhancement': ['gpt-4o-mini', 'gpt-4', 'claude-3.5-sonnet']
    };
    return recommendations[taskType] || recommendations['node-enhancement'];
  }
}

export default PromptingEngine;
