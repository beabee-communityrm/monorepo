import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import pages from 'vite-plugin-pages'; // TODO: Replace with https://github.com/posva/unplugin-vue-router as recommended by `vite-plugin-pages` itself
import replace from '@rollup/plugin-replace';

import theme from '@beabee/vue/plugins/theme';

export default ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const plugins = [
    vue(),
    vueI18n({
      include: path.resolve(
        __dirname,
        '../../packages/locale/dist/esm/locales/*'
      ),
      strictMessage: false,
    }),
    theme(),
    pages(),
  ];

  // Keep this in sync with tsconfig.json -> compilerOptions.paths
  const alias = {
    '@components/': `${path.resolve(__dirname, './src/components')}/`,
    '@layouts/': `${path.resolve(__dirname, './src/layouts')}/`,
    '@lib/': `${path.resolve(__dirname, './src/lib')}/`,
    '@pages/': `${path.resolve(__dirname, './src/pages')}/`,
    '@store/': `${path.resolve(__dirname, './src/store')}/`,
    '@type/': `${path.resolve(__dirname, './src/type')}/`,
    '@utils/': `${path.resolve(__dirname, './src/utils')}/`,
    '@enums/': `${path.resolve(__dirname, './src/enums')}/`,

    '@components': `${path.resolve(__dirname, './src/components/index')}`,
    '@layouts': `${path.resolve(__dirname, './src/layouts/index')}`,
    '@lib': `${path.resolve(__dirname, './src/lib/index')}`,
    '@pages': `${path.resolve(__dirname, './src/pages/index')}`,
    '@store': `${path.resolve(__dirname, './src/store/index')}`,
    '@type': `${path.resolve(__dirname, './src/type/index')}`,
    '@utils': `${path.resolve(__dirname, './src/utils/index')}`,
    '@enums': `${path.resolve(__dirname, './src/enums/index')}`,

    '@env': `${path.resolve(__dirname, './src/env')}`,
    '@assets': `${path.resolve(__dirname, './src/assets')}`,
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
          __apiUrl__: env.API_BASE_URL,
          __revision__: env.REVISION || 'dev',
          __version__: env.VERSION || 'dev',
          __appsignalKey__: env.APPSIGNAL_KEY || '',
          __captchafoxKey__: env.CAPTCHAFOX_KEY || '',
          __maptilerKey__: env.MAPTILER_KEY || '',
          __cnrMode__: env.CNR_MODE || '',
          __experimentalFeatures__: env.EXPERIMENTAL_FEATURES || '',
        },
        preventAssignment: true,
      })
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
          target: env.APP_BASE_URL,
          changeOrigin: true,
          cookieDomainRewrite: 'localhost',
        },
      },
    },
    // Useful for linking beabee-common locally
    ...(command === 'serve' && {
      optimizeDeps: {
        exclude: ['@beabee/beabee-common'],
      },
    }),
  });
};
