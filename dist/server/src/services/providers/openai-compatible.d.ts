import { Core } from '@strapi/strapi';
import { PluginConfig } from '../../config';
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
export declare const SEO_PROMPT = "\nYou are an expert SEO copywriter.\nAnalyze the following content and generate comprehensive, highly optimized SEO metadata.\n\nCRITICAL REQUIREMENTS \u2014 all fields are mandatory:\n1. \"title\": Compelling title under 60 characters. Include primary keyword naturally.\n2. \"description\": Compelling summary under 160 characters. Include primary keyword and call-to-action.\n3. \"keywords\": 10-15 highly relevant comma-separated keywords. Include long-tail variations.\n4. \"metaRobots\": Use \"index, follow\" for normal pages; \"noindex, follow\" for thin content; \"noindex, nofollow\" for sensitive pages.\n5. \"structuredData\": REQUIRED \u2014 valid JSON-LD object. You MUST output a COMPLETE schema with ALL relevant fields filled in. NEVER output an empty object. Missing datePublished or author is unacceptable.\n\n   Detect the content type first (Article, Product, WebPage, FAQPage, etc.) and generate the correct schema:\n\n   \u2500\u2500 For Article \u2500\u2500\n   REQUIRED: @context, @type, headline, description, datePublished, author.\n   ALSO include: @id, dateModified, publisher, mainEntityOfPage, image (when available).\n   \"author\" must be {\"@type\": \"Person\", \"name\": \"...\"}. Extract the name from --- Provided Metadata --- or content.\n   \"datePublished\" MUST be a real ISO date string \u2014 use --- Provided Metadata --- if given, otherwise extract from content text. NEVER skip this field.\n\n   \u2500\u2500 For FAQPage \u2500\u2500\n   REQUIRED: @context, @type, \"mainEntity\" as an array of Question items.\n   Each Question: {\"@type\": \"Question\", \"name\": \"the question\", \"acceptedAnswer\": {\"@type\": \"Answer\", \"text\": \"the answer\"}}\n\n   \u2500\u2500 For Product \u2500\u2500\n   REQUIRED: @context, @type, name, description, offers (price, priceCurrency, availability).\n\n   \u2500\u2500 For WebPage \u2500\u2500\n   REQUIRED: @context, @type, name, description.\n\n   --- Provided Metadata ---\n   If the content contains a \"--- Provided Metadata ---\" section, those values (author, dates, image) are REAL form field data. You MUST use them directly. Do NOT ignore them.\n\n   CRITICAL: structuredData MUST be a full, populated JSON-LD object. NEVER output {}.\n6. \"ogTitle\": Open Graph title \u2014 should match meta title tone (max 60 chars).\n7. \"ogDescription\": Open Graph description \u2014 max 300 chars, optimized for social sharing with a hook.\n8. \"ogType\": \"article\" for blog/news, \"product\" for product pages, \"website\" for landing pages, \"profile\" for author pages.\n9. \"canonicalURL\": Leave as empty string \"\" \u2014 the user will set this manually.\n\nReturn ONLY valid JSON in this exact format:\n{\n  \"title\": \"...\",\n  \"description\": \"...\",\n  \"keywords\": \"...\",\n  \"metaRobots\": \"index, follow\",\n  \"structuredData\": { \"@context\": \"https://schema.org\", \"@type\": \"Article\", \"headline\": \"...\", \"description\": \"...\", \"datePublished\": \"2025-01-01T00:00:00Z\", \"author\": { \"@type\": \"Person\", \"name\": \"...\" } },\n  \"ogTitle\": \"...\",\n  \"ogDescription\": \"...\",\n  \"ogType\": \"article\",\n  \"canonicalURL\": \"\"\n}\n";
/**
 * Calls an OpenAI-compatible chat completion endpoint.
 *
 * Supports any service that speaks the OpenAI /v1/chat/completions protocol,
 * including Groq, DeepSeek, OpenRouter, Ollama, vLLM, etc.
 */
export declare function generateWithOpenAICompatible(content: string, config: PluginConfig, strapi: Core.Strapi, metadata?: Record<string, unknown>): Promise<SeoGenerationResult>;
