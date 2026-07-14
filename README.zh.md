# Strapi SEO AI 插件

> [**English**](./README.md) | 简体中文

一款 Strapi 5 插件，支持任意 **OpenAI 兼容** 或 **Anthropic** 协议的 AI 提供商，自动生成 SEO 元数据与 JSON-LD 结构化数据。

## 功能特性

- **多提供商支持**：支持 OpenAI、Anthropic、Groq、DeepSeek、OpenRouter、Ollama 及任何 OpenAI 兼容 API。
- **SEO 元数据生成**：自动生成 Meta 标题（≤ 60 字符）、Meta 描述（≤ 160 字符）、关键词、Meta Robots 及 JSON-LD 结构化数据。
- **JSON-LD 结构化数据**：基于内容分析自动生成合适的 JSON-LD（`Article`、`Product`、`FAQPage`、`WebPage` 等）。
- **零点击工作流**：在内容管理器的侧边栏点击"AI 生成"，即可自动填充所有 SEO 字段。
- **独立生成页面**：内置文本转元数据页面，支持快速按需生成。
- **Strapi 5 原生集成**：通过 `editView.right-links` 注入区域、`@strapi/design-system` UI 和 Strapi 内置的 `useForm` 钩子深度集成。
- **智能内容提取**：与 schema 无关的字段检测，支持 Strapi 5 Blocks 格式。
- **TypeScript**：100% 类型安全，零 `any`。

## 环境要求

- **Strapi v5.x**
- **Node.js >= 18.x**
- 所选 AI 提供商的 API 密钥

## 安装

```bash
npm install strapi-plugin-seo-ai
# 或
yarn add strapi-plugin-seo-ai
```

安装后重新构建 Strapi 管理面板：

```bash
npm run build
npm run develop
```

## 配置

### 选项 A：OpenAI 官方

在 `config/plugins.ts` 中：

```typescript
export default ({ env }) => ({
  'strapi-plugin-seo-ai': {
    enabled: true,
    config: {
      provider: 'openai-compatible',
      apiKey: env('OPENAI_API_KEY'),
      model: 'gpt-4o-mini',
      // baseURL 默认 https://api.openai.com/v1 — OpenAI 可省略
      maxTokens: 2048,
      temperature: 0.3,
    },
  },
});
```

### 选项 B：兼容 OpenAI 的第三方服务（Groq、DeepSeek、OpenRouter、Ollama 等）

**`baseURL` 必须填写**，否则请求会默认发往 OpenAI 的 API，导致第三方密钥认证失败。

```typescript
export default ({ env }) => ({
  'strapi-plugin-seo-ai': {
    enabled: true,
    config: {
      provider: 'openai-compatible',
      apiKey: env('GROQ_API_KEY'),
      baseURL: 'https://api.groq.com/openai/v1',   // ← 第三方服务必须填写
      model: 'llama-3.3-70b-versatile',
      maxTokens: 2048,
      temperature: 0.3,
    },
  },
});
```

常用 `baseURL` 值：
- Groq：     `https://api.groq.com/openai/v1`
- DeepSeek： `https://api.deepseek.com/v1`
- OpenRouter：`https://openrouter.ai/api/v1`
- Ollama：   `http://localhost:11434/v1`

### 选项 C：Anthropic（Claude）

```typescript
export default ({ env }) => ({
  'strapi-plugin-seo-ai': {
    enabled: true,
    config: {
      provider: 'anthropic',
      apiKey: env('ANTHROPIC_API_KEY'),
      model: 'claude-3-haiku-20240307',
      maxTokens: 2048,
      temperature: 0.3,
    },
  },
});
```

### 环境变量（`.env`）

```bash
# OpenAI 兼容：
OPENAI_API_KEY=sk-you******here

# Anthropic：
ANTHROPIC_API_KEY=sk-ant**********here
```

## 支持的提供商

| 提供商 | `provider` 值 | `baseURL` |
|---|---|---|
| OpenAI | `openai-compatible` | **省略**（默认 `https://api.openai.com/v1`） |
| Anthropic | `anthropic` | **无**（SDK 内置） |
| Groq | `openai-compatible` | **必需** — `https://api.groq.com/openai/v1` |
| DeepSeek | `openai-compatible` | **必需** — `https://api.deepseek.com/v1` |
| OpenRouter | `openai-compatible` | **必需** — `https://openrouter.ai/api/v1` |
| Ollama | `openai-compatible` | **必需** — `http://localhost:11434/v1` |
| vLLM / LocalAI | `openai-compatible` | **必需** — 你的服务器 URL |

> ⚠️ 非 OpenAI 服务必须填写 `baseURL`，否则请求会发往 OpenAI 导致失败。

## 使用方法

### 1. 创建 SEO 组件

插件使用名为 `SEO`（或 `seo`/`Seo`）的组件。创建 `src/components/shared/seo.json`：

```json
{
  "collectionName": "components_shared_seos",
  "info": {
    "displayName": "SEO",
    "icon": "search",
    "description": "文章和页面的 SEO 字段"
  },
  "options": {},
  "attributes": {
    "metaTitle":       { "type": "string", "maxLength": 60 },
    "metaDescription": { "type": "text",   "maxLength": 160 },
    "keywords":        { "type": "text" },
    "metaRobots":      { "type": "string", "default": "index, follow" },
    "structuredData":  { "type": "json" },
    "ogTitle":         { "type": "string", "maxLength": 60 },
    "ogDescription":   { "type": "text",   "maxLength": 300 },
    "ogImage":         { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "ogType": {
      "type": "enumeration",
      "enum": ["website", "article", "product", "profile"],
      "default": "article"
    },
    "canonicalURL":    { "type": "string" }
  }
}
```

### 2. 添加到内容类型

在 **Content-Type Builder** 中将 `SEO` 组件添加到内容类型。**字段名使用 `seo`**。

### 3. 生成元数据

1. 在 **Content Manager** 中打开一条内容。
2. 点击侧边栏的 **"AI 生成"** 按钮。
3. 检查后 **保存**。

### 4. 独立生成器

也可使用插件专用页面按需生成——粘贴内容即可立即获取结果。

### 5. 使用生成的 JSON-LD

AI 自动推断内容类型，生成对应的 JSON-LD：

**文章（Article）：**
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

**产品（Product）：**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "description": "...",
  "offers": { "@type": "Offer", "price": "..." }
}
```

**常见问题（FAQPage）：**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "退货政策是什么？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "30 天内可以无理由退货。"
      }
    },
    {
      "@type": "Question",
      "name": "发货需要多长时间？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "国内订单通常 3-5 个工作日送达。"
      }
    }
  ]
}
```

**网页（WebPage，默认）：**
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "...",
  "description": "..."
}
```

**前端渲染**，在 `<head>` 中嵌入：

```tsx
// Next.js / React
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(seo.structuredData) }}
/>
```

```html
<!-- 纯 HTML -->
<script type="application/ld+json">
  {"@context":"https://schema.org","@type":"Article","headline":"..."}
</script>
```

### 6. 通过 API 获取 SEO 数据

通过 Strapi 标准 Content API 获取 SEO 数据：

```bash
# 单条内容
GET /api/articles/{documentId}?populate=seo

# 列表
GET /api/articles?populate=seo
```

`structuredData` 以原生 JSON 对象返回，无需额外解析。

## 字段命名规范与自动检测

在内容管理器侧边栏点击 **"AI 生成"** 时，插件会自动扫描内容类型的表单字段，提取正文文本和结构化元数据。以下是插件识别的字段名列表。

### 正文内容字段（用于 AI 分析）

```
title, name, headline, subject, content, body,
description, text, article, summary, category,
tags, keywords, slug
```

> 如果以上字段均为空，插件会回退扫描**所有**长度超过 50 字符的字符串字段。

### 结构化元数据字段（用于精准 JSON-LD）

| JSON-LD 字段 | 扫描的字段名（按优先级） | 值类型 |
|---|---|---|
| **author（作者）** | `author`, `authorName`, `writer`, `creator`, `byline` | 纯文本，或包含 `name`/`username`/`displayName` 的关系对象 |
| **datePublished（发布时间）** | `datePublished`, `publishDate`, `publish_date`, `publishedAt`, `published`, `date`, `postDate`, `post_date`, `articleDate`, `article_date`, `releaseDate`, `release_date` | ISO 日期字符串或 Date 对象 |
| ↳ **兜底** | `createdAt`（Strapi 内置字段） | |
| **dateModified（修改时间）** | `dateModified`, `updatedAt`, `modified`, `lastUpdated`, `last_updated`, `modifiedAt`, `modified_at` | ISO 日期字符串或 Date 对象 |
| ↳ **兜底** | `updatedAt`（Strapi 内置字段） | |
| **image（图片）** | `main_image`, `cover`, `image`, `thumbnail`, `featuredImage`, `featured_image`, `banner`, `picture`, `photo`, `img`, `avatar`, `logo`, `hero` | Strapi 媒体关联（单图） |

> 插件同时支持 **camelCase**（如 `publishDate`）和 **snake_case**（如 `publish_date`）两种命名风格。

### 最佳实践

1. **发布时间使用 `publishedAt`** — Strapi 5 每个内容类型都内置了此生命周期字段，插件会自动检测。
2. **作者字段使用 `author`** — 如果是关联关系，请确保关联实体包含 `name` 或 `username` 字段。
3. **SEO 组件字段命名为 `seo`**（小写）— 插件按 `seo` → `SEO` → `Seo` 的顺序查找。
4. **如果自动检测未命中**，可将字段重命名为上表列出的名称，或在生成后手动补充缺失值。

## 故障排除

- **侧边栏未出现？** 重新构建管理面板（`npm run build`）。
- **生成失败？** 检查 API 密钥和模型名是否正确。第三方服务需确认 `baseURL` 已设置。
- **返回空响应？** 更换模型重试。
- **速率限制？** 降低 `temperature` 或换用更快模型。

## 架构

```
server/src/
├── config/index.ts          # 插件配置，提供商选择
├── controllers/controller.ts # POST /generate 端点
├── services/
│   ├── service.ts            # 统一服务 → 按 provider 分发
│   └── providers/
│       ├── openai-compatible.ts  # OpenAI SDK 提供商
│       └── anthropic.ts          # Anthropic SDK 提供商
├── routes/
│   ├── admin/index.ts
│   └── content-api/index.ts
admin/src/
├── index.ts                 # 管理插件入口 — 注入侧边栏
├── components/
│   └── SeoSidebarWidget.tsx  # 内容管理器侧边栏
├── pages/
│   └── HomePage.tsx          # 独立 SEO 生成器页面
└── translations/
    ├── en.json
    └── zh.json
    └── zh-Hans.json
```

## 许可证

MIT

---

_为 Strapi 5 开发的多提供商 AI生成SEO 插件。_
