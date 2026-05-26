import { HstVue } from '@histoire/plugin-vue';
import { defineConfig } from 'histoire';

export default defineConfig({
  plugins: [HstVue()],
  setupFile: '/src/histoire.setup.ts',
  theme: {
    title: 'Beabee Vue Components',
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          globals: {
            '@fortawesome/free-solid-svg-icons': 'freeSolidSvgIcons',
            '@fortawesome/free-regular-svg-icons': 'freeRegularSvgIcons',
            '@fortawesome/free-brands-svg-icons': 'freeBrandsSvgIcons',
          },
        },
      },
    },
  },
});
