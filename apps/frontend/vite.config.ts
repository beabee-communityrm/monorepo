import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import pages from 'vite-plugin-pages'; // TODO: Replace with https://github.com/posva/unplugin-vue-router as recommended by `vite-plugin-pages` itself
import replace from '@rollup/plugin-replace';

import theme from './plugins/theme';

const PORT = 3000;
const FRONTEND_APP_URL = `http://localhost:${PORT}`;

export default ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const plugins = [
    vue(),
    vueI18n({
      include: path.resolve(__dirname, './locales/*'),
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

  // Use environment variables when developing locally
  if (command === 'serve') {
    plugins.push(
      replace({
        values: {
          __appUrl__: FRONTEND_APP_URL,
          __apiUrl__: env.API_BASE_URL,
          __revision__: 'dev',
          __version__: 'dev',
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
      sourcemap: true,
    },
    resolve: {
      alias,
    },
    plugins,
    server: {
      port: PORT,
    },
    // Useful for linking beabee-common locally
    ...(command === 'serve' && {
      optimizeDeps: {
        exclude: ['@beabee/beabee-common'],
      },
    }),
  });
};
