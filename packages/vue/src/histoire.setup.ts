import '@beabee/vue/lib/theme';
import '@beabee/vue/styles';
import { defineSetupVue3 } from '@histoire/plugin-vue';
import { icons, library } from './plugins/icons';
import { i18n } from './lib/i18n';

import {
  faEye,
  faSave,
  faUpload,
  faCheck,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

export const setupVue3 = defineSetupVue3(({ app }) => {
  library.add(faEye, faSave, faUpload, faCheck, faSpinner);
  app.use(icons);
  app.use(i18n);
});
