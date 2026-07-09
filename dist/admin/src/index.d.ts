interface StrapiApp {
    addMenuLink: (link: Record<string, unknown>) => void;
    getPlugin: (pluginId: string) => {
        injectComponent: (view: string, zone: string, options: {
            name: string;
            Component: React.ComponentType | (() => JSX.Element);
        }) => void;
    } | undefined;
}
declare const _default: {
    register(app: StrapiApp): void;
    registerTrads({ locales }: {
        locales: string[];
    }): Promise<{
        data: any;
        locale: string;
    }[]>;
};
export default _default;
