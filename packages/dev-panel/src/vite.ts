import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

/** Options for the dev panel's Vite plugin */
export interface DevPanelOptions {
  /** Whether to add the panel to the page */
  enabled: boolean;
  /** The path API requests start with, like "/api/1.0/" */
  apiPath: string;
  /** The absolute path of the stylesheet that imports Tailwind, so it also
   * generates the panel's classes */
  stylesheet: string;
}

const src = fileURLToPath(new URL('.', import.meta.url));

/**
 * Adds the dev panel to the page, on the dev server only. A production build
 * never runs this plugin, so the panel can't end up in it.
 */
export function devPanel({
  enabled,
  apiPath,
  stylesheet,
}: DevPanelOptions): Plugin {
  return {
    name: 'beabee-dev-panel',
    apply: 'serve',
    enforce: 'pre',
    transform(code, id) {
      if (enabled && id.split('?')[0] === stylesheet) {
        return `${code}\n@source '${src}';\n`;
      }
    },
    transformIndexHtml: {
      order: 'pre',
      handler() {
        if (!enabled) return;
        return [
          {
            tag: 'script',
            attrs: { type: 'module' },
            children: `import { start } from '@beabee/dev-panel/client';\nstart(${JSON.stringify(apiPath)});`,
            injectTo: 'head-prepend',
          },
        ];
      },
    },
  };
}
