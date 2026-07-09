declare const _default: {
    controller: ({ strapi }: {
        strapi: Core.Strapi;
    }) => {
        generate(ctx: import('./controller').GenerateRequestCtx): Promise<void>;
        index(ctx: import('./controller').GenerateRequestCtx): Promise<void>;
    };
};
export default _default;
