declare const _default: {
    service: ({ strapi }: {
        strapi: Core.Strapi;
    }) => {
        generateSeo(content: string, metadata?: Record<string, unknown>): Promise<import('./providers/openai-compatible').SeoGenerationResult>;
    };
};
export default _default;
