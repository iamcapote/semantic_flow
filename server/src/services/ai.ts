// OpenAI Service for Semantic Logic AI Workflow Builder
// Handles API calls to OpenAI and other compatible providers

import { AIProvider } from '../schemas/ai';
import { 
  CreateChatCompletionRequest, 
  CreateChatCompletionResponse,
  CreateChatCompletionRequestSchema
} from '../schemas/openai';

export class OpenAIService {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async callAPI(
    request: CreateChatCompletionRequest
  ): Promise<CreateChatCompletionResponse> {
    // Validate the request against the Zod schema
    const validatedRequest = CreateChatCompletionRequestSchema.parse(request);

    const response = await fetch(`${this.provider.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.provider.apiKey}`,
        ...this.provider.headers,
      },
      body: JSON.stringify(validatedRequest),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const responseData = await response.json();
    
    // We can also validate the response if we want to be extra safe
    // return CreateChatCompletionResponseSchema.parse(responseData);
    return responseData as CreateChatCompletionResponse;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.callAPI({
        model: this.provider.models[0] || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      });
      return response.choices && response.choices.length > 0;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}
