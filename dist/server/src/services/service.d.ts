import { Core } from '@strapi/strapi';
import { SeoGenerationResult } from './providers/openai-compatible';
declare const service: ({ strapi }: {
    strapi: Core.Strapi;
}) => {
    /**
     * Analyzes text content and generates optimized SEO metadata using
     * the configured AI provider (OpenAI-compatible or Anthropic).
     *
     * @param content - Raw text content for analysis.
     * @param metadata - Optional structured metadata from form fields (author, dates, image).
     * @returns Parsed JSON metadata with title, description, keywords, metaRobots, and structuredData.
     */
    generateSeo(content: string, metadata?: Record<string, unknown>): Promise<SeoGenerationResult>;
};
export default service;
