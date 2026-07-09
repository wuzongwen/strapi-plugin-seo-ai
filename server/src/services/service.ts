import type { Core } from '@strapi/strapi';
import type { PluginConfig } from '../config';
import type { SeoGenerationResult } from './providers/openai-compatible';
import { generateWithOpenAICompatible } from './providers/openai-compatible';
import { generateWithAnthropic } from './providers/anthropic';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Analyzes text content and generates optimized SEO metadata using
   * the configured AI provider (OpenAI-compatible or Anthropic).
   *
   * @param content - Raw text content for analysis.
   * @returns Parsed JSON metadata with title, description, keywords, metaRobots, and structuredData.
   */
  async generateSeo(content: string): Promise<SeoGenerationResult> {
    if (!content) {
      throw new Error('Content is required to generate SEO');
    }

    // @ts-ignore - strapi config typing is incomplete
    const config = strapi.config.get('plugin::strapi-plugin-seo-ai') as PluginConfig;

    if (!config || !config.apiKey) {
      strapi.log.warn('SEO AI: Plugin config or apiKey is missing');
      throw new Error(
        'SEO AI: Please configure the API Key and provider in config/plugins.ts or .env',
      );
    }

    strapi.log.info(`SEO AI: Using provider "${config.provider}"`);

    try {
      if (config.provider === 'anthropic') {
        return await generateWithAnthropic(content, config, strapi);
      }

      // Default: openai-compatible
      return await generateWithOpenAICompatible(content, config, strapi);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.error(`SEO AI: Generation failed — ${message}`);
      throw new Error(`SEO AI: Generation failed — ${message}`);
    }
  },
});

export default service;
