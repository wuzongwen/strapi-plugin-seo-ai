import Anthropic from '@anthropic-ai/sdk';
import type { Core } from '@strapi/strapi';
import type { PluginConfig } from '../../config';
import { SEO_PROMPT, type SeoGenerationResult } from './openai-compatible';

/**
 * Calls the Anthropic Messages API.
 *
 * Since Anthropic does not support a native JSON mode, we prefill
 * the assistant response with '{' to force JSON output.
 */
export async function generateWithAnthropic(
  content: string,
  config: PluginConfig,
  strapi: Core.Strapi,
): Promise<SeoGenerationResult> {
  const client = new Anthropic({
    apiKey: config.apiKey,
  });

  strapi.log.info(`SEO AI: Generating with ${config.model} via Anthropic API...`);

  const response = await client.messages.create({
    model: config.model,
    max_tokens: config.maxTokens ?? 2048,
    temperature: config.temperature ?? 0.3,
    system: SEO_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Content:\n${content}`,
      },
      {
        // Prefill assistant with '{' to force JSON output
        role: 'assistant',
        content: '{',
      },
    ],
  });

  // Parse the response — prepend the prefilled '{' that Anthropic strips
  const raw = response.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  if (!raw) {
    throw new Error('SEO AI: Empty response from Anthropic provider');
  }

  const jsonText = '{' + raw;

  strapi.log.info(`SEO AI: Success with ${config.model}`);
  return JSON.parse(jsonText) as SeoGenerationResult;
}
