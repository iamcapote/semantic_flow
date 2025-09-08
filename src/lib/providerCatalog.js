// Central provider catalog referencing existing provider model lists.
// Source lists derived from SimpleProviderSetup & legacy ProviderSettings.
// Avoid inventing new models; update here if upstream definitions change.

export const PROVIDER_CATALOG = {
  internal: {
    name: (typeof window !== 'undefined' && (window.__PUBLIC_CONFIG__?.brand || 'BIThub')),
    // Real models are determined upstream per persona (default_llm.display_name). We expose a small
    // curated list populated at runtime; start with the primary Venice AI default as safe placeholder.
    models: ['Llama-3.3-70b | Venice AI'],
    defaultModel: 'Llama-3.3-70b | Venice AI',
    managed: true,
  },
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'o1-preview', 'o1-mini'],
    defaultModel: 'gpt-4o'
  },
  openrouter: {
    name: 'OpenRouter',
    models: [
      'qwen/qwen3-235b-a22b-07-25:free',
      'moonshotai/kimi-k2:free',
      'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
      'qwen/qwen3-235b-a22b:free',
      'deepseek/deepseek-chat-v3-0324:free'
    ],
    defaultModel: 'qwen/qwen3-235b-a22b-07-25:free'
  },
  venice: {
    name: 'Venice AI',
    models: ['venice-uncensored', 'mistral-31-24b', 'llama-3.2-3b'],
    defaultModel: 'venice-uncensored'
  },
  nous: {
    name: 'Nous Research',
    models: [
      'Hermes-4-70B',
      'Hermes-4-405B',
      'Hermes-3-Llama-3.1-70B',
      'Hermes-3-Llama-3.1-405B',
      'DeepHermes-3-Llama-3-8B-Preview',
      'DeepHermes-3-Mistral-24B-Preview'
    ],
    defaultModel: 'Hermes-4-70B'
  },
  morpheus: {
    name: 'Morpheus',
    models: [
      'llama-3.3-70b',
      'llama-3.3-70b-web',
      'venice-uncensored-web',
      'qwen3-235b-web',
      'mistral-31-24b-web'
    ],
    defaultModel: 'llama-3.3-70b'
  }
};

export function getActiveProviderId() {
  try { return sessionStorage.getItem('active_provider') || 'openai'; } catch { return 'openai'; }
}

export function resolveModel(providerId, currentModel) {
  const info = PROVIDER_CATALOG[providerId];
  if (!info) return currentModel;
  if (info.models.includes(currentModel)) return currentModel;
  return info.defaultModel || info.models[0];
}
