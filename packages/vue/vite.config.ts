import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import ui from '@nuxt/ui/vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import path, { resolve } from 'path';
import { defineConfig } from 'vite';

import { nuxtUiOptions } from './src/lib/nuxt-ui-options';

export default defineConfig({
  plugins: [
    tailwindcss(),
    vue(),
    ui(nuxtUiOptions),
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
        '@nuxt/ui',
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
