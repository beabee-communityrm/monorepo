import { createApp } from 'vue';

import App from './App.vue';

import i18n from './lib/i18n';
import router from './lib/router';

import './lib/theme';

import 'iframe-resizer/js/iframeResizer.contentWindow';

import './index.css';

// fontawesome icons imports
import Icons from './plugins/icons';
import { init as initErrorHandler } from './lib/appsignal';

const app = createApp(App);
initErrorHandler(app);

app.use({ ...router });
app.use(i18n);

// icons
app.use(Icons);

app.mount('#app');
