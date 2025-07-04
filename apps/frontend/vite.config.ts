import theme from '@beabee/vue/plugins/theme';

import vueI18n from '@intlify/unplugin-vue-i18n/vite';
// TODO: Replace with https://github.com/posva/unplugin-vue-router as recommended by `vite-plugin-pages` itself
import replace from '@rollup/plugin-replace';
import vue from '@vitejs/plugin-vue';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import pages from 'vite-plugin-pages';

const require = createRequire(import.meta.url);
const LOCALE_PATH = resolve(
  dirname(require.resolve('@beabee/locale/package.json')),
  'src/locales'
);

export default ({ command, mode }) => {
  const env = loadEnv(mode, resolve(process.cwd(), '../../'), '');

  const plugins: Plugin[] = [
    vue(),
    vueI18n({
      include: LOCALE_PATH,
      strictMessage: false,
    }) as Plugin,
    theme(),
    pages(),
  ];

  // Keep this in sync with tsconfig.json -> compilerOptions.paths
  const alias = {
    '@components/': `${resolve(__dirname, './src/components')}/`,
    '@layouts/': `${resolve(__dirname, './src/layouts')}/`,
    '@lib/': `${resolve(__dirname, './src/lib')}/`,
    '@pages/': `${resolve(__dirname, './src/pages')}/`,
    '@store/': `${resolve(__dirname, './src/store')}/`,
    '@type/': `${resolve(__dirname, './src/type')}/`,
    '@utils/': `${resolve(__dirname, './src/utils')}/`,
    '@enums/': `${resolve(__dirname, './src/enums')}/`,

    '@components': `${resolve(__dirname, './src/components/index')}`,
    '@layouts': `${resolve(__dirname, './src/layouts/index')}`,
    '@lib': `${resolve(__dirname, './src/lib/index')}`,
    '@pages': `${resolve(__dirname, './src/pages/index')}`,
    '@store': `${resolve(__dirname, './src/store/index')}`,
    '@type': `${resolve(__dirname, './src/type/index')}`,
    '@utils': `${resolve(__dirname, './src/utils/index')}`,
    '@enums': `${resolve(__dirname, './src/enums/index')}`,

    '@env': `${resolve(__dirname, './src/env')}`,
    '@assets': `${resolve(__dirname, './src/assets')}`,
  };

  /*
   * Use environment variables when developing locally
   * On production, the environment variables are replaced in the Dockerfile on each request using `./docker-entrypoint.sh`.
   * Keep this in sync with the placeholders in `./docker-entrypoint.sh`.
   */
  if (command === 'serve') {
    plugins.push(
      replace({
        values: {
          // In Docker this is the router application URL
          // In Vite this is the Vite dev server URL with hot module reloading
          // and proxy API requests to the router application URL
          __appUrl__: `http://localhost:${env.VITE_DEV_SERVER_PORT}`,
          __apiUrl__: '/api/1.0/',
          __revision__: env.REVISION || 'dev',
          __version__: env.VERSION || 'dev',
          __appsignalKey__: env.BEABEE_APPSIGNAL_KEY || '',
          __captchafoxKey__: env.BEABEE_CAPTCHAFOX_KEY || '',
          __maptilerKey__: env.BEABEE_MAPTILER_KEY || '',
          __cnrMode__: env.BEABEE_CNR_MODE || '',
          __experimentalFeatures__: env.BEABEE_EXPERIMENTAL_FEATURES || '',
        },
        preventAssignment: true,
      }) as Plugin
    );
  }

  return defineConfig({
    clearScreen: false,
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
    resolve: {
      alias,
    },
    plugins,
    server: {
      port: Number(env.VITE_DEV_SERVER_PORT || 3000),
      // Proxy API requests to the backend
      proxy: {
        '^/(api|login|favicon.png)': {
          target: env.BEABEE_AUDIENCE || 'http://localhost:3002',
          changeOrigin: true,
          cookieDomainRewrite: 'localhost',
        },
      },
    },
  });
};
