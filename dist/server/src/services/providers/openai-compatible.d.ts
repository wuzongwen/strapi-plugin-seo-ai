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
export declare const SEO_PROMPT = "\nYou are an expert SEO copywriter.\nAnalyze the following content and generate comprehensive, highly optimized SEO metadata.\n\nCRITICAL REQUIREMENTS \u2014 all fields are mandatory:\n1. \"title\": Compelling title under 60 characters. Include primary keyword naturally.\n2. \"description\": Compelling summary under 160 characters. Include primary keyword and call-to-action.\n3. \"keywords\": 10-15 highly relevant comma-separated keywords. Include long-tail variations.\n4. \"metaRobots\": Use \"index, follow\" for normal pages; \"noindex, follow\" for thin content; \"noindex, nofollow\" for sensitive pages.\n5. \"structuredData\": Valid JSON-LD object. Detect content type (Article, Product, WebPage, FAQPage, etc.) and generate the appropriate schema.\n\n   For Article: include @context, @type, @id, headline, description, datePublished, dateModified, author, publisher, mainEntityOfPage, image.\n\n   IMPORTANT: If \"--- Provided Metadata ---\" appears in the content, those values (author, dates, image URL) were extracted from real form fields. You MUST use them directly in structuredData \u2014 do not guess or omit them.\n\n   For FAQPage: include @context, @type, \"mainEntity\" as an array of Question items. Each Question must have \"name\" (the question text) and \"acceptedAnswer\" (an Answer object with \"text\"). Example:\n   {\n     \"@context\": \"https://schema.org\",\n     \"@type\": \"FAQPage\",\n     \"mainEntity\": [{\n       \"@type\": \"Question\",\n       \"name\": \"What is your return policy?\",\n       \"acceptedAnswer\": {\n         \"@type\": \"Answer\",\n         \"text\": \"You can return any item within 30 days.\"\n       }\n     }]\n   }\n\n   For Product: include @context, @type, name, description, image, offers (price, priceCurrency, availability).\n\n   Be thorough \u2014 extract all relevant information from the content.\n6. \"ogTitle\": Open Graph title \u2014 should match meta title tone (max 60 chars).\n7. \"ogDescription\": Open Graph description \u2014 max 300 chars, optimized for social sharing with a hook.\n8. \"ogType\": \"article\" for blog/news, \"product\" for product pages, \"website\" for landing pages, \"profile\" for author pages.\n9. \"canonicalURL\": Leave as empty string \"\" \u2014 the user will set this manually.\n\nReturn ONLY valid JSON in this exact format:\n{\n  \"title\": \"...\",\n  \"description\": \"...\",\n  \"keywords\": \"...\",\n  \"metaRobots\": \"index, follow\",\n  \"structuredData\": {},\n  \"ogTitle\": \"...\",\n  \"ogDescription\": \"...\",\n  \"ogType\": \"article\",\n  \"canonicalURL\": \"\"\n}\n";
/**
 * Calls an OpenAI-compatible chat completion endpoint.
 *
 * Supports any service that speaks the OpenAI /v1/chat/completions protocol,
 * including Groq, DeepSeek, OpenRouter, Ollama, vLLM, etc.
 */
export declare function generateWithOpenAICompatible(content: string, config: PluginConfig, strapi: Core.Strapi, metadata?: Record<string, unknown>): Promise<SeoGenerationResult>;
