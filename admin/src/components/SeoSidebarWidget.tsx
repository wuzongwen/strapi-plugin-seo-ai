import { useState } from 'react';
import { Button, Box, Typography, Flex, Divider } from '@strapi/design-system';
import { Magic, Check } from '@strapi/icons';
import {
  useFetchClient,
  useNotification,
  unstable_useContentManagerContext as useContentManagerContext,
} from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';
import styled from 'styled-components';

const WidgetContainer = styled(Box)`
  width: 100%;
`;

interface GeneratedSeoData {
  title?: string;
  description?: string;
  keywords?: string | string[];
  metaRobots?: string;
  structuredData?: Record<string, unknown> | string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  canonicalURL?: string;
}

const SeoSidebarWidget = () => {
  const { formatMessage } = useIntl();
  const cmContext = useContentManagerContext();
  const { values, onChange } = cmContext.form;

  // Resolve the component UID from the content-type schema (e.g. "shared.ai-seo")
  const seoAttr =
    (cmContext.contentType?.attributes as Record<string, { component?: string }> | undefined)?.['seo'] ??
    (cmContext.contentType?.attributes as Record<string, { component?: string }> | undefined)?.['SEO'] ??
    (cmContext.contentType?.attributes as Record<string, { component?: string }> | undefined)?.['Seo'];

  const { post } = useFetchClient();
  const { toggleNotification } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedSeoData | null>(null);

  /**
   * Intelligently extracts readable text content from the current Strapi form state.
   *
   * Prioritizes standard content fields (like 'content', 'body', 'description')
   * and handles both plain strings and Strapi 5 Blocks (arrays of JSON).
   * Falls back to a global field scan if priority fields are empty.
   */
  const extractContentFromValues = (vals: Record<string, unknown>): string => {
    let text = '';
    const fieldsToTry = [
      'title',
      'name',
      'headline',
      'subject',
      'content',
      'body',
      'description',
      'text',
      'article',
      'summary',
      'category',
      'tags',
      'keywords',
      'slug',
    ];

    for (const field of fieldsToTry) {
      if (vals[field]) {
        if (typeof vals[field] === 'string') {
          text += `${field.toUpperCase()}: ${vals[field]}\n\n`;
        } else if (Array.isArray(vals[field]) || typeof vals[field] === 'object') {
          try {
            const stringified =
              typeof vals[field] === 'string' ? vals[field] : JSON.stringify(vals[field]);
            text += `${field.toUpperCase()}: ${stringified}\n\n`;
          } catch (_e) {
            // Ignore parse errors
          }
        }
      }
    }

    if (!text.trim()) {
      Object.entries(vals).forEach(([key, val]) => {
        if (key === 'seo' || key === 'SEO' || key.startsWith('meta')) return;

        if (typeof val === 'string' && val.length > 50) {
          text += val + '\n\n';
        } else if (Array.isArray(val) || (val !== null && typeof val === 'object')) {
          try {
            const str = JSON.stringify(val);
            if (str.length > 50) text += str + '\n\n';
          } catch (_e) {
            // Ignore parse errors
          }
        }
      });
    }
    return text.trim();
  };

  /**
   * Scans form values for an existing media (image) field and returns the
   * first matching Strapi media object. Handles both single media objects
   * and single-element arrays.
   */
  const findContentImage = (vals: Record<string, unknown>): Record<string, unknown> | undefined => {
    const imageFieldNames = [
      'main_image', 'cover', 'image', 'thumbnail', 'featuredImage', 'featured_image',
      'banner', 'picture', 'photo', 'img', 'avatar', 'logo', 'hero',
    ];

    for (const name of imageFieldNames) {
      const val = vals[name];
      if (!val) continue;

      // Single media object
      if (typeof val === 'object' && !Array.isArray(val)) {
        const media = val as Record<string, unknown>;
        if (media?.mime && typeof media.mime === 'string' && media.mime.startsWith('image/')) {
          return media;
        }
        // Some Strapi media objects stored differently — check for url/id
        if ((media?.url || media?.id) && media !== null) {
          return media;
        }
      }

      // Single-element array (Strapi can wrap single media)
      if (Array.isArray(val) && val.length === 1 && typeof val[0] === 'object' && val[0] !== null) {
        const media = val[0] as Record<string, unknown>;
        if (media?.mime && typeof media.mime === 'string' && media.mime.startsWith('image/')) {
          return media;
        }
        if ((media?.url || media?.id) && media !== null) {
          return media;
        }
      }
    }
    return undefined;
  };

  /**
   * Extracts structured metadata from form values for JSON-LD generation.
   * Scans for author, datePublished, dateModified, and image fields.
   */
  const extractMetadataFromValues = (vals: Record<string, unknown>): Record<string, unknown> => {
    const metadata: Record<string, unknown> = {};

    // --- Author detection ---
    const authorFields = ['author', 'authorName', 'writer', 'creator', 'byline'];
    for (const field of authorFields) {
      const val = vals[field];
      if (!val) continue;
      if (typeof val === 'string') { metadata.author = val; break; }
      if (typeof val === 'object' && !Array.isArray(val)) {
        const obj = val as Record<string, unknown>;
        const name = obj.name || obj.username || obj.displayName || obj.title || obj.email;
        if (name) { metadata.author = { '@type': 'Person', name }; break; }
      }
      if (Array.isArray(val) && val.length === 1 && typeof val[0] === 'object') {
        const obj = val[0] as Record<string, unknown>;
        const name = obj.name || obj.username || obj.displayName || obj.title;
        if (name) { metadata.author = { '@type': 'Person', name }; break; }
      }
    }

    // --- Helper: normalize any date value to ISO string ---
    const toDateString = (val: unknown): string | null => {
      if (!val) return null;
      if (typeof val === 'string') return val;
      if (val instanceof Date) return val.toISOString();
      if (typeof val === 'object' && typeof (val as Record<string, unknown>).toISOString === 'function') {
        return (val as { toISOString: () => string }).toISOString();
      }
      return null;
    };

    // --- Date detection ---
    const dateFields = [
      'datePublished', 'publishDate', 'publish_date',
      'publishedAt', 'published', 'date',
      'postDate', 'post_date', 'articleDate', 'article_date',
      'releaseDate', 'release_date',
    ];
    for (const field of dateFields) {
      const str = toDateString(vals[field]);
      if (str) { metadata.datePublished = str; break; }
    }
    if (!metadata.datePublished) {
      const createdAt = toDateString(vals['createdAt']);
      if (createdAt) metadata.datePublished = createdAt;
    }

    const modifiedFields = [
      'dateModified', 'updatedAt', 'modified', 'lastUpdated',
      'last_updated', 'modifiedAt', 'modified_at',
    ];
    for (const field of modifiedFields) {
      const str = toDateString(vals[field]);
      if (str) { metadata.dateModified = str; break; }
    }
    if (!metadata.dateModified) {
      const updatedAt = toDateString(vals['updatedAt']);
      if (updatedAt) metadata.dateModified = updatedAt;
    }

    // --- Image ---
    const img = findContentImage(vals);
    if (img) {
      const url = (img as Record<string, unknown>).url;
      if (url && typeof url === 'string') metadata.image = url;
    }

    return metadata;
  };

  const handleGenerateClick = async () => {
    try {
      const contentToAnalyze = extractContentFromValues(values);

      if (!contentToAnalyze || contentToAnalyze.length < 20) {
        toggleNotification({
          type: 'warning',
          message: formatMessage({
            id: 'seo-ai.warning.no-content',
            defaultMessage: 'Not enough content to generate SEO metadata.',
          }),
        });
        return;
      }

      setIsLoading(true);

      const metadata = extractMetadataFromValues(values);

      const { data } = await post('/strapi-plugin-seo-ai/generate', {
        content: contentToAnalyze,
        metadata,
      });

      if (data?.data) {
        const generated = data.data;
        setGeneratedData(generated);

        // Detect SEO field key (seo / SEO / Seo)
        const seoKey =
          values.SEO !== undefined ? 'SEO' :
          values.Seo !== undefined ? 'Seo' :
          'seo';

        const isRepeatable = Array.isArray(values[seoKey]);
        const seoPath = isRepeatable ? seoKey + '.0' : seoKey;

        // Build full component object — must include __component so Strapi
        // knows which schema to render (prevents collapsed / unexpandable state).
        const existingVal = values[seoKey] as Record<string, unknown> | null;

        const seoValue: Record<string, unknown> = {
          __component: seoAttr?.component || 'shared.seo',
          ...(existingVal?.id ? { id: existingVal.id } : {}),
          metaTitle: generated.title || '',
          metaDescription: generated.description ? generated.description.substring(0, 160) : '',
          keywords: Array.isArray(generated.keywords)
            ? generated.keywords.join(', ')
            : (generated.keywords || ''),
          metaRobots: generated.metaRobots || 'index, follow',
          structuredData:
            typeof generated.structuredData === 'string'
              ? JSON.parse(generated.structuredData)
              : (generated.structuredData || {}),
          ogTitle: generated.ogTitle || generated.title || '',
          ogDescription: generated.ogDescription || (generated.description ? generated.description.substring(0, 300) : ''),
          ogImage: findContentImage(values),
          ogType: generated.ogType || 'article',
          canonicalURL: generated.canonicalURL || '',
        };

        // Two-phase commit: first initialize the component with __component
        // so Strapi's ComponentInput transitions from Initializer to expanded fields,
        // then fill all values after React processes the state change.
        const componentInit: Record<string, unknown> = {
          __component: seoAttr?.component || 'shared.seo',
          ...(existingVal?.id ? { id: existingVal.id } : {}),
        };

        console.log('[SEO AI] Phase 1 — init component:', seoPath, componentInit);
        onChange(seoPath, componentInit);

        setTimeout(() => {
          console.log('[SEO AI] Phase 2 — fill values:', seoPath, seoValue);
          onChange(seoPath, seoValue);
        }, 50);

        toggleNotification({
          type: 'success',
          message: formatMessage({
            id: 'seo-ai.success.generated-applied',
            defaultMessage: 'SEO metadata generated and applied!',
          }),
        });
      }
    } catch (err: unknown) {
      console.error('Error generating SEO:', err);
      toggleNotification({
        type: 'danger',
        message: 'Failed to generate SEO metadata.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WidgetContainer
      background="neutral0"
      padding={4}
      hasRadius
      shadow="filterShadow"
      marginBottom={4}
      borderWidth="1px"
      borderStyle="solid"
      borderColor="neutral150"
    >
      <Flex direction="column" alignItems="stretch" gap={3}>
        <Typography variant="sigma" textColor="neutral600" textTransform="uppercase">
          SEO AI
        </Typography>

        <Divider />

        <Button
          fullWidth
          variant="secondary"
          size="S"
          startIcon={<Magic />}
          onClick={handleGenerateClick}
          loading={isLoading}
        >
          {formatMessage({ id: 'seo-ai.button.generate', defaultMessage: 'Generate with AI' })}
        </Button>

        {generatedData && (
          <Box
            background="success100"
            padding={3}
            hasRadius
            borderStyle="dashed"
            borderWidth="1px"
            borderColor="success200"
          >
            <Flex direction="column" gap={2} alignItems="stretch">
              <Flex gap={2}>
                <Check width={12} height={12} fill="success600" />
                <Typography variant="pi" fontWeight="bold" textColor="success600">
                  Applied to form
                </Typography>
              </Flex>
              <Box>
                <Typography variant="pi" textColor="neutral700" fontWeight="bold">
                  T:
                </Typography>{' '}
                <Typography variant="pi" textColor="neutral700">
                  {generatedData.title}
                </Typography>
              </Box>
              <Box>
                <Typography variant="pi" textColor="neutral700" fontWeight="bold">
                  D:
                </Typography>{' '}
                <Typography variant="pi" textColor="neutral700" ellipsis>
                  {generatedData.description?.substring(0, 60)}...
                </Typography>
              </Box>
            </Flex>
          </Box>
        )}
      </Flex>
    </WidgetContainer>
  );
};

export default SeoSidebarWidget;
