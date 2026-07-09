import type { Core } from '@strapi/strapi';

export interface GenerateRequestCtx {
  request: {
    body: {
      content?: string;
    };
  };
  badRequest: (message: string) => void;
  internalServerError: (message: string) => void;
  body: unknown;
}

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  /**
   * Generates AI-powered SEO metadata based on provided content.
   */
  async generate(ctx: GenerateRequestCtx) {
    const { content } = ctx.request.body;

    if (!content) {
      return ctx.badRequest('Content is required');
    }

    try {
      const result = await strapi
        .plugin('strapi-plugin-seo-ai')
        .service('service')
        .generateSeo(content);

      ctx.body = { data: result };
    } catch (error: unknown) {
      ctx.internalServerError(error instanceof Error ? error.message : String(error));
    }
  },

  /**
   * Health-check / index endpoint for the content-api.
   */
  async index(ctx: GenerateRequestCtx) {
    ctx.body = { status: 'ok', plugin: 'strapi-plugin-seo-ai' };
  },
});

export default controller;
