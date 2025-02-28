import { type Library, library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faUser, faCircleNotch } from '@fortawesome/free-solid-svg-icons';

import type { App } from 'vue';

export const icons = {
  install(app: App): Library {
    library.add(faUser, faCircleNotch);

    app.component('FontAwesomeIcon', FontAwesomeIcon);

    return library;
  },
};

export { library };
