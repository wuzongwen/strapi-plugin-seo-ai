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
declare const _default: {
    default: {
        provider: "openai-compatible";
        apiKey: string;
        model: string;
        maxTokens: number;
        temperature: number;
    };
    validator(config: Record<string, unknown>): void;
};
export default _default;
