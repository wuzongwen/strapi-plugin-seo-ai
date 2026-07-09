import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useCallback, useMemo } from "react";
import { Box, Flex, Typography, Main, Field, Textarea, Button } from "@strapi/design-system";
import { useFetchClient } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";
import styled, { keyframes } from "styled-components";
const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
`;
const SkeletonBox = styled(Box)`
  animation: ${pulse} 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: ${({ theme }) => theme.colors.neutral200};
  border-radius: ${({ theme }) => theme.borderRadius};
  height: ${(props) => props.$height || "20px"};
  width: ${(props) => props.$width || "100%"};
`;
const CustomGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: ${({ theme }) => theme.spaces[8]};

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
  }
`;
const CustomGridItem = styled.div`
  min-width: 0;
  width: 100%;
`;
const PremiumCard = styled(Box)`
  transition: all 0.2s ease-in-out;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.tableShadow};
    border-color: ${({ theme }) => theme.colors.neutral300};
  }
`;
const PremiumButton = styled(Button)`
  padding-left: ${({ theme }) => theme.spaces[6]};
  padding-right: ${({ theme }) => theme.spaces[6]};
  padding-top: ${({ theme }) => theme.spaces[3]};
  padding-bottom: ${({ theme }) => theme.spaces[3]};
  font-weight: 600;
  letter-spacing: 0.2px;
  transition: transform 0.1s ease;

  &:active {
    transform: scale(0.98);
  }
`;
const CopyButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.neutral500};
  font-size: ${({ theme }) => theme.fontSizes[1]};
  font-weight: 600;
  cursor: pointer;
  padding: ${({ theme }) => `${theme.spaces[1]} ${theme.spaces[2]}`};
  border-radius: ${({ theme }) => theme.borderRadius};
  transition: all 0.15s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.neutral800};
    background-color: ${({ theme }) => theme.colors.neutral150};
  }
`;
const MetaLabel = styled(Typography)`
  letter-spacing: 1px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.neutral600};
`;
const t = (id, defaultMessage) => ({ id: `seo-ai.home.${id}`, defaultMessage });
const HomePage = () => {
  const { formatMessage } = useIntl();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copiedState, setCopiedState] = useState({});
  const { post } = useFetchClient();
  const handleGenerate = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setCopiedState({});
    try {
      const { data } = await post("/strapi-plugin-seo-ai/generate", {
        content
      });
      setResult(data.data);
    } catch (err) {
      const errorObj = err;
      setError(
        errorObj.response?.data?.error?.message || errorObj.message || formatMessage(t("error", "An error occurred during generation."))
      );
    } finally {
      setLoading(false);
    }
  };
  const copyTimeouts = useRef({});
  const handleCopy = useCallback((text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));
    if (copyTimeouts.current[key]) {
      clearTimeout(copyTimeouts.current[key]);
    }
    copyTimeouts.current[key] = setTimeout(() => {
      setCopiedState((prev) => ({ ...prev, [key]: false }));
    }, 2e3);
  }, []);
  const copyLabel = useCallback(
    (key) => copiedState[key] ? formatMessage(t("copied", "Copied!")) : formatMessage(t("copy", "Copy")),
    [copiedState, formatMessage]
  );
  const noData = formatMessage(t("no-data", "No data generated"));
  const resultsColumn = useMemo(() => {
    return /* @__PURE__ */ jsx(CustomGridItem, { children: /* @__PURE__ */ jsxs(Box, { paddingLeft: 4, children: [
      loading && /* @__PURE__ */ jsxs(Flex, { direction: "column", gap: 8, children: [
        /* @__PURE__ */ jsxs(Box, { children: [
          /* @__PURE__ */ jsx(SkeletonBox, { $width: "120px", $height: "16px", marginBottom: 3 }),
          /* @__PURE__ */ jsx(SkeletonBox, { $height: "60px" })
        ] }),
        /* @__PURE__ */ jsxs(Box, { children: [
          /* @__PURE__ */ jsx(SkeletonBox, { $width: "140px", $height: "16px", marginBottom: 3 }),
          /* @__PURE__ */ jsx(SkeletonBox, { $height: "80px" })
        ] }),
        /* @__PURE__ */ jsxs(Box, { children: [
          /* @__PURE__ */ jsx(SkeletonBox, { $width: "100px", $height: "16px", marginBottom: 3 }),
          /* @__PURE__ */ jsx(SkeletonBox, { $height: "40px" })
        ] }),
        /* @__PURE__ */ jsxs(Box, { children: [
          /* @__PURE__ */ jsx(SkeletonBox, { $width: "110px", $height: "16px", marginBottom: 3 }),
          /* @__PURE__ */ jsx(SkeletonBox, { $height: "30px" })
        ] }),
        /* @__PURE__ */ jsxs(Box, { children: [
          /* @__PURE__ */ jsx(SkeletonBox, { $width: "150px", $height: "16px", marginBottom: 3 }),
          /* @__PURE__ */ jsx(SkeletonBox, { $height: "100px" })
        ] })
      ] }),
      !loading && !result && /* @__PURE__ */ jsx(
        Flex,
        {
          justifyContent: "center",
          alignItems: "center",
          style: { height: "300px", border: "1px dashed #eaeaef", borderRadius: "8px" },
          children: /* @__PURE__ */ jsx(Typography, { textColor: "neutral500", children: formatMessage(t("placeholder", "Metadata will appear here.")) })
        }
      ),
      result && !loading && /* @__PURE__ */ jsxs(Flex, { direction: "column", alignItems: "stretch", gap: 6, children: [
        /* @__PURE__ */ jsxs(PremiumCard, { background: "neutral0", padding: 5, hasRadius: true, children: [
          /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", marginBottom: 3, children: [
            /* @__PURE__ */ jsx(MetaLabel, { variant: "pi", fontWeight: "bold", children: formatMessage(t("meta-title", "Meta Title")) }),
            /* @__PURE__ */ jsx(CopyButton, { onClick: () => handleCopy(result.title, "title"), children: copyLabel("title") })
          ] }),
          /* @__PURE__ */ jsx(Typography, { variant: "epsilon", style: { lineHeight: "1.5" }, children: result.title || noData })
        ] }),
        /* @__PURE__ */ jsxs(PremiumCard, { background: "neutral0", padding: 5, hasRadius: true, children: [
          /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", marginBottom: 3, children: [
            /* @__PURE__ */ jsx(MetaLabel, { variant: "pi", fontWeight: "bold", children: formatMessage(t("meta-description", "Meta Description")) }),
            /* @__PURE__ */ jsx(CopyButton, { onClick: () => handleCopy(result.description, "description"), children: copyLabel("description") })
          ] }),
          /* @__PURE__ */ jsx(Typography, { variant: "epsilon", style: { lineHeight: "1.5" }, children: result.description || noData })
        ] }),
        /* @__PURE__ */ jsxs(PremiumCard, { background: "neutral0", padding: 5, hasRadius: true, children: [
          /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", marginBottom: 3, children: [
            /* @__PURE__ */ jsx(MetaLabel, { variant: "pi", fontWeight: "bold", children: formatMessage(t("keywords", "Keywords")) }),
            /* @__PURE__ */ jsx(
              CopyButton,
              {
                onClick: () => handleCopy(
                  Array.isArray(result.keywords) ? result.keywords.join(", ") : result.keywords,
                  "keywords"
                ),
                children: copyLabel("keywords")
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Typography, { variant: "epsilon", style: { lineHeight: "1.5" }, children: Array.isArray(result.keywords) ? result.keywords.join(", ") : result.keywords || noData })
        ] }),
        result.metaRobots && /* @__PURE__ */ jsxs(PremiumCard, { background: "neutral0", padding: 5, hasRadius: true, children: [
          /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", marginBottom: 3, children: [
            /* @__PURE__ */ jsx(MetaLabel, { variant: "pi", fontWeight: "bold", children: formatMessage(t("meta-robots", "Meta Robots")) }),
            /* @__PURE__ */ jsx(CopyButton, { onClick: () => handleCopy(result.metaRobots || "", "metaRobots"), children: copyLabel("metaRobots") })
          ] }),
          /* @__PURE__ */ jsx(Typography, { variant: "epsilon", style: { lineHeight: "1.5" }, children: result.metaRobots })
        ] }),
        result.structuredData && /* @__PURE__ */ jsxs(PremiumCard, { background: "neutral0", padding: 5, hasRadius: true, children: [
          /* @__PURE__ */ jsxs(Flex, { justifyContent: "space-between", alignItems: "center", marginBottom: 3, children: [
            /* @__PURE__ */ jsx(MetaLabel, { variant: "pi", fontWeight: "bold", children: formatMessage(t("structured-data", "Structured Data (JSON-LD)")) }),
            /* @__PURE__ */ jsx(
              CopyButton,
              {
                onClick: () => handleCopy(JSON.stringify(result.structuredData, null, 2), "structuredData"),
                children: copyLabel("structuredData")
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            Box,
            {
              background: "neutral100",
              padding: 3,
              hasRadius: true,
              style: { overflowX: "auto", maxHeight: "200px", fontSize: "12px" },
              children: /* @__PURE__ */ jsx("pre", { style: { margin: 0, fontFamily: "monospace" }, children: JSON.stringify(result.structuredData, null, 2) })
            }
          )
        ] })
      ] })
    ] }) });
  }, [loading, result, copiedState, handleCopy, formatMessage, noData, copyLabel]);
  return /* @__PURE__ */ jsx(Main, { children: /* @__PURE__ */ jsx(Box, { padding: 10, background: "neutral0", minHeight: "100vh", children: /* @__PURE__ */ jsxs(Box, { maxWidth: "1200px", margin: "0 auto", children: [
    /* @__PURE__ */ jsxs(Box, { marginBottom: 10, children: [
      /* @__PURE__ */ jsx(Typography, { variant: "alpha", tag: "h1", fontWeight: "bold", style: { letterSpacing: "-0.5px" }, children: formatMessage(t("title", "SEO Metadata Generator")) }),
      /* @__PURE__ */ jsx(Box, { marginTop: 3, children: /* @__PURE__ */ jsx(Typography, { variant: "epsilon", textColor: "neutral600", children: formatMessage(t("subtitle", "Paste your content here to generate optimized SEO metadata & JSON-LD.")) }) })
    ] }),
    /* @__PURE__ */ jsxs(CustomGrid, { children: [
      /* @__PURE__ */ jsx(CustomGridItem, { children: /* @__PURE__ */ jsxs(Flex, { direction: "column", alignItems: "stretch", gap: 6, children: [
        /* @__PURE__ */ jsxs(Field.Root, { error: error || void 0, children: [
          /* @__PURE__ */ jsx(
            Textarea,
            {
              placeholder: formatMessage(t("textarea-placeholder", "Enter your article or page content...")),
              value: content,
              onChange: (e) => setContent(e.target.value),
              rows: 16,
              style: { fontSize: "15px", lineHeight: "1.6", padding: "16px" }
            }
          ),
          /* @__PURE__ */ jsx(Field.Error, {})
        ] }),
        /* @__PURE__ */ jsx(Box, { children: /* @__PURE__ */ jsx(
          PremiumButton,
          {
            onClick: handleGenerate,
            loading,
            disabled: !content.trim(),
            size: "L",
            children: formatMessage(t("generate", "Generate Metadata"))
          }
        ) })
      ] }) }),
      resultsColumn
    ] })
  ] }) }) });
};
export {
  HomePage
};
