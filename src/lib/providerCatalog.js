// Central provider catalog referencing existing provider model lists.
// Source lists derived from SimpleProviderSetup & legacy ProviderSettings.
// Avoid inventing new models; update here if upstream definitions change.

export const PROVIDER_CATALOG = {
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
