import '@beabee/vue/lib/theme';
import '@beabee/vue/styles';

import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { defineSetupVue3 } from '@histoire/plugin-vue';

import { i18n } from './lib/i18n';
import { icons, library } from './plugins/icons';

export const setupVue3 = defineSetupVue3(({ app }) => {
  // Full icon sets for AppIconPicker and other stories that need arbitrary icons from search
  library.add(fas);
  library.add(far);
  library.add(fab);

  app.use(icons);
  app.use(i18n);
});
