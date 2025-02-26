import './style.css';
import { defineSetupVue3 } from '@histoire/plugin-vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUser, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

library.add(faUser, faCircleNotch);

export const setupVue3 = defineSetupVue3(({ app }) => {
  app.component('font-awesome-icon', FontAwesomeIcon);
});
