import { z } from 'zod';

// Schema for a single AI provider configuration
export const aiProviderSchema = z.object({
  id: z.string().cuid().optional(), // CUID for database records
  providerId: z.string(), // e.g., 'openai', 'openrouter'
  name: z.string(),
  baseURL: z.string().url(),
  apiKey: z.string(),
  models: z.array(z.string()),
  isActive: z.boolean().default(true),
  headers: z.record(z.string()).optional(),
  userId: z.string(),
});

// Schema for the user's complete provider configuration
export const providerConfigSchema = z.object({
  userId: z.string(),
  defaultProviderId: z.string(),
  providers: z.array(aiProviderSchema),
});

// Schema for testing an individual node
export const testNodeSchema = z.object({
  nodeId: z.string(),
  nodeType: z.string(),
  content: z.string(),
  providerId: z.string(),
  model: z.string(),
  parameters: z.object({
    temperature: z.number().min(0).max(2).default(0.7),
    max_tokens: z.number().min(1).max(8000).default(1000),
    top_p: z.number().min(0).max(1).default(1),
  }),
});

export type AIProvider = z.infer<typeof aiProviderSchema>;
export type ProviderConfig = z.infer<typeof providerConfigSchema>;
export type TestNode = z.infer<typeof testNodeSchema>;
