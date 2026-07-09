import { Core } from '@strapi/strapi';
import { PluginConfig } from '../../config';
import { SeoGenerationResult } from './openai-compatible';
/**
 * Calls the Anthropic Messages API.
 *
 * Since Anthropic does not support a native JSON mode, we prefill
 * the assistant response with '{' to force JSON output.
 */
export declare function generateWithAnthropic(content: string, config: PluginConfig, strapi: Core.Strapi): Promise<SeoGenerationResult>;
