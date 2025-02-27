import '@beabee/vue/lib/theme';
import '@beabee/vue/styles';
import { defineSetupVue3 } from '@histoire/plugin-vue';
import { icons } from './plugins/icons';

export const setupVue3 = defineSetupVue3(({ app }) => {
  app.use(icons);
});
