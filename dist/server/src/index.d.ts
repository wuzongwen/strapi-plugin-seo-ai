import { default as config } from './config';
declare const _default: {
    register: ({ strapi }: {
        strapi: config;
    }) => void;
    bootstrap: ({ strapi }: {
        strapi: config;
    }) => void;
    destroy: ({ strapi }: {
        strapi: config;
    }) => void;
    config: any;
    controllers: any;
    routes: any;
    services: any;
    contentTypes: any;
    policies: any;
    middlewares: any;
};
export default _default;
