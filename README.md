# Strapi SEO AI Plugin

> English | **[简体中文](./README.zh.md)**

A Strapi 5 plugin that generates SEO metadata and JSON-LD structured data using any AI provider that supports the **OpenAI Compatible** or **Anthropic** protocol.

## Features

- **Multi-Provider Support**: Works with OpenAI, Anthropic, Groq, DeepSeek, OpenRouter, Ollama, and any other OpenAI-compatible API.
- **SEO Metadata Generation**: Generates Meta Title (< 60 chars), Meta Description (< 160 chars), Keywords, Meta Robots, and JSON-LD Structured Data.
- **JSON-LD Structured Data**: Automatically generates appropriate JSON-LD (`Article`, `Product`, `WebPage`, etc.) based on content analysis.
- **Zero-Click Workflow**: Click "Generate with AI" in the Content Manager sidebar to auto-fill all SEO fields.
- **Standalone Page**: Built-in text-to-metadata page for quick ad-hoc generation.
- **Strapi 5 Native**: Deep integration via `editView.right-links` injection zone, `@strapi/design-system` UI, and Strapi's internal `useForm` hook.
- **Intelligent Content Extraction**: Schema-agnostic field detection with Strapi 5 Blocks support.
- **TypeScript**: 100% type-safe, zero `any`.

## Requirements

- **Strapi v5.x**
- **Node.js >= 18.x**
- An API key for your chosen AI provider

## Installation

```bash
npm install strapi-plugin-seo-ai
# or
yarn add strapi-plugin-seo-ai
```

After installation, rebuild the Strapi admin panel:

```bash
npm run build
npm run develop
```

## Configuration

### Option A: OpenAI Official

In `config/plugins.ts`:

```typescript
export default ({ env }) => ({
  'strapi-plugin-seo-ai': {
    enabled: true,
    config: {
      provider: 'openai-compatible',
      apiKey: env('OPENAI_API_KEY'),
      model: 'gpt-4o-mini',           // or 'gpt-4o', 'gpt-3.5-turbo', etc.
      // baseURL defaults to https://api.openai.com/v1 — omit it for OpenAI
      maxTokens: 2048,
      temperature: 0.3,
    },
  },
});
```

### Option B: OpenAI-Compatible Third-Party (Groq, DeepSeek, OpenRouter, Ollama, etc.)

**`baseURL` is required** for any non-OpenAI service. Without it, requests go to OpenAI's API and will fail with your third-party key.

```typescript
export default ({ env }) => ({
  'strapi-plugin-seo-ai': {
    enabled: true,
    config: {
      provider: 'openai-compatible',
      apiKey: env('GROQ_API_KEY'),
      baseURL: 'https://api.groq.com/openai/v1',   // ← REQUIRED for third-party
      model: 'llama-3.3-70b-versatile',
      maxTokens: 2048,
      temperature: 0.3,
    },
  },
});
```

Common `baseURL` values:
- Groq:     `https://api.groq.com/openai/v1`
- DeepSeek: `https://api.deepseek.com/v1`
- OpenRouter: `https://openrouter.ai/api/v1`
- Ollama:   `http://localhost:11434/v1`

### Option C: Anthropic (Claude)

In `config/plugins.ts`:

```typescript
export default ({ env }) => ({
  'strapi-plugin-seo-ai': {
    enabled: true,
    config: {
      provider: 'anthropic',
      apiKey: env('ANTHROPIC_API_KEY'),
      model: 'claude-3-haiku-20240307',  // or 'claude-3-5-sonnet-20241022', etc.
      maxTokens: 2048,
      temperature: 0.3,
    },
  },
});
```

### Environment Variables (`.env`)

```bash
# For OpenAI-compatible:
OPENAI_API_KEY=sk-your-key-here

# For Anthropic:
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## Supported Providers

| Provider | `provider` value | `baseURL` |
|---|---|---|
| OpenAI | `openai-compatible` | **Omit** (defaults to `https://api.openai.com/v1`) |
| Anthropic | `anthropic` | **None** (SDK built-in) |
| Groq | `openai-compatible` | **Required** — `https://api.groq.com/openai/v1` |
| DeepSeek | `openai-compatible` | **Required** — `https://api.deepseek.com/v1` |
| OpenRouter | `openai-compatible` | **Required** — `https://openrouter.ai/api/v1` |
| Ollama | `openai-compatible` | **Required** — `http://localhost:11434/v1` |
| vLLM / LocalAI | `openai-compatible` | **Required** — your server URL |

> ⚠️ For any non-OpenAI service, `baseURL` is **mandatory**. Omitting it sends requests to OpenAI's API, which will reject your third-party key.

## Usage

### 1. Create the SEO Component

The plugin works with a component named `SEO` (or `seo`/`Seo`). Create `src/components/shared/seo.json`:

```json
{
  "collectionName": "components_shared_seos",
  "info": {
    "displayName": "SEO",
    "icon": "search",
    "description": "SEO fields for articles and pages"
  },
  "options": {},
  "attributes": {
    "metaTitle": {
      "type": "string",
      "maxLength": 60
    },
    "metaDescription": {
      "type": "text",
      "maxLength": 160
    },
    "keywords": {
      "type": "text"
    },
    "metaRobots": {
      "type": "string",
      "default": "index, follow"
    },
    "structuredData": {
      "type": "json"
    },
    "ogTitle": {
      "type": "string",
      "maxLength": 60
    },
    "ogDescription": {
      "type": "text",
      "maxLength": 300
    },
    "ogImage": {
      "type": "string"
    },
    "ogType": {
      "type": "enumeration",
      "enum": ["website", "article", "product", "profile"],
      "default": "article"
    },
    "canonicalURL": {
      "type": "string"
    }
  }
}
```

### 2. Add to Content-Type

In the **Content-Type Builder**, add the `SEO` component to your Content-Types. Use `seo` as the field name.

### 3. Generate Metadata

1. Open an entry in the **Content Manager**.
2. Click **"Generate with AI"** in the sidebar.
3. Review and **Save**.

### 4. Standalone Generator

You can also use the plugin's dedicated page for ad-hoc metadata generation — paste content and get results immediately.

### 5. Using the Generated JSON-LD

The AI automatically infers the content type and generates a valid JSON-LD object stored in `structuredData`:

**Article:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "...",
  "description": "...",
  "datePublished": "2025-01-01",
  "author": { "@type": "Person", "name": "..." }
}
```

**Product:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "description": "...",
  "offers": { "@type": "Offer", "price": "..." }
}
```

**WebPage** (default fallback):
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "...",
  "description": "..."
}
```

**To render it on your frontend**, embed it in `<head>` as a `<script type="application/ld+json">` tag:

```tsx
// Next.js / React example
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify(seo.structuredData)
  }}
/>
```

```html
<!-- Plain HTML -->
<script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Article","headline":"..."}
</script>
```

Strapi's REST API returns `structuredData` as a native JSON object — no extra parsing needed.

> ⚠️ AI-generated JSON-LD may need manual review. Missing data (dates, authors) won't be invented by the AI — fill them in yourself if needed.

## Troubleshooting

- **Widget not appearing?** Rebuild the admin panel (`npm run build`).
- **Generation failing?** Verify your API key and model name are correct. If using a third-party provider, ensure `baseURL` is set — without it requests go to OpenAI by default. Check that the provider's API is accessible from your server.
- **Empty response from provider?** Some local models require explicit JSON mode support. Try a different model.
- **Rate limiting?** Reduce `temperature` or switch to a faster model like `claude-3-haiku` or `gpt-4o-mini`.

## Architecture

```
server/src/
├── config/index.ts          # Plugin configuration with provider selection
├── controllers/controller.ts # POST /generate endpoint
├── services/
│   ├── service.ts            # Unified service — dispatches to active provider
│   └── providers/
│       ├── openai-compatible.ts  # OpenAI SDK-based provider
│       └── anthropic.ts          # Anthropic SDK-based provider
├── routes/
│   ├── admin/index.ts       # Admin API routes
│   └── content-api/index.ts # Content API routes
admin/src/
├── index.ts                 # Admin plugin entry — injects sidebar widget
├── components/
│   └── SeoSidebarWidget.tsx  # Content Manager sidebar widget
├── pages/
│   └── HomePage.tsx          # Standalone SEO generator page
└── translations/
    ├── en.json
    └── zh.json
```

## License

MIT

---

_Developed as a multi-provider SEO AI plugin for Strapi 5._
