declare const _default: {
    service: ({ strapi }: {
        strapi: Core.Strapi;
    }) => {
        generateSeo(content: string): Promise<import('./providers/openai-compatible').SeoGenerationResult>;
    };
};
export default _default;
