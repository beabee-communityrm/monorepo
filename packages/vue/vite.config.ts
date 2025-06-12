import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import vue from '@vitejs/plugin-vue';
import path, { resolve } from 'path';
import { defineConfig } from 'vite';

import theme from './src/plugins/theme';

export default defineConfig({
  plugins: [
    vue(),
    vueI18n({
      include: path.resolve(__dirname, './locales/*'),
      strictMessage: false,
    }),
    theme(),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BeabeeVue',
      fileName: 'index',
    },
    rollupOptions: {
      external: [
        'vue',
        'vue-router',
        '@fortawesome/vue-fontawesome',
        '@fortawesome/fontawesome-svg-core',
        '@fortawesome/free-solid-svg-icons',
      ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
