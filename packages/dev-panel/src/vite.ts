import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
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

const WORKER_PATH = '/mockServiceWorker.js';

/** Replaces a worker left registered from when the panel was on, then
 * removes itself, so nothing sits between the frontend and the API */
const REMOVE_WORKER = `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.registration.unregister());
`;

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
    configureServer(server) {
      const worker = enabled
        ? readFileSync(
            createRequire(import.meta.url).resolve('msw/mockServiceWorker.js'),
            'utf8'
          )
        : REMOVE_WORKER;
      server.middlewares.use(WORKER_PATH, (_req, res) => {
        res.setHeader('Content-Type', 'text/javascript');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(worker);
      });
    },
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
