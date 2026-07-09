export interface PluginConfig {
  /** AI provider: 'openai-compatible' supports any OpenAI-compatible API; 'anthropic' uses Anthropic Messages API */
  provider: 'openai-compatible' | 'anthropic';
  /** API key for the chosen provider */
  apiKey: string;
  /** Model name (e.g. 'gpt-4o-mini', 'claude-3-haiku-20240307') */
  model: string;
  /**
   * Base URL for OpenAI-compatible providers.
   * Only used when provider is 'openai-compatible'.
   * Defaults to 'https://api.openai.com/v1'.
   * For other compatible services, set this accordingly, e.g.:
   * - Groq: 'https://api.groq.com/openai/v1'
   * - DeepSeek: 'https://api.deepseek.com/v1'
   * - OpenRouter: 'https://openrouter.ai/api/v1'
   * - Local: 'http://localhost:11434/v1' (Ollama)
   */
  baseURL?: string;
  /** Maximum tokens for the response (default: 2048) */
  maxTokens?: number;
  /** Temperature for generation (default: 0.3) */
  temperature?: number;
}

export default {
  default: {
    provider: 'openai-compatible',
    apiKey: '',
    model: 'gpt-4o-mini',
    maxTokens: 2048,
    temperature: 0.3,
  } satisfies PluginConfig,
  validator(config: Record<string, unknown>) {
    const provider = config.provider;
    if (provider !== 'openai-compatible' && provider !== 'anthropic') {
      throw new Error('SEO AI: provider must be "openai-compatible" or "anthropic"');
    }
    if (typeof config.apiKey !== 'string' || config.apiKey.length === 0) {
      throw new Error('SEO AI: apiKey must be a non-empty string');
    }
    if (typeof config.model !== 'string' || config.model.length === 0) {
      throw new Error('SEO AI: model must be a non-empty string');
    }
    if (config.baseURL !== undefined && typeof config.baseURL !== 'string') {
      throw new Error('SEO AI: baseURL must be a string');
    }
    if (config.maxTokens !== undefined && typeof config.maxTokens !== 'number') {
      throw new Error('SEO AI: maxTokens must be a number');
    }
    if (config.temperature !== undefined && typeof config.temperature !== 'number') {
      throw new Error('SEO AI: temperature must be a number');
    }
  },
};
