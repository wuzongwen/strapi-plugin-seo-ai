"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const OpenAI__default = /* @__PURE__ */ _interopDefault(OpenAI);
const Anthropic__default = /* @__PURE__ */ _interopDefault(Anthropic);
const bootstrap = ({ strapi }) => {
};
const destroy = ({ strapi }) => {
};
const register = ({ strapi }) => {
};
const config = {
  default: {
    provider: "openai-compatible",
    apiKey: "",
    model: "gpt-4o-mini",
    maxTokens: 2048,
    temperature: 0.3
  },
  validator(config2) {
    const provider = config2.provider;
    if (provider !== "openai-compatible" && provider !== "anthropic") {
      throw new Error('SEO AI: provider must be "openai-compatible" or "anthropic"');
    }
    if (typeof config2.apiKey !== "string" || config2.apiKey.length === 0) {
      throw new Error("SEO AI: apiKey must be a non-empty string");
    }
    if (typeof config2.model !== "string" || config2.model.length === 0) {
      throw new Error("SEO AI: model must be a non-empty string");
    }
    if (config2.baseURL !== void 0 && typeof config2.baseURL !== "string") {
      throw new Error("SEO AI: baseURL must be a string");
    }
    if (config2.maxTokens !== void 0 && typeof config2.maxTokens !== "number") {
      throw new Error("SEO AI: maxTokens must be a number");
    }
    if (config2.temperature !== void 0 && typeof config2.temperature !== "number") {
      throw new Error("SEO AI: temperature must be a number");
    }
  }
};
const contentTypes = {};
const controller = ({ strapi }) => ({
  /**
   * Generates AI-powered SEO metadata based on provided content.
   */
  async generate(ctx) {
    const { content } = ctx.request.body;
    if (!content) {
      return ctx.badRequest("Content is required");
    }
    try {
      const result = await strapi.plugin("strapi-plugin-seo-ai").service("service").generateSeo(content);
      ctx.body = { data: result };
    } catch (error) {
      ctx.internalServerError(error instanceof Error ? error.message : String(error));
    }
  },
  /**
   * Health-check / index endpoint for the content-api.
   */
  async index(ctx) {
    ctx.body = { status: "ok", plugin: "strapi-plugin-seo-ai" };
  }
});
const controllers = {
  controller
};
const middlewares = {};
const policies = {};
const admin = {
  type: "admin",
  routes: [
    {
      method: "POST",
      path: "/generate",
      handler: "controller.generate",
      config: {
        policies: []
      }
    }
  ]
};
const routes = {
  admin
};
const SEO_PROMPT = `
You are an expert SEO copywriter.
Analyze the following content and generate comprehensive, highly optimized SEO metadata.

CRITICAL REQUIREMENTS — all fields are mandatory:
1. "title": Compelling title under 60 characters. Include primary keyword naturally.
2. "description": Compelling summary under 160 characters. Include primary keyword and call-to-action.
3. "keywords": 10-15 highly relevant comma-separated keywords. Include long-tail variations.
4. "metaRobots": Use "index, follow" for normal pages; "noindex, follow" for thin content; "noindex, nofollow" for sensitive pages.
5. "structuredData": Valid JSON-LD object. Detect content type (Article, Product, WebPage, FAQPage, etc.) and generate the appropriate schema.

   For Article: include @context, @type, @id, headline, description, datePublished, dateModified, author, publisher, mainEntityOfPage, image.

   For FAQPage: include @context, @type, "mainEntity" as an array of Question items. Each Question must have "name" (the question text) and "acceptedAnswer" (an Answer object with "text"). Example:
   {
     "@context": "https://schema.org",
     "@type": "FAQPage",
     "mainEntity": [{
       "@type": "Question",
       "name": "What is your return policy?",
       "acceptedAnswer": {
         "@type": "Answer",
         "text": "You can return any item within 30 days."
       }
     }]
   }

   For Product: include @context, @type, name, description, image, offers (price, priceCurrency, availability).

   Be thorough — extract all relevant information from the content.
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
  "structuredData": {},
  "ogTitle": "...",
  "ogDescription": "...",
  "ogType": "article",
  "canonicalURL": ""
}
`;
async function generateWithOpenAICompatible(content, config2, strapi) {
  const baseURL = config2.baseURL || "https://api.openai.com/v1";
  const client = new OpenAI__default.default({
    apiKey: config2.apiKey,
    baseURL
  });
  strapi.log.info(`SEO AI: Generating with ${config2.model} via ${baseURL}...`);
  const response = await client.chat.completions.create({
    model: config2.model,
    max_tokens: config2.maxTokens ?? 2048,
    temperature: config2.temperature ?? 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: SEO_PROMPT
      },
      {
        role: "user",
        content: `Content:
${content}`
      }
    ]
  });
  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("SEO AI: Empty response from OpenAI-compatible provider");
  }
  strapi.log.info(`SEO AI: Success with ${config2.model}`);
  return JSON.parse(raw);
}
async function generateWithAnthropic(content, config2, strapi) {
  const client = new Anthropic__default.default({
    apiKey: config2.apiKey
  });
  strapi.log.info(`SEO AI: Generating with ${config2.model} via Anthropic API...`);
  const response = await client.messages.create({
    model: config2.model,
    max_tokens: config2.maxTokens ?? 2048,
    temperature: config2.temperature ?? 0.3,
    system: SEO_PROMPT,
    messages: [
      {
        role: "user",
        content: `Content:
${content}`
      },
      {
        // Prefill assistant with '{' to force JSON output
        role: "assistant",
        content: "{"
      }
    ]
  });
  const raw = response.content.filter((block) => block.type === "text").map((block) => block.text).join("");
  if (!raw) {
    throw new Error("SEO AI: Empty response from Anthropic provider");
  }
  const jsonText = "{" + raw;
  strapi.log.info(`SEO AI: Success with ${config2.model}`);
  return JSON.parse(jsonText);
}
const service = ({ strapi }) => ({
  /**
   * Analyzes text content and generates optimized SEO metadata using
   * the configured AI provider (OpenAI-compatible or Anthropic).
   *
   * @param content - Raw text content for analysis.
   * @returns Parsed JSON metadata with title, description, keywords, metaRobots, and structuredData.
   */
  async generateSeo(content) {
    if (!content) {
      throw new Error("Content is required to generate SEO");
    }
    const config2 = strapi.config.get("plugin::strapi-plugin-seo-ai");
    if (!config2 || !config2.apiKey) {
      strapi.log.warn("SEO AI: Plugin config or apiKey is missing");
      throw new Error(
        "SEO AI: Please configure the API Key and provider in config/plugins.ts or .env"
      );
    }
    strapi.log.info(`SEO AI: Using provider "${config2.provider}"`);
    try {
      if (config2.provider === "anthropic") {
        return await generateWithAnthropic(content, config2, strapi);
      }
      return await generateWithOpenAICompatible(content, config2, strapi);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      strapi.log.error(`SEO AI: Generation failed — ${message}`);
      throw new Error(`SEO AI: Generation failed — ${message}`);
    }
  }
});
const services = {
  service
};
const index = {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  contentTypes,
  policies,
  middlewares
};
exports.default = index;
