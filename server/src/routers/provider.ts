

import { router, publicProcedure } from '../trpc';
import { aiProviderSchema, testNodeSchema } from '../schemas/ai';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import fetch from 'node-fetch';

// Default provider configurations
const defaultProviders = [
  {
    providerId: 'openai',
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo'],
    isActive: true,
    headers: {},
  },
  {
    providerId: 'openrouter',
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    models: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-70b'],
    isActive: false,
    headers: {
      'HTTP-Referer': 'https://semantic-canvas.app',
      'X-Title': 'Semantic Canvas',
    },
  },
  {
    providerId: 'venice',
    name: 'Venice AI',
    baseURL: 'https://api.venice.ai/api/v1',
    models: ['gpt-4o', 'claude-3.5-sonnet', 'llama-3.1-70b'],
    isActive: false,
    headers: {},
  },
];


// In-memory provider config store (per process, for tests/dev only)
const providerConfigStore: Record<string, any[]> = {};

// TEST-ONLY: Reset provider config for a user (for integration tests)
export const __resetProviderConfig = (userId: string) => {
  delete providerConfigStore[userId];
};

export const providerRouter = router({
  // Get user's provider configuration, or create if it doesn't exist
  getConfig: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      let userProviders = providerConfigStore[input.userId];
      if (!userProviders || !Array.isArray(userProviders) || userProviders.length === 0) {
        // Always return default providers for new users or empty configs
        userProviders = defaultProviders.map(p => ({
          ...p,
          userId: input.userId,
          apiKey: '', // Ensure apiKey field exists for UI
        }));
        providerConfigStore[input.userId] = userProviders;
      } else {
        // Ensure all providers have apiKey field for UI
        userProviders = userProviders.map(p => ({ ...p, apiKey: typeof p.apiKey === 'string' ? p.apiKey : '' }));
        providerConfigStore[input.userId] = userProviders;
      }
    .input(z.object({
      userId: z.string(),
      configs: z.array(aiProviderSchema.omit({ userId: true })),
    }))
    .mutation(async ({ input }) => {
      providerConfigStore[input.userId] = input.configs.map((p: any) => ({
        ...p,
        userId: input.userId,
      }));
      return { success: true };
    }),

  // Test a single node with specific provider (BYOK Model)
  testNode: publicProcedure
    .input(testNodeSchema.extend({
      userId: z.string(),
      const provider = providers.find((p: any) => p.providerId === input.providerId);
      if (!provider) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Provider not configured' });
      }

      // Use API key from client request
      const response = await fetch(`${provider.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${input.apiKey}`,
          ...((provider.headers as any) || {}),
        },
        body: JSON.stringify({
          model: input.model,
          messages: [
            { role: 'system', content: `You are processing a semantic workflow node of type: ${input.nodeType}.` },
            { role: 'user', content: input.content },
          ],
          ...input.parameters,
        }),
      });

      if (!response.ok) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Provider API error: ${response.statusText}` });
      }

      const result = await response.json();
      return {
        nodeId: input.nodeId,
        result: (result as any).choices?.[0]?.message?.content ?? null,
        usage: (result as any).usage,
        model: input.model,
        provider: provider.name,
      };
    }),
});
