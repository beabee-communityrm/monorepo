import { createApp } from 'vue';

import App from './App.vue';

import { i18n } from './lib/i18n';
import router from './lib/router';

import '@beabee/vue/lib/theme';
import { icons } from '@beabee/vue/plugins/icons';

import '@iframe-resizer/child';

import './index.css';

import { init as initErrorHandler } from './lib/appsignal';

const app = createApp(App);
initErrorHandler(app);

app.use({ ...router });
app.use(i18n);
app.use(icons);

app.mount('#app');
