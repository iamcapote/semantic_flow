// Enhanced AI Prompting Engine for Semantic Logic AI Workflow Builder
// Supports three prompting modes: 1) Text-to-Workflow, 2) Workflow Execution, 3) Node Enhancement

import { NODE_TYPES } from './ontology.js';
import { exportWorkflowAsJSON, exportWorkflowAsMarkdown, exportWorkflowAsYAML, exportWorkflowAsXML } from './exportUtils.js';
import { chatCompletion, getPromptDefaults } from './aiRouter.js';
import { stripWorkflow as stripWorkflowUtil, serializeNodeForAI } from './sanitizer.js';

export class PromptingEngine {
  constructor(userId) {
    this.userId = userId;
    this.providers = [
      {
        providerId: 'internal',
        name: (typeof window !== 'undefined' && (window.__PUBLIC_CONFIG__?.brand || 'Internal')), // brand injected at runtime
        baseURL: '/api/ai', // logical namespace; streaming endpoint proxied server-side
        // Models are dynamically discoverable; seed with stored dynamic list or a safe placeholder.
        models: (() => {
          try {
            const raw = typeof window !== 'undefined' ? sessionStorage.getItem('internal_models') : null;
            if (raw) { const arr = JSON.parse(raw); if (Array.isArray(arr) && arr.length) return arr; }
          } catch {}
          return ['Llama-3.3-70b | Venice AI'];
        })(),
        headers: {},
        managed: true,
      },
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
      {
        providerId: 'nous',
        name: 'Nous Research',
        baseURL: 'https://inference-api.nousresearch.com/v1',
        models: [
          'Hermes-4-70B',
          'Hermes-4-405B',
          'Hermes-3-Llama-3.1-70B',
          'Hermes-3-Llama-3.1-405B',
          'DeepHermes-3-Llama-3-8B-Preview',
          'DeepHermes-3-Mistral-24B-Preview'
        ],
        headers: {},
      },
      {
        providerId: 'morpheus',
        name: 'Morpheus',
        baseURL: 'https://api.mor.org/api/v1',
        models: [
          'llama-3.3-70b',
          'llama-3.3-70b-web',
          'venice-uncensored-web',
          'qwen3-235b-web',
          'mistral-31-24b-web'
        ],
        headers: {},
      },
    ];
  }

  async callProvider(providerId, model, apiKey, messages) {
    if (providerId === 'internal') {
      // Aggregate internal streaming (persona-based) into a single completion-like response.
      const query = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
      const persona = (typeof window !== 'undefined' && sessionStorage.getItem('internal_active_persona')) || '0-NULL';
      const body = { persona, query };
      try {
        const res = await fetch('/api/ai/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok || !res.body) throw new Error('internal_stream_failed');
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        let content = '';
        while (true) {
          const { value, done } = await reader.read();
            if (done) break;
            buf += dec.decode(value, { stream: true });
            const parts = buf.split(/\n\n/);
            buf = parts.pop();
            for (const raw of parts) {
              const lines = raw.split(/\n/);
              let ev = '';
              let dataLines = [];
              for (const l of lines) {
                if (l.startsWith('event:')) ev = l.slice(6).trim();
                else if (l.startsWith('data:')) dataLines.push(l.slice(5).trim());
              }
              let dataStr = dataLines.join('\n');
              let data; try { data = JSON.parse(dataStr); } catch { data = {}; }
              if (ev === 'token' && data.text) content += data.text;
            }
        }
        return {
          choices: [{ message: { role: 'assistant', content } }],
          usage: null,
          provider: 'internal',
          model: model || 'Llama-3.3-70b | Venice AI',
        };
      } catch (e) {
        throw new Error(`internal: ${e.message || e}`);
      }
    }
    return chatCompletion(providerId, apiKey, { model, messages });
  }

  // Mode 1: Text-to-Workflow Conversion
  /**
   * Convert free text into a workflow.
   * options: {
   *   includeOntology: boolean (default true),
   *   ontologyMode: 'force_framework' | 'novel_category' | 'exclude' (default 'force_framework'),
   *   selectedOntologies: array of cluster codes or node type codes to include (optional)
   * }
   */
  async convertTextToWorkflow(textInput, apiKey, providerId = 'openai', model = 'gpt-4o', options = {}) {
    const { includeOntology = true, ontologyMode = 'force_framework', selectedOntologies = [], variant } = options || {};

  // Load prompt defaults (user-editable)
  const prompts = getPromptDefaults();
  const header = prompts.text2wf?.system || `You are a semantic logic workflow converter. Your job is to convert the user's free-form specification into a structured workflow composed of the canonical semantic node ontology used by the system.`;

    // Behavior modes
    let modeNote = '';
    if (ontologyMode === 'force_framework') {
      modeNote = 'When uncertain, prefer nodes from the provided ontology. If input suggests a new concept that does not match the ontology, create a node and tag it with a best-fit cluster from the ontology.';
    } else if (ontologyMode === 'novel_category') {
      modeNote = 'Avoid mapping inputs to exact existing ontology node types; when the concept does not clearly match, generate a novel category and label it clearly (e.g., NEW-<name>) but still provide a best-fit cluster if possible.';
    } else if (ontologyMode === 'exclude') {
      modeNote = 'Do not use the canonical ontology mapping. Instead, produce a best-effort semantic workflow without referencing or requiring the provided ontology.';
    }

    // Build ontology text based on selection
    let ontologyText = '';
    if (includeOntology && ontologyMode !== 'exclude') {
      // If selectedOntologies includes cluster codes, include those clusters; otherwise include a short listing of node types
      const pick = Array.isArray(selectedOntologies) && selectedOntologies.length > 0;
      const lines = [];
      if (pick) {
        // Try to include requested clusters or exact types
        const sel = new Set(selectedOntologies.map(s => String(s).trim().toUpperCase()));
        Object.entries(NODE_TYPES).forEach(([key, val]) => {
          if (sel.has(key) || sel.has(val.cluster)) {
            lines.push(`- ${key}: ${val.label} (${val.description}) [cluster=${val.cluster}]`);
          }
        });
      }
      if (!pick || lines.length === 0) {
        // Fallback: include a summarized listing of major node types (first 120 entries to avoid overly large prompts)
        const all = Object.entries(NODE_TYPES).slice(0, 120).map(([key, val]) => `- ${key}: ${val.label} (${val.description}) [cluster=${val.cluster}]`);
        lines.push(...all);
      }
      ontologyText = `Ontology Reference:\n${lines.join('\n')}`;
    }

    const variantInstruction = variant && prompts.text2wf?.variants?.[variant] ? `\nVariant Instruction: ${prompts.text2wf.variants[variant]}` : '';
    const userPrompt = ((prompts.text2wf?.user || 'User specification:\n\n{{input}}') + variantInstruction).replace('{{input}}', textInput);
    const ontologyPrompt = includeOntology && ontologyMode !== 'exclude' ? `\n\n${ontologyText}` : '';

    // Messages order: system (header + mode), user (input), optional system (ontology)
    const messages = [
      { role: 'system', content: header + `\nMode: ${ontologyMode}\n${modeNote}` },
      { role: 'user', content: userPrompt },
    ];
    if (ontologyPrompt) messages.push({ role: 'system', content: ontologyPrompt });

    try {
      const response = await this.callProvider(providerId, model, apiKey, messages);

      const workflowData = this.parseWorkflowFromAIResponse(
        response.choices?.[0]?.message?.content || response.output || ''
      );
      return {
        success: true,
        workflow: workflowData,
        metadata: {
          originalText: textInput,
          generatedBy: `${providerId} - ${model}`,
          options: { includeOntology, ontologyMode, selectedOntologies },
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

  // First, use a stripped, sanitized workflow for prompting so only user content is sent
  const safeWorkflow = stripWorkflowUtil(workflow);
  const structuredWorkflow = this.formatWorkflowForPrompting(safeWorkflow || workflow, outputFormat);

  const prompts = getPromptDefaults();
  const variantInstruction = executionSettings.variant && prompts.execute?.variants?.[executionSettings.variant] ? `\nVariant Instruction: ${prompts.execute.variants[executionSettings.variant]}` : '';
  const systemPrompt = (prompts.execute?.system || `You are a semantic logic workflow executor. Execute the provided workflow step by step.`).replace('{{format}}', outputFormat.toUpperCase()) + `\n\nAvailable Node Types:\n${Object.entries(NODE_TYPES).map(([key, value]) => `- ${key}: ${value.label} - ${value.description}`).join('\n')}`;
  const userPrompt = ((prompts.execute?.user || `Execute this semantic workflow:\n\n{{workflow}}`) + variantInstruction).replace('{{workflow}}', structuredWorkflow);

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

    // Tolerate non-ontology types (e.g., field types like "longText") by falling back
    const nodeType = NODE_TYPES[node.data.type] || {
      label: 'Freeform Content',
      description: 'Generic text content provided by the user (not a canonical ontology type).',
    };

    const prompts = getPromptDefaults();
    const enhancementMap = {
      improve: 'Improve and refine this semantic node while maintaining its logical purpose and type.',
      optimize: 'Optimize this semantic node for clarity, precision, and logical coherence.',
      refactor: 'Refactor this semantic node to be more structured and academically rigorous.',
      enhance: 'Enhance this semantic node with richer vocabulary and more sophisticated reasoning.',
      simplify: 'Simplify this semantic node while preserving its essential meaning and logical function.',
      elaborate: 'Elaborate on this semantic node with additional detail and nuanced reasoning.',
      ...(prompts.enhance?.variants || {}),
    };

    const baseSystem = prompts.enhance?.system || `You are a semantic logic node enhancer. Your task is to ${enhancementType} semantic workflow nodes.`;
    const systemPrompt = `${baseSystem}\n\nNode Type: ${node.data.type || 'N/A'} (${nodeType.label})\nPurpose: ${nodeType.description}\nCluster: ${node.data?.metadata?.cluster || 'Unknown'}\nEnhancement Type: ${enhancementType}`;

    const userPrompt = (prompts.enhance?.user || '{{content}}').replace('{{content}}', serializeNodeForAI(node) || node.data.content || '');
  // Replace the raw content with a sanitized serialization respecting declared fileFormat when available
  const safeNodeContent = serializeNodeForAI(node) || node.data.content || '';
  const variantInstruction = enhancementMap[enhancementType] || enhancementMap.improve;
  const safeUserPrompt = `${variantInstruction}\n\nOriginal Node Content:\n"${safeNodeContent}"\n\nEnhanced Content:`;

    try {
      const response = await this.callProvider(providerId, model, apiKey, [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: safeUserPrompt },
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
