import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import ui from '@nuxt/ui/vite';
import vue from '@vitejs/plugin-vue';
import path, { resolve } from 'path';
import { defineConfig } from 'vite';

import { nuxtUiConfig } from './src/lib/nuxt-ui.config';

export default defineConfig({
  plugins: [
    ui(nuxtUiConfig),
    vue(),
    vueI18n({
      include: path.resolve(__dirname, './locales/*'),
      strictMessage: false,
    }),
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
        '@fortawesome/free-regular-svg-icons',
        '@fortawesome/free-brands-svg-icons',
      ],
      output: {
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          '@fortawesome/vue-fontawesome': 'VueFontawesome',
          '@fortawesome/fontawesome-svg-core': 'FontawesomeSvgCore',
          '@fortawesome/free-solid-svg-icons': 'freeSolidSvgIcons',
          '@fortawesome/free-regular-svg-icons': 'freeRegularSvgIcons',
          '@fortawesome/free-brands-svg-icons': 'freeBrandsSvgIcons',
        },
      },
    },
  },
});
