"use strict";
Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: "Module" } });
const jsxRuntime = require("react/jsx-runtime");
const react = require("react");
const designSystem = require("@strapi/design-system");
const icons = require("@strapi/icons");
const admin = require("@strapi/strapi/admin");
const reactIntl = require("react-intl");
const styled = require("styled-components");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const styled__default = /* @__PURE__ */ _interopDefault(styled);
const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
const WidgetContainer = styled__default.default(designSystem.Box)`
  width: 100%;
`;
const SeoSidebarWidget = () => {
  const { formatMessage } = reactIntl.useIntl();
  const cmContext = admin.unstable_useContentManagerContext();
  const { values, onChange } = cmContext.form;
  const seoAttr = cmContext.contentType?.attributes?.["seo"] ?? cmContext.contentType?.attributes?.["SEO"] ?? cmContext.contentType?.attributes?.["Seo"];
  const { post } = admin.useFetchClient();
  const { toggleNotification } = admin.useNotification();
  const [isLoading, setIsLoading] = react.useState(false);
  const [generatedData, setGeneratedData] = react.useState(null);
  const extractContentFromValues = (vals) => {
    let text = "";
    const fieldsToTry = [
      "title",
      "name",
      "headline",
      "subject",
      "content",
      "body",
      "description",
      "text",
      "article",
      "summary",
      "category",
      "tags",
      "keywords",
      "slug"
    ];
    for (const field of fieldsToTry) {
      if (vals[field]) {
        if (typeof vals[field] === "string") {
          text += `${field.toUpperCase()}: ${vals[field]}

`;
        } else if (Array.isArray(vals[field]) || typeof vals[field] === "object") {
          try {
            const stringified = typeof vals[field] === "string" ? vals[field] : JSON.stringify(vals[field]);
            text += `${field.toUpperCase()}: ${stringified}

`;
          } catch (_e) {
          }
        }
      }
    }
    if (!text.trim()) {
      Object.entries(vals).forEach(([key, val]) => {
        if (key === "seo" || key === "SEO" || key.startsWith("meta")) return;
        if (typeof val === "string" && val.length > 50) {
          text += val + "\n\n";
        } else if (Array.isArray(val) || val !== null && typeof val === "object") {
          try {
            const str = JSON.stringify(val);
            if (str.length > 50) text += str + "\n\n";
          } catch (_e) {
          }
        }
      });
    }
    return text.trim();
  };
  const findContentImage = (vals) => {
    const imageFieldNames = [
      "main_image",
      "cover",
      "image",
      "thumbnail",
      "featuredImage",
      "featured_image",
      "banner",
      "picture",
      "photo",
      "img",
      "avatar",
      "logo",
      "hero"
    ];
    for (const name of imageFieldNames) {
      const val = vals[name];
      if (!val) continue;
      if (typeof val === "object" && !Array.isArray(val)) {
        const media = val;
        if (media?.mime && typeof media.mime === "string" && media.mime.startsWith("image/")) {
          return media;
        }
        if ((media?.url || media?.id) && media !== null) {
          return media;
        }
      }
      if (Array.isArray(val) && val.length === 1 && typeof val[0] === "object" && val[0] !== null) {
        const media = val[0];
        if (media?.mime && typeof media.mime === "string" && media.mime.startsWith("image/")) {
          return media;
        }
        if ((media?.url || media?.id) && media !== null) {
          return media;
        }
      }
    }
    return void 0;
  };
  const extractMetadataFromValues = (vals) => {
    const metadata = {};
    const authorFields = ["author", "authorName", "writer", "creator", "byline"];
    for (const field of authorFields) {
      const val = vals[field];
      if (!val) continue;
      if (typeof val === "string") {
        metadata.author = val;
        break;
      }
      if (typeof val === "object" && !Array.isArray(val)) {
        const obj = val;
        const name = obj.name || obj.username || obj.displayName || obj.title || obj.email;
        if (name) {
          metadata.author = { "@type": "Person", name };
          break;
        }
      }
      if (Array.isArray(val) && val.length === 1 && typeof val[0] === "object") {
        const obj = val[0];
        const name = obj.name || obj.username || obj.displayName || obj.title;
        if (name) {
          metadata.author = { "@type": "Person", name };
          break;
        }
      }
    }
    const dateFields = ["datePublished", "publishDate", "publishedAt", "published", "date"];
    for (const field of dateFields) {
      const val = vals[field];
      if (val && typeof val === "string") {
        metadata.datePublished = val;
        break;
      }
    }
    const modifiedFields = ["dateModified", "updatedAt", "modified", "lastUpdated"];
    for (const field of modifiedFields) {
      const val = vals[field];
      if (val && typeof val === "string") {
        metadata.dateModified = val;
        break;
      }
    }
    const img = findContentImage(vals);
    if (img) {
      const url = img.url;
      if (url && typeof url === "string") metadata.image = url;
    }
    return metadata;
  };
  const handleGenerateClick = async () => {
    try {
      const contentToAnalyze = extractContentFromValues(values);
      if (!contentToAnalyze || contentToAnalyze.length < 20) {
        toggleNotification({
          type: "warning",
          message: formatMessage({
            id: "seo-ai.warning.no-content",
            defaultMessage: "Not enough content to generate SEO metadata."
          })
        });
        return;
      }
      setIsLoading(true);
      const metadata = extractMetadataFromValues(values);
      const { data } = await post("/strapi-plugin-seo-ai/generate", {
        content: contentToAnalyze,
        metadata
      });
      if (data?.data) {
        const generated = data.data;
        setGeneratedData(generated);
        const seoKey = values.SEO !== void 0 ? "SEO" : values.Seo !== void 0 ? "Seo" : "seo";
        const isRepeatable = Array.isArray(values[seoKey]);
        const seoPath = isRepeatable ? seoKey + ".0" : seoKey;
        const existingVal = values[seoKey];
        const seoValue = {
          __component: seoAttr?.component || "shared.seo",
          ...existingVal?.id ? { id: existingVal.id } : {},
          metaTitle: generated.title || "",
          metaDescription: generated.description ? generated.description.substring(0, 160) : "",
          keywords: Array.isArray(generated.keywords) ? generated.keywords.join(", ") : generated.keywords || "",
          metaRobots: generated.metaRobots || "index, follow",
          structuredData: typeof generated.structuredData === "string" ? JSON.parse(generated.structuredData) : generated.structuredData || {},
          ogTitle: generated.ogTitle || generated.title || "",
          ogDescription: generated.ogDescription || (generated.description ? generated.description.substring(0, 300) : ""),
          ogImage: findContentImage(values),
          ogType: generated.ogType || "article",
          canonicalURL: generated.canonicalURL || ""
        };
        const componentInit = {
          __component: seoAttr?.component || "shared.seo",
          ...existingVal?.id ? { id: existingVal.id } : {}
        };
        console.log("[SEO AI] Phase 1 — init component:", seoPath, componentInit);
        onChange(seoPath, componentInit);
        setTimeout(() => {
          console.log("[SEO AI] Phase 2 — fill values:", seoPath, seoValue);
          onChange(seoPath, seoValue);
        }, 50);
        toggleNotification({
          type: "success",
          message: formatMessage({
            id: "seo-ai.success.generated-applied",
            defaultMessage: "SEO metadata generated and applied!"
          })
        });
      }
    } catch (err) {
      console.error("Error generating SEO:", err);
      toggleNotification({
        type: "danger",
        message: "Failed to generate SEO metadata."
      });
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    WidgetContainer,
    {
      background: "neutral0",
      padding: 4,
      hasRadius: true,
      shadow: "filterShadow",
      marginBottom: 4,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "neutral150",
      children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { direction: "column", alignItems: "stretch", gap: 3, children: [
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "sigma", textColor: "neutral600", textTransform: "uppercase", children: "SEO AI" }),
        /* @__PURE__ */ jsxRuntime.jsx(designSystem.Divider, {}),
        /* @__PURE__ */ jsxRuntime.jsx(
          designSystem.Button,
          {
            fullWidth: true,
            variant: "secondary",
            size: "S",
            startIcon: /* @__PURE__ */ jsxRuntime.jsx(icons.Magic, {}),
            onClick: handleGenerateClick,
            loading: isLoading,
            children: formatMessage({ id: "seo-ai.button.generate", defaultMessage: "Generate with AI" })
          }
        ),
        generatedData && /* @__PURE__ */ jsxRuntime.jsx(
          designSystem.Box,
          {
            background: "success100",
            padding: 3,
            hasRadius: true,
            borderStyle: "dashed",
            borderWidth: "1px",
            borderColor: "success200",
            children: /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { direction: "column", gap: 2, alignItems: "stretch", children: [
              /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Flex, { gap: 2, children: [
                /* @__PURE__ */ jsxRuntime.jsx(icons.Check, { width: 12, height: 12, fill: "success600" }),
                /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "pi", fontWeight: "bold", textColor: "success600", children: "Applied to form" })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "pi", textColor: "neutral700", fontWeight: "bold", children: "T:" }),
                " ",
                /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "pi", textColor: "neutral700", children: generatedData.title })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Box, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(designSystem.Typography, { variant: "pi", textColor: "neutral700", fontWeight: "bold", children: "D:" }),
                " ",
                /* @__PURE__ */ jsxRuntime.jsxs(designSystem.Typography, { variant: "pi", textColor: "neutral700", ellipsis: true, children: [
                  generatedData.description?.substring(0, 60),
                  "..."
                ] })
              ] })
            ] })
          }
        )
      ] })
    }
  );
};
const PLUGIN_ID = "strapi-plugin-seo-ai";
const PluginIcon = () => /* @__PURE__ */ jsxRuntime.jsx(icons.PuzzlePiece, {});
const index = {
  register(app) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: "SEO AI"
      },
      Component: async () => {
        const { HomePage } = await Promise.resolve().then(() => require("./HomePage-CXqJ80fj.js"));
        return HomePage;
      },
      permissions: []
    });
    const contentManagerPlugin = app.getPlugin("content-manager");
    if (contentManagerPlugin) {
      contentManagerPlugin.injectComponent("editView", "right-links", {
        name: "seo-ai-sidebar",
        Component: SeoSidebarWidget
      });
    }
  },
  async registerTrads({ locales }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "./translations/en.json": () => Promise.resolve().then(() => require("./en-8g1KVzVY.js")), "./translations/zh-Hans.json": () => Promise.resolve().then(() => require("./zh-Hans-BaXkAI-V.js")), "./translations/zh.json": () => Promise.resolve().then(() => require("./zh-D5yU5zVU.js")) }), `./translations/${locale}.json`, 3);
          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  }
};
exports.default = index;
