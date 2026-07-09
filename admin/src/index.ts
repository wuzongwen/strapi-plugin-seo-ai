import SeoSidebarWidget from './components/SeoSidebarWidget';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon } from './components/PluginIcon';

interface StrapiApp {
  addMenuLink: (link: Record<string, unknown>) => void;
  getPlugin: (pluginId: string) => {
    injectComponent: (
      view: string,
      zone: string,
      options: { name: string; Component: React.ComponentType | (() => JSX.Element) },
    ) => void;
  } | undefined;
}

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: 'SEO AI',
      },
      Component: async () => {
        const { HomePage } = await import('./pages/HomePage');
        return HomePage;
      },
      permissions: [],
    });

    const contentManagerPlugin = app.getPlugin('content-manager');
    if (contentManagerPlugin) {
      contentManagerPlugin.injectComponent('editView', 'right-links', {
        name: 'seo-ai-sidebar',
        Component: SeoSidebarWidget,
      });
    }
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      }),
    );
  },
};
