import { useState, useCallback, useRef, useMemo } from 'react';
import { Main, Box, Typography, Textarea, Button, Flex, Field } from '@strapi/design-system';
import { useFetchClient } from '@strapi/strapi/admin';
import { useIntl } from 'react-intl';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
`;

interface SkeletonProps {
  $height?: string;
  $width?: string;
}

const SkeletonBox = styled(Box)<SkeletonProps>`
  animation: ${pulse} 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: ${({ theme }) => theme.colors.neutral200};
  border-radius: ${({ theme }) => theme.borderRadius};
  height: ${(props) => props.$height || '20px'};
  width: ${(props) => props.$width || '100%'};
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

interface SeoResult {
  title: string;
  description: string;
  keywords: string | string[];
  metaRobots?: string;
  structuredData?: Record<string, unknown>;
}

const t = (id: string, defaultMessage: string) => ({ id: `seo-ai.home.${id}`, defaultMessage });

const HomePage = () => {
  const { formatMessage } = useIntl();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeoResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<{ [key: string]: boolean }>({});

  const { post } = useFetchClient();

  const handleGenerate = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setCopiedState({});

    try {
      const { data } = await post('/strapi-plugin-seo-ai/generate', {
        content,
      });

      setResult(data.data);
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { error?: { message?: string } } };
        message?: string;
      };
      setError(
        errorObj.response?.data?.error?.message ||
          errorObj.message ||
          formatMessage(t('error', 'An error occurred during generation.')),
      );
    } finally {
      setLoading(false);
    }
  };

  const copyTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const handleCopy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState((prev) => ({ ...prev, [key]: true }));

    if (copyTimeouts.current[key]) {
      clearTimeout(copyTimeouts.current[key]);
    }

    copyTimeouts.current[key] = setTimeout(() => {
      setCopiedState((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  }, []);

  const copyLabel = useCallback(
    (key: string) =>
      copiedState[key]
        ? formatMessage(t('copied', 'Copied!'))
        : formatMessage(t('copy', 'Copy')),
    [copiedState, formatMessage],
  );

  const noData = formatMessage(t('no-data', 'No data generated'));

  const resultsColumn = useMemo(() => {
    return (
      <CustomGridItem>
        <Box paddingLeft={4}>
          {loading && (
            <Flex direction="column" gap={8}>
              <Box>
                <SkeletonBox $width="120px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="60px" />
              </Box>
              <Box>
                <SkeletonBox $width="140px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="80px" />
              </Box>
              <Box>
                <SkeletonBox $width="100px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="40px" />
              </Box>
              <Box>
                <SkeletonBox $width="110px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="30px" />
              </Box>
              <Box>
                <SkeletonBox $width="150px" $height="16px" marginBottom={3} />
                <SkeletonBox $height="100px" />
              </Box>
            </Flex>
          )}

          {!loading && !result && (
            <Flex
              justifyContent="center"
              alignItems="center"
              style={{ height: '300px', border: '1px dashed #eaeaef', borderRadius: '8px' }}
            >
              <Typography textColor="neutral500">
                {formatMessage(t('placeholder', 'Metadata will appear here.'))}
              </Typography>
            </Flex>
          )}

          {result && !loading && (
            <Flex direction="column" alignItems="stretch" gap={6}>
              <PremiumCard background="neutral0" padding={5} hasRadius>
                <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                  <MetaLabel variant="pi" fontWeight="bold">
                    {formatMessage(t('meta-title', 'Meta Title'))}
                  </MetaLabel>
                  <CopyButton onClick={() => handleCopy(result.title, 'title')}>
                    {copyLabel('title')}
                  </CopyButton>
                </Flex>
                <Typography variant="epsilon" style={{ lineHeight: '1.5' }}>
                  {result.title || noData}
                </Typography>
              </PremiumCard>

              <PremiumCard background="neutral0" padding={5} hasRadius>
                <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                  <MetaLabel variant="pi" fontWeight="bold">
                    {formatMessage(t('meta-description', 'Meta Description'))}
                  </MetaLabel>
                  <CopyButton onClick={() => handleCopy(result.description, 'description')}>
                    {copyLabel('description')}
                  </CopyButton>
                </Flex>
                <Typography variant="epsilon" style={{ lineHeight: '1.5' }}>
                  {result.description || noData}
                </Typography>
              </PremiumCard>

              <PremiumCard background="neutral0" padding={5} hasRadius>
                <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                  <MetaLabel variant="pi" fontWeight="bold">
                    {formatMessage(t('keywords', 'Keywords'))}
                  </MetaLabel>
                  <CopyButton
                    onClick={() =>
                      handleCopy(
                        Array.isArray(result.keywords)
                          ? result.keywords.join(', ')
                          : result.keywords,
                        'keywords',
                      )
                    }
                  >
                    {copyLabel('keywords')}
                  </CopyButton>
                </Flex>
                <Typography variant="epsilon" style={{ lineHeight: '1.5' }}>
                  {Array.isArray(result.keywords)
                    ? result.keywords.join(', ')
                    : result.keywords || noData}
                </Typography>
              </PremiumCard>

              {result.metaRobots && (
                <PremiumCard background="neutral0" padding={5} hasRadius>
                  <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                    <MetaLabel variant="pi" fontWeight="bold">
                      {formatMessage(t('meta-robots', 'Meta Robots'))}
                    </MetaLabel>
                    <CopyButton onClick={() => handleCopy(result.metaRobots || '', 'metaRobots')}>
                      {copyLabel('metaRobots')}
                    </CopyButton>
                  </Flex>
                  <Typography variant="epsilon" style={{ lineHeight: '1.5' }}>
                    {result.metaRobots}
                  </Typography>
                </PremiumCard>
              )}

              {result.structuredData && (
                <PremiumCard background="neutral0" padding={5} hasRadius>
                  <Flex justifyContent="space-between" alignItems="center" marginBottom={3}>
                    <MetaLabel variant="pi" fontWeight="bold">
                      {formatMessage(t('structured-data', 'Structured Data (JSON-LD)'))}
                    </MetaLabel>
                    <CopyButton
                      onClick={() =>
                        handleCopy(JSON.stringify(result.structuredData, null, 2), 'structuredData')
                      }
                    >
                      {copyLabel('structuredData')}
                    </CopyButton>
                  </Flex>
                  <Box
                    background="neutral100"
                    padding={3}
                    hasRadius
                    style={{ overflowX: 'auto', maxHeight: '200px', fontSize: '12px' }}
                  >
                    <pre style={{ margin: 0, fontFamily: 'monospace' }}>
                      {JSON.stringify(result.structuredData, null, 2)}
                    </pre>
                  </Box>
                </PremiumCard>
              )}
            </Flex>
          )}
        </Box>
      </CustomGridItem>
    );
  }, [loading, result, copiedState, handleCopy, formatMessage, noData, copyLabel]);

  return (
    <Main>
      <Box padding={10} background="neutral0" minHeight="100vh">
        <Box maxWidth="1200px" margin="0 auto">
          <Box marginBottom={10}>
            <Typography variant="alpha" tag="h1" fontWeight="bold" style={{ letterSpacing: '-0.5px' }}>
              {formatMessage(t('title', 'SEO Metadata Generator'))}
            </Typography>
            <Box marginTop={3}>
              <Typography variant="epsilon" textColor="neutral600">
                {formatMessage(t('subtitle', 'Paste your content here to generate optimized SEO metadata & JSON-LD.'))}
              </Typography>
            </Box>
          </Box>

          <CustomGrid>
            <CustomGridItem>
              <Flex direction="column" alignItems="stretch" gap={6}>
                <Field.Root error={error || undefined}>
                  <Textarea
                    placeholder={formatMessage(t('textarea-placeholder', 'Enter your article or page content...'))}
                    value={content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setContent(e.target.value)
                    }
                    rows={16}
                    style={{ fontSize: '15px', lineHeight: '1.6', padding: '16px' }}
                  />
                  <Field.Error />
                </Field.Root>

                <Box>
                  <PremiumButton
                    onClick={handleGenerate}
                    loading={loading}
                    disabled={!content.trim()}
                    size="L"
                  >
                    {formatMessage(t('generate', 'Generate Metadata'))}
                  </PremiumButton>
                </Box>
              </Flex>
            </CustomGridItem>

            {resultsColumn}
          </CustomGrid>
        </Box>
      </Box>
    </Main>
  );
};

export { HomePage };
