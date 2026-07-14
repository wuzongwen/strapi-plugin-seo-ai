import OpenAI from 'openai';
import type { Core } from '@strapi/strapi';
import type { PluginConfig } from '../../config';

/**
 * Shared interface that every provider must return.
 */
export interface SeoGenerationResult {
  title: string;
  description: string;
  keywords: string;
  metaRobots: string;
  structuredData: Record<string, unknown>;
  ogTitle: string;
  ogDescription: string;
  ogType: string;
  canonicalURL: string;
}

/**
 * The SEO prompt used across all providers.
 */
export const SEO_PROMPT = `
You are an expert SEO copywriter.
Analyze the following content and generate comprehensive, highly optimized SEO metadata.

CRITICAL REQUIREMENTS — all fields are mandatory:
1. "title": Compelling title under 60 characters. Include primary keyword naturally.
2. "description": Compelling summary under 160 characters. Include primary keyword and call-to-action.
3. "keywords": 10-15 highly relevant comma-separated keywords. Include long-tail variations.
4. "metaRobots": Use "index, follow" for normal pages; "noindex, follow" for thin content; "noindex, nofollow" for sensitive pages.
5. "structuredData": REQUIRED — valid JSON-LD object. You MUST output a COMPLETE schema with ALL relevant fields filled in. NEVER output an empty object. Missing datePublished or author is unacceptable.

   Detect the content type first (Article, Product, WebPage, FAQPage, etc.) and generate the correct schema:

   ── For Article ──
   REQUIRED: @context, @type, headline, description, datePublished, author.
   ALSO include: @id, dateModified, publisher, mainEntityOfPage, image (when available).
   "author" must be {"@type": "Person", "name": "..."}. Extract the name from --- Provided Metadata --- or content.
   "datePublished" MUST be a real ISO date string — use --- Provided Metadata --- if given, otherwise extract from content text. NEVER skip this field.

   ── For FAQPage ──
   REQUIRED: @context, @type, "mainEntity" as an array of Question items.
   Each Question: {"@type": "Question", "name": "the question", "acceptedAnswer": {"@type": "Answer", "text": "the answer"}}

   ── For Product ──
   REQUIRED: @context, @type, name, description, offers (price, priceCurrency, availability).

   ── For WebPage ──
   REQUIRED: @context, @type, name, description.

   --- Provided Metadata ---
   If the content contains a "--- Provided Metadata ---" section, those values (author, dates, image) are REAL form field data. You MUST use them directly. Do NOT ignore them.

   CRITICAL: structuredData MUST be a full, populated JSON-LD object. NEVER output {}.
6. "ogTitle": Open Graph title — should match meta title tone (max 60 chars).
7. "ogDescription": Open Graph description — max 300 chars, optimized for social sharing with a hook.
8. "ogType": "article" for blog/news, "product" for product pages, "website" for landing pages, "profile" for author pages.
9. "canonicalURL": Leave as empty string "" — the user will set this manually.

Return ONLY valid JSON in this exact format:
{
  "title": "...",
  "description": "...",
  "keywords": "...",
  "metaRobots": "index, follow",
  "structuredData": { "@context": "https://schema.org", "@type": "Article", "headline": "...", "description": "...", "datePublished": "2025-01-01T00:00:00Z", "author": { "@type": "Person", "name": "..." } },
  "ogTitle": "...",
  "ogDescription": "...",
  "ogType": "article",
  "canonicalURL": ""
}
`;

/**
 * Calls an OpenAI-compatible chat completion endpoint.
 *
 * Supports any service that speaks the OpenAI /v1/chat/completions protocol,
 * including Groq, DeepSeek, OpenRouter, Ollama, vLLM, etc.
 */
export async function generateWithOpenAICompatible(
  content: string,
  config: PluginConfig,
  strapi: Core.Strapi,
  metadata?: Record<string, unknown>,
): Promise<SeoGenerationResult> {
  const baseURL = config.baseURL || 'https://api.openai.com/v1';

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL,
  });

  strapi.log.info(`SEO AI: Generating with ${config.model} via ${baseURL}...`);

  const response = await client.chat.completions.create({
    model: config.model,
    max_tokens: config.maxTokens ?? 2048,
    temperature: config.temperature ?? 0.3,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: SEO_PROMPT,
      },
      {
        role: 'user',
        content: `Content:\n${content}${metadata && Object.keys(metadata).length > 0 ? '\n\n--- Provided Metadata (use these exact values in structuredData when applicable) ---\n' + JSON.stringify(metadata, null, 2) : ''}`,
      },
    ],
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error('SEO AI: Empty response from OpenAI-compatible provider');
  }

  strapi.log.info(`SEO AI: Success with ${config.model}`);
  return JSON.parse(raw) as SeoGenerationResult;
}
