import { Core } from '@strapi/strapi';
export interface GenerateRequestCtx {
    request: {
        body: {
            content?: string;
            metadata?: Record<string, unknown>;
        };
    };
    badRequest: (message: string) => void;
    internalServerError: (message: string) => void;
    body: unknown;
}
declare const controller: ({ strapi }: {
    strapi: Core.Strapi;
}) => {
    /**
     * Generates AI-powered SEO metadata based on provided content.
     */
    generate(ctx: GenerateRequestCtx): Promise<void>;
    /**
     * Health-check / index endpoint for the content-api.
     */
    index(ctx: GenerateRequestCtx): Promise<void>;
};
export default controller;
