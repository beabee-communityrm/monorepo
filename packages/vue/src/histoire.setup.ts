import '@beabee/vue/lib/theme';
import '@beabee/vue/styles';

import {
  faCheck,
  faEye,
  faSave,
  faSpinner,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { defineSetupVue3 } from '@histoire/plugin-vue';

import { i18n } from './lib/i18n';
import { icons, library } from './plugins/icons';

export const setupVue3 = defineSetupVue3(({ app }) => {
  library.add(faEye, faSave, faUpload, faCheck, faSpinner);
  app.use(icons);
  app.use(i18n);
});
